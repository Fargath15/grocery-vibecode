import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { z } from "zod";
import { prisma } from "./db.js";
import { logError, logInfo, logWarn, requestLogger } from "./logger.js";
import { formatError, safeNumber } from "./utils.js";

process.on("unhandledRejection", (reason) => {
  logError("process:unhandled-rejection", reason);
});

process.on("uncaughtException", (error) => {
  logError("process:uncaught-exception", error);
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const TRACKING_STEPS = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
] as const;

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerMobile: z.string().min(7),
  billingAddress: z.string().min(5),
  shippingAddress: z.string().min(5),
  paymentMethod: z.enum(["CARD", "UPI", "BANK_TRANSFER", "COD"]),
  items: z.array(
    z.object({
      itemId: z.number().int().positive(),
      quantity: z.number().int().positive()
    })
  ).min(1)
});

const seedItemSchema = z.array(
  z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    category: z.string().min(1),
    subcategory: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    price: z.number().positive(),
    quantity: z.number().int().nonnegative(),
    lowStockThreshold: z.number().int().nonnegative().default(10)
  })
);

const markReadSchema = z.object({
  read: z.boolean().default(true)
});

const storeItemsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  subcategory: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().min(1).max(100).default(12)
});

const popularItemsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().min(1).max(100).default(8)
});

const emailQuerySchema = z.object({
  email: z.string().trim().email()
});

type CheckoutInput = z.infer<typeof checkoutSchema>;
type SeedInput = z.infer<typeof seedItemSchema>;

function customerRoom(email: string) {
  return `customer:${email.toLowerCase()}`;
}

function readQueryString(input: unknown): string | undefined {
  const parsed = z.union([z.string(), z.array(z.string())]).safeParse(input);
  if (!parsed.success) {
    return undefined;
  }
  const value = Array.isArray(parsed.data) ? parsed.data[0] : parsed.data;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function pushNotification(input: {
  customerEmail?: string;
  orderId?: number;
  type: string;
  message: string;
}) {
  const created = await prisma.notification.create({
    data: {
      customerEmail: input.customerEmail,
      orderId: input.orderId,
      type: input.type,
      message: input.message
    }
  });

  if (input.customerEmail) {
    io.to(customerRoom(input.customerEmail)).emit("notification:new", created);
  } else {
    io.emit("notification:new", created);
  }

  return created;
}

async function recordTracking(orderId: number, status: string, note: string) {
  const event = await prisma.orderTrackingEvent.create({
    data: {
      orderId,
      status,
      note
    }
  });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order?.customerEmail) {
    io.to(customerRoom(order.customerEmail)).emit("order:tracking", {
      orderId,
      status,
      note,
      createdAt: event.createdAt
    });
  }

  return event;
}

io.on("connection", (socket) => {
  const email = readQueryString(socket.handshake.query.email)?.toLowerCase() ?? "";
  if (email) {
    socket.join(customerRoom(email));
    logInfo("socket:join-room", { socketId: socket.id, room: customerRoom(email) });
  } else {
    logWarn("socket:missing-email", { socketId: socket.id });
  }

  socket.on("disconnect", (reason) => {
    logInfo("socket:disconnect", { socketId: socket.id, reason });
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/store/carousel", (_req, res) => {
  res.json([
    {
      id: 1,
      imageUrl: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=2000",
      title: "Fresh Picks Every Morning",
      subtitle: "Farm-fresh produce delivered to your door"
    },
    {
      id: 2,
      imageUrl: "https://images.pexels.com/photos/616401/pexels-photo-616401.jpeg?auto=compress&cs=tinysrgb&w=2000",
      title: "Weekly Pantry Deals",
      subtitle: "Stock up on essentials with curated bundles"
    },
    {
      id: 3,
      imageUrl: "https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=2000",
      title: "Snacks, Drinks, More",
      subtitle: "Everything you need for fast checkout"
    }
  ]);
});

app.get("/store/categories", async (_req, res) => {
  const rows = await prisma.item.findMany({
    select: { category: true, subcategory: true },
    distinct: ["category", "subcategory"],
    orderBy: [{ category: "asc" }, { subcategory: "asc" }]
  });

  const grouped = rows.reduce<Record<string, string[]>>((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = [];
    }
    acc[row.category].push(row.subcategory);
    return acc;
  }, {});

  res.json(grouped);
});

app.get("/store/items", async (req, res) => {
  const parsed = storeItemsQuerySchema.safeParse({
    category: readQueryString(req.query.category),
    subcategory: readQueryString(req.query.subcategory),
    q: readQueryString(req.query.q),
    offset: readQueryString(req.query.offset),
    limit: readQueryString(req.query.limit)
  });

  if (!parsed.success) {
    res.status(400).json(formatError(parsed.error));
    return;
  }

  const { category, subcategory, q, offset, limit } = parsed.data;

  const where = {
    ...(category ? { category } : {}),
    ...(subcategory ? { subcategory } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.item.count({ where })
  ]);

  res.json({ items, total, offset, limit, hasMore: offset + items.length < total });
});

app.get("/store/popular-items", async (req, res) => {
  const parsed = popularItemsQuerySchema.safeParse({
    offset: readQueryString(req.query.offset),
    limit: readQueryString(req.query.limit)
  });
  if (!parsed.success) {
    res.status(400).json(formatError(parsed.error));
    return;
  }

  const { offset, limit } = parsed.data;

  const grouped = await prisma.orderItem.groupBy({
    by: ["itemId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } }
  });

  const total = grouped.length;
  const sliced = grouped.slice(offset, offset + limit);
  const ids = sliced.map((x) => x.itemId);
  const items = ids.length > 0
    ? await prisma.item.findMany({ where: { id: { in: ids } } })
    : [];

  const itemMap = new Map(items.map((item) => [item.id, item]));
  const result = sliced
    .map((entry) => {
      const item = itemMap.get(entry.itemId);
      if (!item) return null;
      return {
        ...item,
        orderedCount: entry._sum.quantity ?? 0
      };
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  res.json({ items: result, total, offset, limit, hasMore: offset + result.length < total });
});

app.post("/orders/checkout", async (req, res) => {
  try {
    const data: CheckoutInput = checkoutSchema.parse(req.body);
    const created = await prisma.$transaction(async (tx) => {
      let total = 0;
      const lines: Array<{ itemId: number; quantity: number; unitPrice: number; itemName: string }> = [];

      for (const line of data.items) {
        const item = await tx.item.findUnique({ where: { id: line.itemId } });
        if (!item) {
          throw new Error(`Item ${line.itemId} not found`);
        }
        if (item.quantity < line.quantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }

        lines.push({
          itemId: item.id,
          quantity: line.quantity,
          unitPrice: item.price,
          itemName: item.name
        });
        total += item.price * line.quantity;
      }

      const order = await tx.order.create({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail.toLowerCase(),
          customerMobile: data.customerMobile,
          billingAddress: data.billingAddress,
          shippingAddress: data.shippingAddress,
          paymentMethod: data.paymentMethod,
          paymentStatus: "PAID",
          trackingStatus: "PLACED",
          total
        }
      });

      for (const line of lines) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice
          }
        });

        await tx.item.update({
          where: { id: line.itemId },
          data: { quantity: { decrement: line.quantity } }
        });
      }

      await tx.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          status: "PLACED",
          note: "Order placed and payment captured"
        }
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: {
          orderItems: { include: { item: true } },
          trackingEvents: { orderBy: { createdAt: "asc" } }
        }
      });
    });

    await pushNotification({
      customerEmail: created.customerEmail,
      orderId: created.id,
      type: "ORDER_CREATED",
      message: `Order #${created.id} confirmed. We have started processing it.`
    });

    res.status(201).json(created);
  } catch (error) {
    logError("checkout:failed", error, { body: req.body });
    res.status(400).json(formatError(error));
  }
});

app.get("/orders", async (req, res) => {
  const parsed = emailQuerySchema.safeParse({
    email: readQueryString(req.query.email)
  });
  if (!parsed.success) {
    res.status(400).json(formatError(parsed.error));
    return;
  }
  const { email } = parsed.data;

  const orders = await prisma.order.findMany({
    where: { customerEmail: email },
    include: {
      orderItems: { include: { item: true } },
      trackingEvents: { orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(orders);
});

app.get("/orders/:id/tracking", async (req, res) => {
  const id = safeNumber(req.params.id, NaN);
  const order = await prisma.order.findUnique({
    where: { id },
    include: { trackingEvents: { orderBy: { createdAt: "asc" } } }
  });

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json({
    orderId: order.id,
    trackingStatus: order.trackingStatus,
    events: order.trackingEvents
  });
});

app.get("/notifications", async (req, res) => {
  const parsed = emailQuerySchema.safeParse({
    email: readQueryString(req.query.email)
  });
  if (!parsed.success) {
    res.status(400).json(formatError(parsed.error));
    return;
  }
  const { email } = parsed.data;

  const notifications = await prisma.notification.findMany({
    where: { customerEmail: email },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  res.json(notifications);
});

app.patch("/notifications/:id/read", async (req, res) => {
  try {
    const id = safeNumber(req.params.id, NaN);
    const body = markReadSchema.parse(req.body);
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: body.read }
    });
    res.json(notification);
  } catch (error) {
    logError("notification:mark-read-failed", error, { notificationId: req.params.id });
    res.status(400).json(formatError(error));
  }
});

app.post("/admin/seed-items", async (req, res) => {
  try {
    const data: SeedInput = seedItemSchema.parse(req.body);
    const created = await prisma.$transaction(
      data.map((item) => prisma.item.upsert({
        where: { sku: item.sku },
        create: item,
        update: item
      }))
    );
    res.status(201).json(created);
  } catch (error) {
    logError("seed-items:failed", error);
    res.status(400).json(formatError(error));
  }
});

let trackingTickActive = false;
setInterval(async () => {
  if (trackingTickActive) {
    return;
  }

  trackingTickActive = true;
  try {
    const candidates = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        NOT: { trackingStatus: "DELIVERED" }
      },
      orderBy: { updatedAt: "asc" },
      take: 20
    });

    for (const order of candidates) {
      const index = TRACKING_STEPS.indexOf(order.trackingStatus as (typeof TRACKING_STEPS)[number]);
      if (index < 0 || index >= TRACKING_STEPS.length - 1) {
        continue;
      }

      const nextStatus = TRACKING_STEPS[index + 1];
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { trackingStatus: nextStatus }
      });

      logInfo("tracking:status-updated", {
        orderId: updated.id,
        previousStatus: order.trackingStatus,
        nextStatus
      });

      await recordTracking(updated.id, nextStatus, `Order moved to ${nextStatus.replaceAll("_", " ")}`);
      await pushNotification({
        customerEmail: updated.customerEmail,
        orderId: updated.id,
        type: "ORDER_TRACKING",
        message: `Order #${updated.id} is now ${nextStatus.replaceAll("_", " ")}.`
      });
    }
  } catch (error) {
    logError("tracking:tick-failed", error);
  } finally {
    trackingTickActive = false;
  }
}, 30000);

const port = safeNumber(process.env.PORT ?? "4000", 4000);
httpServer.listen(port, () => {
  logInfo("server:started", { url: `http://localhost:${port}` });
});
