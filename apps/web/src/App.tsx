import { FormEvent, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  API_BASE,
  CarouselSlide,
  NotificationRecord,
  OrderRecord,
  PopularItem,
  StoreItem,
  checkout,
  getCarouselSlides,
  getCategories,
  getMyOrders,
  getNotifications,
  getPopularItems,
  getStoreItems,
  markNotificationRead
} from "./api";
import { Language, departmentsByLanguage, statusText, t, td, translateNotification } from "./i18n";

type Page = "home" | "about" | "cart" | "orders" | "saved";
type CartLine = { item: StoreItem; quantity: number };
type SortBy = "featured" | "priceAsc" | "priceDesc" | "nameAsc";

type CheckoutForm = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  billingAddress: string;
  shippingAddress: string;
  sameAsBilling: boolean;
  paymentMethod: "CARD" | "UPI" | "BANK_TRANSFER" | "COD";
};

type CheckoutErrors = Partial<Record<"customerName" | "customerEmail" | "customerMobile" | "billingAddress" | "shippingAddress", string>>;

const INITIAL_FORM: CheckoutForm = {
  customerName: "",
  customerEmail: "",
  customerMobile: "",
  billingAddress: "",
  shippingAddress: "",
  sameAsBilling: false,
  paymentMethod: "CARD"
};

const ITEM_PAGE_SIZE = 12;
const POPULAR_PAGE_SIZE = 8;
const PRODUCT_FALLBACK_IMAGE = "https://picsum.photos/seed/product-fallback/900/700";
const HERO_FALLBACK_IMAGE = "https://picsum.photos/seed/hero-fallback/1400/600";

export default function App() {
  const [language, setLanguage] = useState<Language>((localStorage.getItem("lang") as Language) || "en");
  const [page, setPage] = useState<Page>("home");
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [openCategory, setOpenCategory] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("featured");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [toast, setToast] = useState<string>("");

  const [items, setItems] = useState<StoreItem[]>([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [itemsOffset, setItemsOffset] = useState(0);
  const [itemsHasMore, setItemsHasMore] = useState(false);

  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [popularOffset, setPopularOffset] = useState(0);
  const [popularHasMore, setPopularHasMore] = useState(false);

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutErrors>({});

  const [customerEmail, setCustomerEmail] = useState<string>(localStorage.getItem("customerEmail") ?? "");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [socketStatus, setSocketStatus] = useState("offline");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const formatter = useMemo(
    () => new Intl.NumberFormat(language === "ta" ? "ta-IN" : "en-US", { style: "currency", currency: "USD" }),
    [language]
  );
  const labels = useMemo(() => ({
    deliverTo: t(language, "deliver_to"),
    country: t(language, "country"),
    allCategories: t(language, "all_categories"),
    searchPlaceholder: t(language, "search_placeholder"),
    search: t(language, "search"),
    about: t(language, "about"),
    saved: t(language, "saved"),
    trackOrders: t(language, "track_orders"),
    cart: t(language, "cart"),
    all: t(language, "all"),
    flashSale: t(language, "flash_sale"),
    flashSaleDesc: t(language, "flash_sale_desc"),
    fastDispatch: t(language, "fast_dispatch"),
    fastDispatchDesc: t(language, "fast_dispatch_desc"),
    secureCheckout: t(language, "secure_checkout"),
    secureCheckoutDesc: t(language, "secure_checkout_desc"),
    liveTracking: t(language, "live_tracking"),
    liveTrackingDesc: t(language, "live_tracking_desc"),
    categories: t(language, "categories"),
    allIn: t(language, "all_in"),
    sortBy: t(language, "sort_by"),
    featured: t(language, "featured"),
    priceLowHigh: t(language, "price_low_high"),
    priceHighLow: t(language, "price_high_low"),
    nameAz: t(language, "name_az"),
    popularPicks: t(language, "popular_picks"),
    viewMore: t(language, "view_more"),
    ordersRecently: t(language, "orders_recently"),
    addToCart: t(language, "add_to_cart"),
    results: t(language, "results"),
    socket: t(language, "socket"),
    rating: t(language, "rating"),
    reviews: t(language, "reviews"),
    off: t(language, "off"),
    fastDelivery: t(language, "fast_delivery"),
    unavailable: t(language, "unavailable"),
    added: t(language, "added"),
    showMoreResults: t(language, "show_more_results"),
    aboutTitle: t(language, "about_title"),
    aboutText: t(language, "about_text"),
    savedItems: t(language, "saved_items"),
    savedCount: t(language, "saved_count"),
    noSavedItems: t(language, "no_saved_items"),
    shoppingCart: t(language, "shopping_cart"),
    cartEmpty: t(language, "cart_empty"),
    subtotal: t(language, "subtotal"),
    proceedCheckout: t(language, "proceed_checkout"),
    name: t(language, "name"),
    email: t(language, "email"),
    mobile: t(language, "mobile"),
    billingAddress: t(language, "billing_address"),
    sameAsBilling: t(language, "same_as_billing"),
    shippingAddress: t(language, "shipping_address"),
    card: t(language, "card"),
    upi: t(language, "upi"),
    bankTransfer: t(language, "bank_transfer"),
    cod: t(language, "cod"),
    placing: t(language, "placing"),
    placeOrder: t(language, "place_order"),
    myOrders: t(language, "my_orders"),
    enterEmail: t(language, "enter_email"),
    load: t(language, "load"),
    order: t(language, "order"),
    notifications: t(language, "notifications"),
    markRead: t(language, "mark_read"),
    noNotifications: t(language, "no_notifications"),
    cartFloating: t(language, "cart_floating"),
    addedToCart: t(language, "added_to_cart"),
    orderPlaced: t(language, "order_placed"),
    fixCheckout: t(language, "fix_checkout"),
    validationName: t(language, "validation_name"),
    validationEmail: t(language, "validation_email"),
    validationMobile: t(language, "validation_mobile"),
    validationBilling: t(language, "validation_billing"),
    validationShipping: t(language, "validation_shipping"),
    failedLoadStore: t(language, "failed_load_store"),
    failedUpdateNotification: t(language, "failed_update_notification"),
    emptyCart: t(language, "empty_cart"),
    checkoutFailed: t(language, "checkout_failed"),
    storeHighlights: t(language, "store_highlights"),
    weeklyEssentials: t(language, "weekly_essentials"),
    curatedPicks: t(language, "curated_picks")
  }), [language]);
  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, line) => sum + line.quantity * line.item.price, 0), [cart]);

  const cartByItemId = useMemo(() => {
    const map = new Map<number, number>();
    for (const line of cart) {
      map.set(line.item.id, line.quantity);
    }
    return map;
  }, [cart]);

  const sortedItems = useMemo(() => {
    const next = [...items];
    if (sortBy === "priceAsc") return next.sort((a, b) => a.price - b.price);
    if (sortBy === "priceDesc") return next.sort((a, b) => b.price - a.price);
    if (sortBy === "nameAsc") return next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }, [items, sortBy]);

  const itemIndex = useMemo(() => {
    const map = new Map<number, StoreItem>();
    for (const item of items) map.set(item.id, item);
    for (const item of popularItems) map.set(item.id, item);
    for (const line of cart) map.set(line.item.id, line.item);
    return map;
  }, [items, popularItems, cart]);

  const savedItems = useMemo(
    () => wishlist.map((id) => itemIndex.get(id)).filter((item): item is StoreItem => Boolean(item)),
    [wishlist, itemIndex]
  );

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    void loadInitial();
  }, [language]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((current) => (slides.length === 0 ? 0 : (current + 1) % slides.length));
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (!customerEmail) {
      setSocketStatus("offline");
      return;
    }

    const socket: Socket = io(API_BASE, { transports: ["websocket"], query: { email: customerEmail } });
    socket.on("connect", () => setSocketStatus("online"));
    socket.on("disconnect", () => setSocketStatus("offline"));
    socket.on("notification:new", (payload: NotificationRecord) => {
      if (payload.customerEmail?.toLowerCase() === customerEmail.toLowerCase()) {
        setNotifications((prev) => (prev.some((item) => item.id === payload.id) ? prev : [payload, ...prev]));
      }
    });
    socket.on("order:tracking", (payload: { orderId: number; status: string; note: string; createdAt: string }) => {
      setOrders((prev) => prev.map((order) => {
        if (order.id !== payload.orderId) {
          return order;
        }

        const exists = order.trackingEvents.some(
          (event) =>
            event.status === payload.status &&
            event.note === payload.note &&
            event.createdAt === payload.createdAt
        );

        return {
          ...order,
          trackingStatus: payload.status,
          trackingEvents: exists
            ? order.trackingEvents
            : [
                ...order.trackingEvents,
                {
                  id: Date.now(),
                  orderId: payload.orderId,
                  status: payload.status,
                  note: payload.note,
                  createdAt: payload.createdAt
                }
              ]
        };
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [customerEmail]);

  async function loadInitial() {
    try {
      setError("");
      const [categoryData, slideData] = await Promise.all([getCategories(), getCarouselSlides()]);
      setCategories(categoryData);
      setOpenCategory(Object.keys(categoryData)[0] ?? "");
      setSlides(slideData);
      await Promise.all([loadItems(true), loadPopular(true)]);

      if (customerEmail) {
        await Promise.all([loadOrders(customerEmail), loadCustomerNotifications(customerEmail)]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.failedLoadStore);
    }
  }

  async function loadItems(reset = false) {
    const nextOffset = reset ? 0 : itemsOffset;
    const data = await getStoreItems({
      category: selectedCategory || undefined,
      subcategory: selectedSubcategory || undefined,
      q: search || undefined,
      offset: nextOffset,
      limit: ITEM_PAGE_SIZE
    });

    setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
    setItemsTotal(data.total);
    setItemsOffset(data.offset + data.items.length);
    setItemsHasMore(data.hasMore);
  }

  async function loadPopular(reset = false) {
    const nextOffset = reset ? 0 : popularOffset;
    const data = await getPopularItems({ offset: nextOffset, limit: POPULAR_PAGE_SIZE });

    setPopularItems((prev) => (reset ? data.items : [...prev, ...data.items]));
    setPopularOffset(data.offset + data.items.length);
    setPopularHasMore(data.hasMore);
  }

  async function loadOrders(email: string) {
    setOrders(await getMyOrders(email));
  }

  async function loadCustomerNotifications(email: string) {
    setNotifications(await getNotifications(email));
  }

  async function refreshCatalogWithFilters(category: string, subcategory: string, q: string) {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSearch(q);
    if (category) setOpenCategory(category);

    const data = await getStoreItems({
      category: category || undefined,
      subcategory: subcategory || undefined,
      q: q || undefined,
      offset: 0,
      limit: ITEM_PAGE_SIZE
    });

    setItems(data.items);
    setItemsTotal(data.total);
    setItemsOffset(data.offset + data.items.length);
    setItemsHasMore(data.hasMore);
  }

  function addToCart(item: StoreItem) {
    setCart((prev) => {
      const found = prev.find((line) => line.item.id === item.id);
      if (found) {
        return prev.map((line) => line.item.id === item.id ? { ...line, quantity: Math.min(line.quantity + 1, item.quantity) } : line);
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function updateCartItem(itemId: number, quantity: number) {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((line) => line.item.id !== itemId);
      return prev.map((line) => line.item.id === itemId ? { ...line, quantity: Math.min(quantity, line.item.quantity) } : line);
    });
  }

  function removeFromCart(itemId: number) {
    setCart((prev) => prev.filter((line) => line.item.id !== itemId));
  }

  function onAddToCart(item: StoreItem) {
    if (item.quantity === 0) return;
    addToCart(item);
    setToast(`${td(language, item.name)} ${labels.addedToCart}`);
  }

  function changeCardQuantity(item: StoreItem, direction: "inc" | "dec") {
    const currentQty = cartByItemId.get(item.id) ?? 0;
    const nextQty = direction === "inc" ? currentQty + 1 : currentQty - 1;
    if (nextQty <= 0) {
      removeFromCart(item.id);
      return;
    }
    updateCartItem(item.id, Math.min(nextQty, item.quantity));
  }

  function toggleWishlist(itemId: number) {
    setWishlist((prev) => prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]);
  }

  function productMeta(itemId: number) {
    const rating = 3.8 + (itemId % 12) * 0.1;
    const reviews = 120 + itemId * 17;
    const discount = 10 + (itemId % 5) * 5;
    return { rating: Math.min(4.8, Number(rating.toFixed(1))), reviews, discount };
  }

  function validateCheckoutForm(form: CheckoutForm): CheckoutErrors {
    const next: CheckoutErrors = {};
    if (form.customerName.trim().length < 2) next.customerName = labels.validationName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) next.customerEmail = labels.validationEmail;
    if (!/^\+?[0-9]{7,15}$/.test(form.customerMobile.trim())) next.customerMobile = labels.validationMobile;
    if (form.billingAddress.trim().length < 5) next.billingAddress = labels.validationBilling;
    const shipping = form.sameAsBilling ? form.billingAddress : form.shippingAddress;
    if (shipping.trim().length < 5) next.shippingAddress = labels.validationShipping;
    return next;
  }

  function onCheckoutField<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setCheckoutForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "billingAddress" && prev.sameAsBilling) {
        next.shippingAddress = String(value);
      }
      if (key === "sameAsBilling" && value === true) {
        next.shippingAddress = prev.billingAddress;
      }
      return next;
    });
    if (key !== "sameAsBilling" && key !== "paymentMethod") {
      setCheckoutErrors((prev) => ({ ...prev, [key]: "" }));
    }
  }

  async function onSubmitOrder(e: FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      setError(labels.emptyCart);
      return;
    }

    const validation = validateCheckoutForm(checkoutForm);
    if (Object.values(validation).some(Boolean)) {
      setCheckoutErrors(validation);
      setError(labels.fixCheckout);
      return;
    }

    try {
      setBusy(true);
      setError("");
      const shippingAddress = checkoutForm.sameAsBilling ? checkoutForm.billingAddress : checkoutForm.shippingAddress;

      const created = await checkout({
        customerName: checkoutForm.customerName.trim(),
        customerEmail: checkoutForm.customerEmail.trim(),
        customerMobile: checkoutForm.customerMobile.trim(),
        billingAddress: checkoutForm.billingAddress.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: checkoutForm.paymentMethod,
        items: cart.map((line) => ({ itemId: line.item.id, quantity: line.quantity }))
      });

      const normalizedEmail = checkoutForm.customerEmail.toLowerCase().trim();
      setCustomerEmail(normalizedEmail);
      localStorage.setItem("customerEmail", normalizedEmail);
      setCart([]);
      setPage("orders");
      setCheckoutErrors({});
      await Promise.all([loadOrders(normalizedEmail), loadCustomerNotifications(normalizedEmail), loadItems(true), loadPopular(true)]);
      setOrders((prev) => [created, ...prev.filter((x) => x.id !== created.id)]);
      setToast(labels.orderPlaced);
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.checkoutFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onReadNotification(id: number) {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.failedUpdateNotification);
    }
  }

  return (
    <div className="market">
      <header className="header-main">
        <button className="logo" onClick={() => setPage("home")}>{t(language, "logo")}</button>
        <div className="location">{labels.deliverTo}<br /><strong>{labels.country}</strong></div>

        <div className="search-wrap">
          <select value={selectedCategory} onChange={(e) => void refreshCatalogWithFilters(e.target.value, "", search)}>
            <option value="">{labels.allCategories}</option>
            {Object.keys(categories).map((category) => <option key={category} value={category}>{td(language, category)}</option>)}
          </select>
          <input
            value={search}
            placeholder={labels.searchPlaceholder}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void refreshCatalogWithFilters(selectedCategory, selectedSubcategory, search);
              }
            }}
          />
          <button className="search-btn" onClick={() => void refreshCatalogWithFilters(selectedCategory, selectedSubcategory, search)}>{labels.search}</button>
        </div>

        <div className="header-actions">
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} aria-label="Language">
            <option value="en">English</option>
            <option value="ta">Tamil</option>
          </select>
          <button onClick={() => setPage("about")}>{labels.about}</button>
          <button onClick={() => setPage("saved")}>{labels.saved} ({wishlist.length})</button>
          <button onClick={() => setPage("orders")}>{labels.trackOrders}</button>
          <button className="cart-entry" onClick={() => setPage("cart")}>{labels.cart} <strong>{cartCount}</strong></button>
        </div>
      </header>

      <nav className="header-sub">
        <button onClick={() => setPage("home")}>{labels.all}</button>
        {departmentsByLanguage[language].map((dep) => (
          <button key={dep}>{dep}</button>
        ))}
      </nav>

      {error && <p className="error">{error}</p>}
      {toast && <div className="toast">{toast}</div>}

      {page === "home" && (
        <main className="home-shell">
          <section className="hero">
            <img
              src={slides[slideIndex]?.imageUrl ?? HERO_FALLBACK_IMAGE}
              alt={slides[slideIndex]?.title ?? labels.storeHighlights}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = HERO_FALLBACK_IMAGE;
              }}
            />
            <div className="hero-overlay">
              <h2>{td(language, slides[slideIndex]?.title ?? labels.weeklyEssentials)}</h2>
              <p>{td(language, slides[slideIndex]?.subtitle ?? labels.curatedPicks)}</p>
            </div>
          </section>

          <section className="deal-grid">
            <article className="deal-box"><h3>{labels.flashSale}</h3><p>{labels.flashSaleDesc}</p></article>
            <article className="deal-box"><h3>{labels.fastDispatch}</h3><p>{labels.fastDispatchDesc}</p></article>
            <article className="deal-box"><h3>{labels.secureCheckout}</h3><p>{labels.secureCheckoutDesc}</p></article>
            <article className="deal-box"><h3>{labels.liveTracking}</h3><p>{labels.liveTrackingDesc}</p></article>
          </section>

          <section className="content-wrap">
            <aside className="filter-panel">
              <h3>{labels.categories}</h3>
              {Object.keys(categories).map((category) => {
                const isOpen = openCategory === category;
                const subcategories = categories[category] ?? [];
                return (
                  <div key={category} className="accordion-item">
                    <button className="accordion-trigger" onClick={() => setOpenCategory((prev) => prev === category ? "" : category)}>
                      <span>{td(language, category)}</span>
                      <span>{isOpen ? "-" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="accordion-body">
                        <button className={!selectedSubcategory && selectedCategory === category ? "active" : ""} onClick={() => void refreshCatalogWithFilters(category, "", search)}>{labels.allIn} {td(language, category)}</button>
                        {subcategories.map((sub) => (
                          <button key={sub} className={selectedSubcategory === sub ? "active" : ""} onClick={() => void refreshCatalogWithFilters(category, sub, search)}>{td(language, sub)}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <h3>{labels.sortBy}</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
                <option value="featured">{labels.featured}</option>
                <option value="priceAsc">{labels.priceLowHigh}</option>
                <option value="priceDesc">{labels.priceHighLow}</option>
                <option value="nameAsc">{labels.nameAz}</option>
              </select>
            </aside>

            <section className="catalog-area">
              <div className="section-row">
                <h3>{labels.popularPicks}</h3>
                {popularHasMore && <button onClick={() => void loadPopular(false)}>{labels.viewMore}</button>}
              </div>

              <div className="popular-rail">
                {popularItems.map((item) => {
                  const inCartQty = cartByItemId.get(item.id) ?? 0;
                  const inWishlist = wishlist.includes(item.id);
                  return (
                    <article key={item.id} className="popular-card">
                      <img
                        src={item.imageUrl ?? PRODUCT_FALLBACK_IMAGE}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
                        }}
                      />
                      <h4>{td(language, item.name)}</h4>
                      <p>{formatter.format(item.price)}</p>
                      <small>{item.orderedCount} {labels.ordersRecently}</small>
                      <button
                        className={inWishlist ? "wish active" : "wish"}
                        onClick={() => toggleWishlist(item.id)}
                        aria-label={inWishlist ? `Remove ${td(language, item.name)} from saved items` : `Save ${td(language, item.name)}`}
                      >
                        <HeartIcon active={inWishlist} />
                      </button>
                      {inCartQty === 0 ? (
                        <button onClick={() => onAddToCart(item)}>{labels.addToCart}</button>
                      ) : (
                        <div className="qty-inline">
                          <button onClick={() => changeCardQuantity(item, "dec")}>-</button>
                          <span>{inCartQty}</span>
                          <button onClick={() => changeCardQuantity(item, "inc")}>+</button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="section-row">
                <h3>{labels.results} ({itemsTotal})</h3>
                <small>{labels.socket}: {socketStatus}</small>
              </div>

              <div className="product-grid">
                {sortedItems.map((item) => {
                  const inCartQty = cartByItemId.get(item.id) ?? 0;
                  const inWishlist = wishlist.includes(item.id);
                  const meta = productMeta(item.id);
                  const originalPrice = item.price * (1 + meta.discount / 100);

                  return (
                    <article key={item.id} className="product-card">
                      <button className={inWishlist ? "wish active" : "wish"} onClick={() => toggleWishlist(item.id)}>
                        <HeartIcon active={inWishlist} />
                      </button>

                      <img
                        src={item.imageUrl ?? PRODUCT_FALLBACK_IMAGE}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
                        }}
                      />

                      <h4>{td(language, item.name)}</h4>
                      <div className="rating">{labels.rating} {meta.rating}/5 <span>({meta.reviews.toLocaleString()} {labels.reviews})</span></div>
                      <div className="pricing">
                        <strong>{formatter.format(item.price)}</strong>
                        <span className="strike">{formatter.format(originalPrice)}</span>
                        <em>{meta.discount}% {labels.off}</em>
                      </div>
                      <p className="delivery">{labels.fastDelivery}</p>

                      {item.quantity === 0 ? (
                        <button disabled>{labels.unavailable}</button>
                      ) : inCartQty === 0 ? (
                        <button onClick={() => onAddToCart(item)}>{labels.addToCart}</button>
                      ) : (
                        <div className="qty-inline">
                          <button onClick={() => changeCardQuantity(item, "dec")}>-</button>
                          <span>{labels.added} {inCartQty}</span>
                          <button onClick={() => changeCardQuantity(item, "inc")}>+</button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="footer-row">
                {itemsHasMore && <button onClick={() => void loadItems(false)}>{labels.showMoreResults}</button>}
              </div>
            </section>
          </section>
        </main>
      )}

      {page === "about" && (
        <section className="panel about-panel">
          <h2>{labels.aboutTitle}</h2>
          <p>{labels.aboutText}</p>
        </section>
      )}

      {page === "saved" && (
        <section className="panel saved-panel">
          <div className="section-row">
            <h2>{labels.savedItems}</h2>
            <small>{savedItems.length} {labels.savedCount}</small>
          </div>
          {savedItems.length === 0 && <p>{labels.noSavedItems}</p>}
          <div className="product-grid">
            {savedItems.map((item) => {
              const inCartQty = cartByItemId.get(item.id) ?? 0;
              const meta = productMeta(item.id);
              const originalPrice = item.price * (1 + meta.discount / 100);
              return (
                <article key={item.id} className="product-card">
                  <button className="wish active" onClick={() => toggleWishlist(item.id)} aria-label={`Remove ${td(language, item.name)} from saved`}>
                    <HeartIcon active />
                  </button>
                  <img
                    src={item.imageUrl ?? PRODUCT_FALLBACK_IMAGE}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
                    }}
                  />
                  <h4>{td(language, item.name)}</h4>
                  <div className="rating">{labels.rating} {meta.rating}/5 <span>({meta.reviews.toLocaleString()} {labels.reviews})</span></div>
                  <div className="pricing">
                    <strong>{formatter.format(item.price)}</strong>
                    <span className="strike">{formatter.format(originalPrice)}</span>
                    <em>{meta.discount}% {labels.off}</em>
                  </div>
                  {inCartQty === 0 ? (
                    <button onClick={() => onAddToCart(item)}>{labels.addToCart}</button>
                  ) : (
                    <div className="qty-inline">
                      <button onClick={() => changeCardQuantity(item, "dec")}>-</button>
                      <span>{labels.added} {inCartQty}</span>
                      <button onClick={() => changeCardQuantity(item, "inc")}>+</button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {page === "cart" && (
        <section className="cart-shell">
          <div className="panel">
            <h2>{labels.shoppingCart} ({cartCount})</h2>
            {cart.length === 0 && <p>{labels.cartEmpty}</p>}
            {cart.map((line) => (
              <div className="cart-row" key={line.item.id}>
                <div>
                  <h4>{td(language, line.item.name)}</h4>
                  <p>{formatter.format(line.item.price)}</p>
                </div>
                <div className="qty-inline">
                  <button onClick={() => updateCartItem(line.item.id, line.quantity - 1)}>-</button>
                  <span>{line.quantity}</span>
                  <button onClick={() => updateCartItem(line.item.id, line.quantity + 1)}>+</button>
                </div>
                <button onClick={() => removeFromCart(line.item.id)}>Remove</button>
              </div>
            ))}
            <h3>{labels.subtotal}: {formatter.format(cartTotal)}</h3>
          </div>

          <div className="panel">
            <h2>{labels.proceedCheckout}</h2>
            <form className="checkout" onSubmit={onSubmitOrder}>
              <input placeholder={labels.name} value={checkoutForm.customerName} onChange={(e) => onCheckoutField("customerName", e.target.value)} required />
              {checkoutErrors.customerName && <small className="field-error">{checkoutErrors.customerName}</small>}

              <input type="email" placeholder={labels.email} value={checkoutForm.customerEmail} onChange={(e) => onCheckoutField("customerEmail", e.target.value)} required />
              {checkoutErrors.customerEmail && <small className="field-error">{checkoutErrors.customerEmail}</small>}

              <input placeholder={labels.mobile} value={checkoutForm.customerMobile} onChange={(e) => onCheckoutField("customerMobile", e.target.value)} required />
              {checkoutErrors.customerMobile && <small className="field-error">{checkoutErrors.customerMobile}</small>}

              <textarea placeholder={labels.billingAddress} value={checkoutForm.billingAddress} onChange={(e) => onCheckoutField("billingAddress", e.target.value)} required />
              {checkoutErrors.billingAddress && <small className="field-error">{checkoutErrors.billingAddress}</small>}

              <label className="same-address">
                <input type="checkbox" checked={checkoutForm.sameAsBilling} onChange={(e) => onCheckoutField("sameAsBilling", e.target.checked)} />
                {labels.sameAsBilling}
              </label>

              <textarea placeholder={labels.shippingAddress} value={checkoutForm.shippingAddress} onChange={(e) => onCheckoutField("shippingAddress", e.target.value)} disabled={checkoutForm.sameAsBilling} required />
              {checkoutErrors.shippingAddress && <small className="field-error">{checkoutErrors.shippingAddress}</small>}

              <select value={checkoutForm.paymentMethod} onChange={(e) => onCheckoutField("paymentMethod", e.target.value as CheckoutForm["paymentMethod"])}>
                <option value="CARD">{labels.card}</option>
                <option value="UPI">{labels.upi}</option>
                <option value="BANK_TRANSFER">{labels.bankTransfer}</option>
                <option value="COD">{labels.cod}</option>
              </select>
              <button type="submit" disabled={busy || cart.length === 0}>{busy ? labels.placing : labels.placeOrder}</button>
            </form>
          </div>
        </section>
      )}

      {page === "orders" && (
        <section className="orders-shell">
          <div className="panel">
            <h2>{labels.myOrders}</h2>
            <div className="orders-query">
              <input type="email" placeholder={labels.enterEmail} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              <button onClick={() => {
                localStorage.setItem("customerEmail", customerEmail.toLowerCase());
                void Promise.all([loadOrders(customerEmail), loadCustomerNotifications(customerEmail)]);
              }}>{labels.load}</button>
            </div>

            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <header>
                  <h4>{labels.order} #{order.id}</h4>
                  <strong>{statusText(language, order.trackingStatus)}</strong>
                </header>
                <p>{formatter.format(order.total)} | {order.paymentMethod} | {order.paymentStatus}</p>
                <div className="items-line">{order.orderItems.map((line) => `${td(language, line.item.name)} x ${line.quantity}`).join(" | ")}</div>
              </article>
            ))}
          </div>

          <aside className="panel">
            <h2>{labels.notifications}</h2>
            {notifications.length === 0 && <p>{labels.noNotifications}</p>}
            {notifications.map((item) => (
              <div key={item.id} className={item.read ? "notice read" : "notice"}>
                <p>{translateNotification(language, item.message)}</p>
                {!item.read && <button onClick={() => void onReadNotification(item.id)}>{labels.markRead}</button>}
              </div>
            ))}
          </aside>
        </section>
      )}

      {page !== "cart" && cartCount > 0 && (
        <button className="floating-cart" onClick={() => setPage("cart")}>{labels.cartFloating}: {cartCount} | {formatter.format(cartTotal)}</button>
      )}
    </div>
  );
}

function HeartIcon({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 21s-6.5-4.2-9.3-8C.9 10.3 1.2 6.8 4 5.2a5 5 0 0 1 6 1.2A5 5 0 0 1 16 5.2c2.8 1.6 3.1 5.1 1.3 7.8C18.5 16.8 12 21 12 21Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
