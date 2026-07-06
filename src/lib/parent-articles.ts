// Curated resource library for parents. Static (no CMS yet).
// Adding a new article? Give it a stable slug — parent bookmarks reference it.

export type ArticleCategory = "financial" | "grad-party" | "senior-year" | "wellbeing" | "first-year";

export interface ParentArticle {
  slug: string;
  title: string;
  blurb: string;
  category: ArticleCategory;
  readMinutes: number;
  gradient: string; // tailwind gradient classes for the cover
  emoji: string;
  href?: string; // optional external link ("Read on…"); otherwise renders body inline
  body?: string[]; // paragraphs for the inline reader
}

export const ARTICLE_CATEGORIES: { id: ArticleCategory; label: string }[] = [
  { id: "financial", label: "Paying for it" },
  { id: "grad-party", label: "Graduation & parties" },
  { id: "senior-year", label: "Senior year survival" },
  { id: "wellbeing", label: "Family well-being" },
  { id: "first-year", label: "Freshman year prep" },
];

export const ARTICLES: ParentArticle[] = [
  {
    slug: "fafsa-parent-checklist",
    title: "The parent's FAFSA cheat sheet",
    blurb: "Every document you'll need, in the order you'll be asked for it. Skip the panic.",
    category: "financial",
    readMinutes: 5,
    emoji: "📝",
    gradient: "from-amber-500/30 via-orange-500/10 to-transparent",
    body: [
      "The FAFSA looks scarier than it is. Most parents get stuck because they open it before they've gathered paperwork. Do that first, and the form is a 30-minute exercise.",
      "You'll need: your and your student's Social Security numbers, most recent federal tax return, W-2s, records of untaxed income (child support received, veterans benefits), current bank statements, and net worth of investments and businesses.",
      "Create your FSA ID at studentaid.gov at least 3 days before you plan to file — it takes time to verify.",
      "Open the FAFSA in October (it's earlier than most families think) and file as soon as possible. Some state and school aid is first-come, first-served.",
      "If your finances changed dramatically since your last tax return (job loss, medical bills), file the FAFSA with the numbers it asks for, THEN email each school's financial aid office to appeal — they can adjust.",
    ],
  },
  {
    slug: "grad-party-must-buys",
    title: "Graduation party: what's worth buying, what's not",
    blurb: "The invitations, decor and \"grad packages\" that are actually worth it — and the ones that aren't.",
    category: "grad-party",
    readMinutes: 6,
    emoji: "🎉",
    gradient: "from-pink-500/30 via-fuchsia-500/10 to-transparent",
    body: [
      "WORTH IT: A nice printed banner with your grad's photo and school colors. It becomes the party backdrop AND a keepsake. Around $40 on Vistaprint or Zazzle.",
      "WORTH IT: A photo timeline (kindergarten through senior year). Cheap, easy, and every guest stops and reads it — best conversation starter of the day.",
      "WORTH IT: Individual thank-you cards (not just group). Order them WITH the invitations so you're not scrambling later.",
      "SKIP: The \"graduation party in a box\" kits — they're overpriced and generic. Buy plates, napkins, cups separately in your grad's college colors.",
      "SKIP: Custom-molded chocolates and expensive personalized favors. Kids grab them, adults don't, and you'll find them in a drawer in August.",
      "SKIP: Renting a photo booth if your teen already has a phone tripod. A designated hashtag + a fun backdrop = free photo booth.",
      "One more: skip the giant balloon arches unless someone in your family loves doing them. They're $150 and start deflating by hour 2.",
    ],
  },
  {
    slug: "grad-company-scams",
    title: "The \"official graduation\" company trap",
    blurb: "Announcement packages, class rings, cap-and-gown upgrades — what your school required vs. what they pushed.",
    category: "grad-party",
    readMinutes: 4,
    emoji: "⚠️",
    gradient: "from-red-500/30 via-rose-500/10 to-transparent",
    body: [
      "Jostens, Herff Jones, and similar companies partner with high schools and mail catalogs that look official. Most of what they sell is optional.",
      "REQUIRED (usually): cap and gown rental — this is the only thing the school actually mandates. Confirm the exact fee with your school office.",
      "OPTIONAL: Class rings ($200–$600). Sentimental value only. Many students never wear them past graduation.",
      "OPTIONAL: Custom announcements. A stack of 25 personalized cards often runs $80+. Costco and Shutterfly print the same thing for around $30.",
      "OPTIONAL: Tassel and stole upgrades, honor cords sold by the company (your school usually gives you the honor cords you actually earned).",
      "The move: Buy only the cap and gown from the school-partner company. Buy announcements from a third-party printer. Skip the ring unless your teen genuinely wants one.",
    ],
  },
  {
    slug: "compare-aid-offers",
    title: "How to actually compare financial aid letters",
    blurb: "Sticker price lies. Here's how to see which school is truly the cheapest — and which is quietly loading you with loans.",
    category: "financial",
    readMinutes: 7,
    emoji: "💰",
    gradient: "from-emerald-500/30 via-teal-500/10 to-transparent",
    body: [
      "Aid letters are designed to look generous. Every school formats them differently on purpose. Your job is to translate them into apples-to-apples.",
      "Start with Cost of Attendance (COA) — tuition + fees + housing + food + books + personal. If the school didn't list it clearly, look up the COA on their website.",
      "Then separate aid into GIFT AID (grants, scholarships — free money) and SELF-HELP (loans, work-study — you pay this back or earn it).",
      "Net cost = COA − gift aid. That's the real number. Do NOT subtract loans; those aren't aid, they're bills you pay later.",
      "Watch for: \"Parent PLUS loan\" listed as aid (it isn't — it's debt in YOUR name), scholarships that only apply the first year, and vague \"institutional grant\" amounts that might be need-based (could disappear if your income changes).",
      "Use the Financial Aid Hub inside The Plug to log each school's numbers side-by-side — it does the math for you.",
    ],
  },
  {
    slug: "when-to-back-off",
    title: "When to help, when to back off",
    blurb: "Your teen wants your support without your control. Here's the difference in practice.",
    category: "wellbeing",
    readMinutes: 5,
    emoji: "🤝",
    gradient: "from-violet-500/30 via-purple-500/10 to-transparent",
    body: [
      "The application process is the first time your student is being judged as an adult. Every essay, every form is them saying \"this is who I am.\" Your job shifts from doer to consultant.",
      "HELP with: logistics (deadlines on the calendar, transcript requests, testing registration), finances (FAFSA/CSS is genuinely your info), and second-reads (\"does this sentence sound like YOU?\").",
      "BACK OFF from: writing or editing essays to death (colleges can tell), calling teachers about rec letters, making the college list without them.",
      "The magic sentence: \"What do you need from me this week?\" Ask on Sunday. Whatever they answer, that's your lane for the week.",
      "When they miss a deadline, resist the urge to bail them out. One small failure now is cheaper than repeating the pattern in college.",
    ],
  },
  {
    slug: "senior-year-timeline",
    title: "A month-by-month senior year timeline",
    blurb: "What should be happening in August, in November, in March — so nothing sneaks up on you.",
    category: "senior-year",
    readMinutes: 8,
    emoji: "📅",
    gradient: "from-blue-500/30 via-sky-500/10 to-transparent",
    body: [
      "AUGUST: Finalize the college list (reach / target / safety). Draft the Common App personal statement. Request rec letters BEFORE school starts if possible.",
      "SEPTEMBER: Common App opens Aug 1 (technically) but most students start now. Finalize essays. Request transcripts. Register for the last SAT/ACT if needed.",
      "OCTOBER: FAFSA opens. File it. Early Action / Early Decision deadlines are Nov 1 or Nov 15 — that's now.",
      "NOVEMBER: EA/ED apps submitted. Regular Decision essays being written. CSS Profile due at many schools.",
      "DECEMBER: EA decisions start rolling in mid-month. Regular deadlines Jan 1 or Jan 15 for most schools — don't wait.",
      "JANUARY: All RD apps submitted. Take a breath. Nothing to do for a bit.",
      "FEBRUARY–MARCH: Decisions arrive. Financial aid packages arrive. Compare them (see the aid letter article).",
      "APRIL: Admitted student events. Compare offers. May 1 is national decision day.",
      "MAY: Deposit at chosen school. AP exams. Prom, graduation, breathing.",
    ],
  },
  {
    slug: "dorm-shopping-real-list",
    title: "The dorm shopping list you actually need",
    blurb: "Skip the Target checklist. Here's what freshmen actually use in the first month.",
    category: "first-year",
    readMinutes: 6,
    emoji: "🛏️",
    gradient: "from-cyan-500/30 via-blue-500/10 to-transparent",
    body: [
      "Wait until AFTER you know the roommate and the room dimensions. Don't shop in June for a room you see in August.",
      "MUST-HAVE: mattress topper (dorm mattresses are cruel), power strip with surge protection AND USB ports, shower caddy + flip flops, small first-aid kit, a solid backpack, a mini-fridge if not provided.",
      "USE-DAILY: fan (many dorms don't have AC), extra phone chargers (they will disappear), Command strips (dorms ban nails), a small toolkit.",
      "OVERRATED: a printer (campus printers exist and are cheap), fancy desk organizers (they use their laptop, not a desk), matching bedding sets (one nice quilt + basic sheets is fine).",
      "Coordinate the big stuff with the roommate: only one mini-fridge, one rug, one TV. Text before you buy.",
      "Buy toiletries and laundry supplies at a store NEAR the college, not from home. Cheaper, less to schlep.",
    ],
  },
  {
    slug: "mental-health-check-in",
    title: "Check-in questions that don't feel like an interrogation",
    blurb: "For weeks when your kid is stressed and \"how was your day\" isn't landing.",
    category: "wellbeing",
    readMinutes: 4,
    emoji: "💛",
    gradient: "from-rose-500/30 via-pink-500/10 to-transparent",
    body: [
      "\"What was the best five minutes of today?\"",
      "\"Anything I can take off your plate this week? Even something small.\"",
      "\"What's on your mind about next year?\"",
      "\"Who at school right now makes you feel like yourself?\"",
      "\"Is there anything you're avoiding because it feels big?\"",
      "You don't need answers on the spot — often they'll circle back an hour later once the question has been sitting.",
      "If you sense real distress: college counselors, teletherapy (BetterHelp, Talkspace), and your school's counselor are all reasonable places to start. You're not overreacting.",
    ],
  },
];

export const ARTICLES_BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
