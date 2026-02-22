export type Language = "en" | "ta";

type Dict = Record<string, string>;

const en: Dict = {
  logo: "dailybasket",
  deliver_to: "Deliver to",
  country: "India",
  all_categories: "All Categories",
  search_placeholder: "Search products, brands and categories",
  search: "Search",
  about: "About",
  saved: "Saved",
  track_orders: "Track Orders",
  cart: "Cart",
  all: "All",
  flash_sale: "Flash Sale",
  flash_sale_desc: "Save up to 35% on best-selling picks.",
  fast_dispatch: "Fast Dispatch",
  fast_dispatch_desc: "Orders processed in under 2 hours.",
  secure_checkout: "Secure Checkout",
  secure_checkout_desc: "Card, UPI, bank transfer and COD.",
  live_tracking: "Live Tracking",
  live_tracking_desc: "Realtime delivery updates in My Orders.",
  categories: "Categories",
  all_in: "All in",
  sort_by: "Sort By",
  featured: "Featured",
  price_low_high: "Price: Low to High",
  price_high_low: "Price: High to Low",
  name_az: "Name: A to Z",
  popular_picks: "Popular Picks",
  view_more: "View More",
  orders_recently: "orders recently",
  add_to_cart: "Add to Cart",
  results: "Results",
  socket: "Socket",
  rating: "Rating",
  reviews: "reviews",
  off: "off",
  fast_delivery: "Fast delivery available",
  unavailable: "Currently unavailable",
  added: "Added",
  show_more_results: "Show More Results",
  about_title: "About DailyBasket",
  about_text:
    "DailyBasket is inspired by modern multi-seller ecommerce platforms with fast discovery, easy cart operations, and realtime order visibility.",
  saved_items: "Saved Items",
  saved_count: "saved",
  no_saved_items: "No saved items yet. Tap the heart icon on any product.",
  shopping_cart: "Shopping Cart",
  cart_empty: "Your cart is empty.",
  subtotal: "Subtotal",
  proceed_checkout: "Proceed to Checkout",
  name: "Name",
  email: "Email",
  mobile: "Mobile",
  billing_address: "Billing Address",
  same_as_billing: "Use billing address as shipping address",
  shipping_address: "Shipping Address",
  card: "Card",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cod: "Cash on Delivery",
  placing: "Placing...",
  place_order: "Place Order",
  my_orders: "My Orders",
  enter_email: "Enter your email",
  load: "Load",
  order: "Order",
  notifications: "Notifications",
  mark_read: "Mark Read",
  no_notifications: "No notifications yet.",
  cart_floating: "Cart",
  added_to_cart: "added to cart",
  order_placed: "Order placed successfully",
  fix_checkout: "Please fix checkout details and try again.",
  validation_name: "Enter at least 2 characters.",
  validation_email: "Enter a valid email.",
  validation_mobile: "Enter a valid mobile number.",
  validation_billing: "Billing address must be at least 5 characters.",
  validation_shipping: "Shipping address must be at least 5 characters.",
  failed_load_store: "Failed to load store",
  failed_update_notification: "Failed to update notification",
  empty_cart: "Your cart is empty.",
  checkout_failed: "Checkout failed",
  store_highlights: "Store highlights",
  weekly_essentials: "Your Weekly Essentials",
  curated_picks: "Curated picks and daily price drops"
};

const ta: Dict = {
  logo: "டெய்லிபாஸ்கெட்",
  deliver_to: "டெலிவரி இடம்",
  country: "இந்தியா",
  all_categories: "அனைத்து வகைகள்",
  search_placeholder: "பொருட்கள், பிராண்டுகள் மற்றும் வகைகள் தேடவும்",
  search: "தேடு",
  about: "எங்களை பற்றி",
  saved: "சேமித்தவை",
  track_orders: "ஆர்டர் கண்காணிப்பு",
  cart: "கார்ட்",
  all: "அனைத்தும்",
  flash_sale: "விரைவு சலுகை",
  flash_sale_desc: "அதிகம் விற்கும் பொருட்களில் 35% வரை தள்ளுபடி.",
  fast_dispatch: "வேகமான அனுப்பல்",
  fast_dispatch_desc: "ஆர்டர்கள் 2 மணி நேரத்தில் செயலாக்கப்படும்.",
  secure_checkout: "பாதுகாப்பான கட்டணம்",
  secure_checkout_desc: "கார்ட், UPI, வங்கி பரிமாற்றம் மற்றும் COD.",
  live_tracking: "நேரடி கண்காணிப்பு",
  live_tracking_desc: "My Orders-ல் நேரடி டெலிவரி அப்டேட்கள்.",
  categories: "வகைகள்",
  all_in: "இதில் உள்ள அனைத்தும்",
  sort_by: "வரிசைப்படுத்து",
  featured: "சிறப்புப் பொருட்கள்",
  price_low_high: "விலை: குறைவு முதல் அதிகம்",
  price_high_low: "விலை: அதிகம் முதல் குறைவு",
  name_az: "பெயர்: A முதல் Z",
  popular_picks: "பிரபலமான தேர்வுகள்",
  view_more: "மேலும் பார்க்க",
  orders_recently: "சமீபத்திய ஆர்டர்கள்",
  add_to_cart: "கார்டில் சேர்",
  results: "முடிவுகள்",
  socket: "சாக்கெட்",
  rating: "மதிப்பீடு",
  reviews: "விமர்சனங்கள்",
  off: "தள்ளுபடி",
  fast_delivery: "வேகமான டெலிவரி கிடைக்கும்",
  unavailable: "தற்போது கிடைக்கவில்லை",
  added: "சேர்க்கப்பட்டது",
  show_more_results: "மேலும் முடிவுகள்",
  about_title: "டெய்லிபாஸ்கெட் பற்றி",
  about_text:
    "டெய்லிபாஸ்கெட் என்பது வேகமான தேடல், எளிய கார்ட் செயல்பாடுகள் மற்றும் நேரடி ஆர்டர் கண்காணிப்புடன் உருவாக்கப்பட்ட நவீன இ-காமர்ஸ் அனுபவம்.",
  saved_items: "சேமித்த பொருட்கள்",
  saved_count: "சேமிக்கப்பட்டது",
  no_saved_items: "இன்னும் சேமித்த பொருட்கள் இல்லை. எந்தப் பொருளின் இதயம் ஐகானையும் தட்டவும்.",
  shopping_cart: "ஷாப்பிங் கார்ட்",
  cart_empty: "உங்கள் கார்ட் காலியாக உள்ளது.",
  subtotal: "மொத்தம்",
  proceed_checkout: "கட்டணத்திற்குச் செல்லவும்",
  name: "பெயர்",
  email: "மின்னஞ்சல்",
  mobile: "மொபைல்",
  billing_address: "பில்லிங் முகவரி",
  same_as_billing: "பில்லிங் முகவரியை ஷிப்பிங் முகவரியாக பயன்படுத்தவும்",
  shipping_address: "ஷிப்பிங் முகவரி",
  card: "கார்டு",
  upi: "UPI",
  bank_transfer: "வங்கி பரிமாற்றம்",
  cod: "கிடைக்கும் போது பணம்",
  placing: "செயலாக்குகிறது...",
  place_order: "ஆர்டர் இடு",
  my_orders: "என் ஆர்டர்கள்",
  enter_email: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
  load: "ஏற்று",
  order: "ஆர்டர்",
  notifications: "அறிவிப்புகள்",
  mark_read: "படித்ததாக குறி",
  no_notifications: "அறிவிப்புகள் இல்லை.",
  cart_floating: "கார்ட்",
  added_to_cart: "கார்டில் சேர்க்கப்பட்டது",
  order_placed: "ஆர்டர் வெற்றிகரமாக இடப்பட்டது",
  fix_checkout: "கட்டண விவரங்களை சரி செய்து மீண்டும் முயற்சிக்கவும்.",
  validation_name: "குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்.",
  validation_email: "சரியான மின்னஞ்சலை உள்ளிடவும்.",
  validation_mobile: "சரியான மொபைல் எண்ணை உள்ளிடவும்.",
  validation_billing: "பில்லிங் முகவரி குறைந்தது 5 எழுத்துகள் இருக்க வேண்டும்.",
  validation_shipping: "ஷிப்பிங் முகவரி குறைந்தது 5 எழுத்துகள் இருக்க வேண்டும்.",
  failed_load_store: "ஸ்டோரைக் ஏற்ற முடியவில்லை",
  failed_update_notification: "அறிவிப்பை புதுப்பிக்க முடியவில்லை",
  empty_cart: "உங்கள் கார்ட் காலியாக உள்ளது.",
  checkout_failed: "கட்டணம் தோல்வி",
  store_highlights: "ஸ்டோர் சிறப்பம்சங்கள்",
  weekly_essentials: "உங்கள் வாராந்திர அத்தியாவசியங்கள்",
  curated_picks: "தேர்ந்தெடுக்கப்பட்ட பொருட்கள் மற்றும் தினசரி தள்ளுபடிகள்"
};

const statusEn: Record<string, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered"
};

const statusTa: Record<string, string> = {
  PLACED: "இடப்பட்டது",
  CONFIRMED: "உறுதிசெய்யப்பட்டது",
  PACKED: "பேக் செய்யப்பட்டது",
  SHIPPED: "அனுப்பப்பட்டது",
  OUT_FOR_DELIVERY: "விநியோகத்திற்கு வெளியே",
  DELIVERED: "விநியோகம் முடிந்தது"
};

export const departmentsByLanguage: Record<Language, string[]> = {
  en: ["Fresh", "Electronics", "Fashion", "Mobiles", "Home", "Beauty", "Toys", "Sports"],
  ta: ["புதியவை", "மின்சாதனங்கள்", "ஃபேஷன்", "மொபைல்கள்", "வீடு", "அழகு", "விளையாட்டு பொருட்கள்", "விளையாட்டு"]
};

export function t(lang: Language, key: string) {
  const dict = lang === "ta" ? ta : en;
  return dict[key] ?? en[key] ?? key;
}

export function statusText(lang: Language, status: string) {
  const map = lang === "ta" ? statusTa : statusEn;
  return map[status] ?? status.replaceAll("_", " ");
}

const dynamicTa: Record<string, string> = {
  "Fresh Produce": "புதிய உற்பத்திகள்",
  Fruits: "பழங்கள்",
  "Leafy Greens": "இலைகள்",
  Bakery: "பேக்கரி",
  Breads: "ரொட்டிகள்",
  Dairy: "பால்வர்க்கம்",
  Yogurt: "தயிர்",
  Cheese: "சீஸ்",
  Beverages: "பானங்கள்",
  Water: "தண்ணீர்",
  Coffee: "காபி",
  Snacks: "இடையுணவு",
  Nuts: "நட்டுகள்",
  Chips: "சிப்ஸ்",
  Chocolate: "சாக்லேட்",
  Pantry: "பாண்ட்ரி",
  Sauces: "சாஸ்",
  Grains: "தானியங்கள்",
  "Organic Bananas": "ஆர்கானிக் வாழைப்பழம்",
  "Baby Spinach": "பேபி கீரை",
  "Whole Wheat Bread": "முழு கோதுமை ரொட்டி",
  "Greek Yogurt": "கிரீக் தயிர்",
  "Cheddar Cheese": "செடார் சீஸ்",
  "Sparkling Water": "ஸ்பார்க்ளிங் தண்ணீர்",
  "Cold Brew Coffee": "கோல்ட் ப்ரூ காபி",
  "Salted Almonds": "உப்பு பாதாம்",
  "Potato Chips": "உருளைக்கிழங்கு சிப்ஸ்",
  "Tomato Pasta Sauce": "தக்காளி பாஸ்டா சாஸ்",
  "Basmati Rice": "பாஸ்மதி அரிசி",
  "Dark Chocolate Bar": "டார்க் சாக்லேட் பார்",
  "Naturally sweet bananas from certified organic farms.": "சான்றளிக்கப்பட்ட ஆர்கானிக் பண்ணைகளிலிருந்து இயற்கையாக இனிப்பான வாழைப்பழங்கள்.",
  "Washed and ready to toss into salads.": "சுத்தம் செய்யப்பட்டு சாலடிற்கு தயாராக உள்ளது.",
  "Soft whole wheat loaf baked daily.": "தினமும் சுடப்படும் மென்மையான முழு கோதுமை ரொட்டி.",
  "Protein-rich plain Greek yogurt.": "அதிக புரதம் கொண்ட பிளெயின் கிரீக் தயிர்.",
  "Sharp aged cheddar block.": "பழுப்பு சுவையுடன் பழுத்த செடார் துண்டு.",
  "Zero-calorie sparkling mineral water.": "சுழி கலோரி கொண்ட ஸ்பார்க்ளிங் மினரல் வாட்டர்.",
  "Smooth bottled cold brew.": "மென்மையான பாட்டில் கோல்ட் ப்ரூ.",
  "Roasted almonds with sea salt.": "கடல் உப்புடன் வறுத்த பாதாம்.",
  "Crisp kettle-cooked potato chips.": "கெட்டிலில் சமைத்த குருமுரு உருளைக்கிழங்கு சிப்ஸ்.",
  "Slow-cooked tomato basil pasta sauce.": "மெதுவாக வேகவைத்த தக்காளி-பேசில் பாஸ்டா சாஸ்.",
  "Long-grain aromatic basmati rice.": "நீளமான மணமுள்ள பாஸ்மதி அரிசி.",
  "72% dark chocolate with cocoa nibs.": "கோகோ நிப்ஸுடன் 72% டார்க் சாக்லேட்.",
  "Fresh Picks Every Morning": "ஒவ்வொரு காலையும் புதிய தேர்வுகள்",
  "Farm-fresh produce delivered to your door": "பண்ணையிலிருந்து புது பொருட்கள் உங்கள் வாசலுக்கு",
  "Weekly Pantry Deals": "வாராந்திர பாண்ட்ரி சலுகைகள்",
  "Stock up on essentials with curated bundles": "தேர்ந்தெடுக்கப்பட்ட தொகுப்புகளுடன் அத்தியாவசியங்களை சேமிக்கவும்",
  "Snacks, Drinks, More": "இடையுணவு, பானங்கள் மற்றும் மேலும்",
  "Everything you need for fast checkout": "வேகமான கட்டணத்திற்கு தேவையான அனைத்தும்",
  "Order placed and payment captured": "ஆர்டர் இடப்பட்டது மற்றும் கட்டணம் உறுதி செய்யப்பட்டது"
};

export function td(lang: Language, input: string) {
  if (lang === "en") return input;
  return dynamicTa[input] ?? input;
}

export function translateNotification(lang: Language, message: string) {
  if (lang === "en") return message;

  const created = message.match(/^Order #(\d+) confirmed\. We have started processing it\.$/);
  if (created) {
    return `ஆர்டர் #${created[1]} உறுதிசெய்யப்பட்டது. செயலாக்கம் தொடங்கப்பட்டுள்ளது.`;
  }

  const moved = message.match(/^Order #(\d+) is now ([A-Z_ ]+)\.$/);
  if (moved) {
    const human = moved[2].replaceAll(" ", "_");
    return `ஆர்டர் #${moved[1]} தற்போது ${statusText("ta", human)} நிலையில் உள்ளது.`;
  }

  return td(lang, message);
}
