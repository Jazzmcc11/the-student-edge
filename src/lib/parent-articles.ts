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
  {
    slug: "senior-year-9-reminders",
    title: "9 reminders for parents of a senior (from a parent who's been there)",
    blurb: "The run-up to college is a whole season. Here's what I wish I'd known before my first one left.",
    category: "senior-year",
    readMinutes: 7,
    emoji: "🕊️",
    gradient: "from-amber-500/30 via-yellow-500/10 to-transparent",
    body: [
      "1. This year is not a checklist. It's a season. You'll blink and it's May 1. Pay attention to the ordinary Tuesdays — those are the ones you'll miss.",
      "2. They are supposed to pull away. It doesn't mean you did anything wrong. Growing up is a controlled separation, and it starts now.",
      "3. Grief is allowed. Somebody's going to say 'aren't you excited?' and you'll want to scream. You can be proud AND heartbroken at the same time. Both.",
      "4. Ask before you fix. Half the time they don't want the answer — they want the audience. 'Do you want me to just listen, or do you want ideas?' Say it out loud.",
      "5. Let the small failures land. A missed deadline in October is a cheap lesson. A missed deadline in college is expensive. Don't rescue what they can survive.",
      "6. Take the photos anyway. They'll roll their eyes. Take them. First day of senior year, last home game, decision day, packing day. Future-you will thank present-you.",
      "7. Protect ONE ritual. Sunday breakfast, Wednesday drive to school, whatever it is. When everything else is chaos, that ritual is the thing that says 'we're still us.'",
      "8. Say the thing. 'I'm proud of you.' 'You're going to be okay.' 'I love who you're becoming.' Don't save it for the graduation card. Say it in the car.",
      "9. You get to grow up too. This is your run-up, not just theirs. What have you been putting off until they left? Start it now — you'll be glad you had a head start.",
    ],
  },
  {
    slug: "senior-parent-decision-day",
    title: "Decision day feelings — for you, not for them",
    blurb: "Everybody's asking your kid where they're going. Nobody's asking how YOU'RE doing.",
    category: "senior-year",
    readMinutes: 4,
    emoji: "💌",
    gradient: "from-purple-500/30 via-indigo-500/10 to-transparent",
    body: [
      "May 1 is loud. Cars getting decked out in college colors, group chats blowing up, every relative asking 'so where?' — it's a lot, and it's mostly not about you.",
      "But it IS a big day for you too. You raised somebody who has choices. Somebody who got in. Whatever school they picked, that's a moment you had a hand in.",
      "If they got into a top choice: celebrate hard. Post it, hype it, throw whatever party fits your budget. Joy is a muscle and it needs reps.",
      "If they didn't get their first pick: keep the disappointment private. They can feel their feelings — you can feel yours later, with a friend or a journal, not in front of them. Their college is now home. Talk it up.",
      "If aid didn't come through and the plan is changing: this isn't a failure. Community college into a transfer, a gap year, a trade — those are real paths that a lot of successful people took. The 'right' school is the one you can pay for without wrecking the family.",
      "One thing to actually do today: text three parents you know who are also in this and just say 'thinking of you today.' The check-in you needed is the check-in they needed too.",
    ],
  },
  {
    slug: "senior-parent-house-rules-shift",
    title: "House rules, but they're 17 now",
    blurb: "Curfews, cars, chores — the year to renegotiate before college does it for you.",
    category: "senior-year",
    readMinutes: 5,
    emoji: "🗝️",
    gradient: "from-teal-500/30 via-cyan-500/10 to-transparent",
    body: [
      "Senior year is the year to move from 'my rules' to 'our agreements.' If they leave home under the same rules they had at 14, the first month of college is going to hit like a freight train.",
      "Sit down once — like, an actual sit-down — and rewrite together. Suggested topics: curfew, car use, screen time in shared spaces, when you get told about weekend plans, chores that still stand.",
      "The move: you set the non-negotiables (safety, honesty, contribution to the household). They propose the rest. You edit together. Write it down so it's not 'you said / I said' next month.",
      "Introduce college-adjacent things while you're still around: doing their own laundry, making one dinner a week, refilling their own prescriptions, scheduling their own dentist appointment. If they can't do it under your roof, they won't do it in a dorm.",
      "Money: a small, predictable allowance with a rule ('this is your gas + fun money — when it's out, it's out') teaches more than a lecture. Let them run out once in October. It's better than October of freshman year.",
      "One rule that stays: they text you when they get home. That one carries into college. Set the muscle memory now.",
    ],
  },
];


export const ARTICLES_BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
