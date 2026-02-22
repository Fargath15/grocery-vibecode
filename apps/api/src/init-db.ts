import { prisma } from "./db.js";

const seedItems = [
  {
    name: "Organic Bananas",
    sku: "FR-BA-001",
    category: "Fresh Produce",
    subcategory: "Fruits",
    description: "Naturally sweet bananas from certified organic farms.",
    imageUrl: "https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 1.99,
    quantity: 120,
    lowStockThreshold: 25
  },
  {
    name: "Baby Spinach",
    sku: "FR-VE-011",
    category: "Fresh Produce",
    subcategory: "Leafy Greens",
    description: "Washed and ready to toss into salads.",
    imageUrl: "https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 3.49,
    quantity: 80,
    lowStockThreshold: 20
  },
  {
    name: "Whole Wheat Bread",
    sku: "BA-BR-102",
    category: "Bakery",
    subcategory: "Breads",
    description: "Soft whole wheat loaf baked daily.",
    imageUrl: "https://images.pexels.com/photos/1756061/pexels-photo-1756061.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 4.25,
    quantity: 60,
    lowStockThreshold: 15
  },
  {
    name: "Greek Yogurt",
    sku: "DA-YO-208",
    category: "Dairy",
    subcategory: "Yogurt",
    description: "Protein-rich plain Greek yogurt.",
    imageUrl: "https://images.pexels.com/photos/5946720/pexels-photo-5946720.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 5.2,
    quantity: 70,
    lowStockThreshold: 15
  },
  {
    name: "Cheddar Cheese",
    sku: "DA-CH-302",
    category: "Dairy",
    subcategory: "Cheese",
    description: "Sharp aged cheddar block.",
    imageUrl: "https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 6.75,
    quantity: 55,
    lowStockThreshold: 10
  },
  {
    name: "Sparkling Water",
    sku: "BE-SP-451",
    category: "Beverages",
    subcategory: "Water",
    description: "Zero-calorie sparkling mineral water.",
    imageUrl: "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 1.5,
    quantity: 200,
    lowStockThreshold: 40
  },
  {
    name: "Cold Brew Coffee",
    sku: "BE-CO-499",
    category: "Beverages",
    subcategory: "Coffee",
    description: "Smooth bottled cold brew.",
    imageUrl: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 3.95,
    quantity: 90,
    lowStockThreshold: 20
  },
  {
    name: "Salted Almonds",
    sku: "SN-NU-602",
    category: "Snacks",
    subcategory: "Nuts",
    description: "Roasted almonds with sea salt.",
    imageUrl: "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 7.1,
    quantity: 85,
    lowStockThreshold: 20
  },
  {
    name: "Potato Chips",
    sku: "SN-CH-618",
    category: "Snacks",
    subcategory: "Chips",
    description: "Crisp kettle-cooked potato chips.",
    imageUrl: "https://images.pexels.com/photos/568805/pexels-photo-568805.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 2.99,
    quantity: 140,
    lowStockThreshold: 30
  },
  {
    name: "Tomato Pasta Sauce",
    sku: "PA-SA-704",
    category: "Pantry",
    subcategory: "Sauces",
    description: "Slow-cooked tomato basil pasta sauce.",
    imageUrl: "https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 4.8,
    quantity: 110,
    lowStockThreshold: 25
  },
  {
    name: "Basmati Rice",
    sku: "PA-RI-733",
    category: "Pantry",
    subcategory: "Grains",
    description: "Long-grain aromatic basmati rice.",
    imageUrl: "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 11.99,
    quantity: 75,
    lowStockThreshold: 15
  },
  {
    name: "Dark Chocolate Bar",
    sku: "SN-CH-882",
    category: "Snacks",
    subcategory: "Chocolate",
    description: "72% dark chocolate with cocoa nibs.",
    imageUrl: "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1600",
    price: 3.6,
    quantity: 95,
    lowStockThreshold: 20
  }
];

async function main() {
  for (const item of seedItems) {
    await prisma.item.upsert({
      where: { sku: item.sku },
      create: item,
      update: item
    });
  }

  console.log(`Seeded ${seedItems.length} storefront items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
