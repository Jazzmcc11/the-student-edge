import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Music2, Zap, Check, X } from "lucide-react";
import studentsHero from "@/assets/students-hero.jpg";
import familiesImg from "@/assets/families.jpg";
import bandImg from "@/assets/band.jpg";
import plugLogo from "@/assets/plug-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Plug — Your unfair advantage" },
      {
        name: "description",
        content:
          "Everything your student needs to win at high school. Scholarships, college prep, internships, senior year planning, and a community that gets it — all in one place.",
      },
    ],
  }),
  component: Landing,
});

// HBCU Battle of the Bands — Spotify playlist (Southern University Human Jukebox / Fabulous Dancing Dolls)
const SPOTIFY_PLAYLIST_ID = "3C0Bd8qAYTczNcjtS7sy2V";
const SPOTIFY_PLAYLIST_NAME = "thee human jukebox hbcu";

function Landing() {
  // -------- Floating notes (client-only to avoid SSR hydration mismatch) --------
  const [notes, setNotes] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number; color: string }>>([]);
  useEffect(() => {
    setNotes(
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 10,
        size: 14 + Math.random() * 22,
        color: ["text-burnt/40", "text-gold/40", "text-navy/50", "text-maroon/60"][i % 4],
      })),
    );
  }, []);


  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Floating notes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {notes.map((n) => (
          <motion.div
            key={n.id}
            className={`absolute ${n.color}`}
            style={{ left: `${n.left}%`, bottom: -40 }}
            animate={{
              y: [0, typeof window !== "undefined" ? -window.innerHeight - 80 : -900],
              x: [0, 30, -30, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: n.duration,
              delay: n.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Music2 size={n.size} />
          </motion.div>
        ))}
      </div>

      <Nav />
      <Hero />
      <WinBoard />
      <Modules />
      <MeetP />
      <SplitSection />
      <Pricing />
      <Footer />
      <SpotifyPlayer />
    </div>
  );
}

/* ----------------- Sub-sections ----------------- */

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-maroon/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={plugLogo.url} alt="The Plug logo" className="h-10 w-10 rounded-lg object-contain" />
          <span className="font-display text-2xl font-bold tracking-tight text-gold">
            The Plug
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "Pricing", "Community", "About"].map((n) => (
            <a
              key={n}
              href={`#${n.toLowerCase()}`}
              className="text-sm font-medium text-foreground transition-colors hover:text-burnt"
            >
              {n}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button
              variant="outline"
              className="border-burnt text-burnt hover:bg-burnt hover:text-primary-foreground"
            >
              Log In
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-burnt text-primary-foreground shadow-burnt hover:bg-burnt/90">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ----------------- Spotify Floating Player ----------------- */
function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="overflow-hidden rounded-2xl border border-gold/40 bg-surface shadow-gold"
            style={{ width: 340 }}
          >
            <div className="flex items-center justify-between border-b border-border bg-background/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-burnt" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                  Now playing · BOTB
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-foreground/60 hover:bg-maroon/30 hover:text-gold"
                aria-label="Close player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe
              title={SPOTIFY_PLAYLIST_NAME}
              src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`}
              width="100%"
              height="380"
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: 0, display: "block" }}
            />
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-burnt px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-burnt"
            aria-label="Open HBCU Battle of the Bands player"
          >
            <motion.span
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <Music2 className="h-4 w-4" />
            </motion.span>
            Play the band
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}



function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      {/* Pulsing collegiate spotlights */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-burnt/25 blur-3xl"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-maroon/40 blur-3xl"
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-8 h-px w-24 origin-center bg-burnt"
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]"
        >
          Everything your student needs to{" "}
          <span className="italic text-burnt">win</span> at high school.
          <br />
          <span className="text-gold">One place.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Scholarships, college prep, internships, senior year planning, and a
          community that gets it — all in one platform built for students who
          are doing it the hard way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="group bg-burnt text-primary-foreground shadow-burnt hover:bg-burnt/90"
            >
              I'm a Student — Get Started Free
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button
              size="lg"
              variant="outline"
              className="border-maroon bg-transparent text-foreground hover:bg-maroon hover:text-foreground"
            >
              I'm a Parent — Learn More
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {["FERPA Compliant", "No Ads. Ever.", "Student Data Never Sold."].map((b) => (
            <span
              key={b}
              className="rounded-full border border-navy/60 bg-navy px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-foreground"
            >
              {b}
            </span>
          ))}
        </motion.div>

        {/* Pennant row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 flex items-end justify-center gap-6"
        >
          {[
            { color: "bg-burnt", h: "h-12" },
            { color: "bg-maroon", h: "h-16" },
            { color: "bg-navy", h: "h-14" },
            { color: "bg-gold", h: "h-16" },
          ].map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className={`relative w-10 ${p.h} ${p.color} rounded-t-md`}
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
              }}
            />
          ))}
        </motion.div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Southern. Scholarly. Unbought.
        </p>

        {/* Hero portrait */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-burnt/30 via-maroon/20 to-gold/30 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-gold/30 shadow-burnt">
            <img
              src={studentsHero}
              alt="A diverse group of high school students from every background — Black, white, Hispanic, and Asian — smiling in collegiate colors"
              width={1280}
              height={896}
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WinBoard() {
  const wins = [
    {
      msg: "Just got into UT Austin — first in my family 🔥",
      who: "JM",
      when: "2h ago",
    },
    {
      msg: "Posse Foundation finalist — they called me today",
      who: "AT",
      when: "5h ago",
    },
    {
      msg: "Landed the Google CSSI internship 🙌",
      who: "DR",
      when: "1d ago",
    },
    {
      msg: "Found $40,000 in scholarships I didn't know existed",
      who: "SP",
      when: "1d ago",
    },
    {
      msg: "Dell Scholars Program — $20,000 coming my way",
      who: "KW",
      when: "2d ago",
    },
  ];
  return (
    <section className="relative border-y border-border bg-surface py-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15,15,15,0.7), rgba(15,15,15,0.95)), url(${bandImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            The wins are <span className="italic text-burnt">real.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Updated every day by students on The Plug.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wins.map((w, i) => (
            <motion.div
              key={w.msg}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border-l-4 border-burnt bg-surface p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-background font-mono text-xs font-bold text-gold">
                  {w.who}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {w.when}
                </span>
              </div>
              <p className="mt-4 text-base leading-snug text-foreground">{w.msg}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Modules() {
  const cards = [
    {
      accent: "burnt",
      emoji: "📚",
      title: "Academic Support",
      body: "Study tools, resource library, and an AI tutor available 24/7. No tutoring fees. No waiting.",
    },
    {
      accent: "maroon",
      emoji: "🎓",
      title: "College & Career Readiness",
      body: "Application tracker, scholarship finder, FAFSA guidance, internships, and summer programs — all matched to your student's profile.",
    },
    {
      accent: "gold",
      emoji: "🎨",
      title: "Creative Resources",
      body: "Graduation planning guides, HOCO ideas, party themes, senior year checklists, and Canva templates ready to customize.",
    },
    {
      accent: "navy",
      emoji: "🤝",
      title: "Community",
      body: "Six purpose-built spaces where students connect, share wins, ask for help, and find their people.",
    },
  ];
  const ringMap: Record<string, string> = {
    burnt: "border-t-burnt text-burnt",
    maroon: "border-t-maroon text-maroon",
    gold: "border-t-gold text-gold",
    navy: "border-t-navy text-navy",
  };
  return (
    <section id="features" className="relative border-t-2 border-maroon bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            One platform. <span className="text-gold">Everything they need.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map((c, i) => {
            const accentCls = ringMap[c.accent];
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`group rounded-xl border border-border border-t-4 bg-surface p-7 ${accentCls.split(" ")[0]}`}
              >
                <div className="text-4xl">{c.emoji}</div>
                <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                  {c.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{c.body}</p>
                <a
                  href="#"
                  className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${accentCls.split(" ")[1]} transition group-hover:gap-2`}
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MeetP() {
  return (
    <section className="bg-[#0c0c0c] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 border-l-4 border-burnt pl-8 lg:grid-cols-2">
          {/* Chat mock */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-burnt">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-burnt" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              <span className="h-2.5 w-2.5 rounded-full bg-maroon" />
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                P · live
              </span>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-burnt px-4 py-3 text-sm text-primary-foreground">
                I don't understand my FAFSA EFC — it seems really high.
              </div>
            </div>
            <div className="mt-4 flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm border-l-2 border-gold bg-background px-4 py-3 text-sm leading-relaxed text-foreground">
                Okay let's look at this together. A high EFC doesn't always mean
                what people think — it's a starting point, not a final number.
                Has your family's financial situation changed since you filed
                taxes? If it has, your school's financial aid office can do a{" "}
                <span className="text-gold">Professional Judgment Review</span>.
                That could lower your EFC and increase your aid. Want me to walk
                you through how to request one?
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-gold text-background shadow-gold">
              <Zap className="h-7 w-7" />
            </div>
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Meet <span className="italic text-gold">P.</span>
              <br />
              Your unfair advantage.
            </h2>
            <p className="mt-5 text-muted-foreground">
              P is the AI guide built into The Plug. Not a chatbot. Not a FAQ
              page. A real conversation with something that knows your profile,
              knows your schools, and knows exactly what to do next.
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-gold">
              Available 24/7 · Never judges · Never rushes
            </p>
            <Link to="/auth" className="mt-7 inline-block">
              <Button className="bg-burnt text-primary-foreground shadow-burnt hover:bg-burnt/90">
                Try a conversation with P
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SplitSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2">
      {/* Student */}
      <div className="border-t-4 border-burnt bg-background p-12 lg:p-16">
        <h3 className="font-display text-3xl font-bold text-burnt md:text-4xl">
          Built for the student doing it without a roadmap.
        </h3>
        <ul className="mt-8 space-y-4">
          {[
            "Find scholarships matched to your profile",
            "Get essay feedback from P at midnight",
            "Plan HOCO and still submit your Common App on time.",
          ].map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-burnt" />
              <span className="text-foreground">{b}</span>
            </li>
          ))}
        </ul>
        <Link to="/auth" className="mt-8 inline-block">
          <Button className="bg-burnt text-primary-foreground shadow-burnt hover:bg-burnt/90">
            Start for free <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Maroon divider */}
      <div className="hidden lg:block" style={{ borderLeft: "1px solid var(--maroon)" }} />

      {/* Parent */}
      <div
        className="border-t-4 border-navy p-12 lg:p-16"
        style={{ background: "#0F0A0A" }}
      >
        <div className="mb-8 overflow-hidden rounded-xl border border-navy/40">
          <img
            src={familiesImg}
            alt="Diverse families — African American, Hispanic, white, and Asian — celebrating with their graduating students"
            width={1280}
            height={896}
            loading="lazy"
            className="h-56 w-full object-cover md:h-64"
          />
        </div>
        <h3 className="font-display text-3xl font-bold text-navy md:text-4xl">
          <span style={{ color: "#4a6fb0" }}>
            Built for the parent who wants to help but doesn't know how.
          </span>
        </h3>
        <ul className="mt-8 space-y-4">
          {[
            "Understand financial aid in plain language",
            "Know every deadline before it passes",
            "Get a graduation party planned without overpaying.",
          ].map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full"
                style={{ background: "#4a6fb0" }}
              />
              <span className="text-foreground">{b}</span>
            </li>
          ))}
        </ul>
        <Link to="/auth" className="mt-8 inline-block">
          <Button
            variant="outline"
            className="border-2 text-foreground hover:bg-navy hover:text-foreground"
            style={{ borderColor: "#4a6fb0", color: "#9ab4dc" }}
          >
            Learn more <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      cadence: "/month",
      border: "border-border",
      cta: "outline",
      features: [
        "Scholarship search",
        "5 P conversations / month",
        "Community access",
        "Senior year checklist",
      ],
    },
    {
      name: "Student Pro",
      price: "$4.99",
      cadence: "/month",
      border: "border-burnt",
      popular: true,
      cta: "burnt",
      features: [
        "Everything in Free",
        "Unlimited P conversations",
        "Essay feedback",
        "All Canva templates",
        "Full internship database",
        "Priority community",
      ],
    },
    {
      name: "Family Plan",
      price: "$7.99",
      cadence: "/month",
      border: "border-maroon",
      cta: "maroon",
      features: [
        "1 student + 1 parent account",
        "All Pro features for both",
        "Parent FAFSA guide",
        "Cost calculator",
      ],
    },
  ];
  return (
    <section id="pricing" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Straightforward pricing. <span className="text-gold">No surprises.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border-2 ${p.border} bg-surface p-8 ${
                p.popular ? "shadow-burnt lg:-translate-y-3" : ""
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-background">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold text-foreground">
                  {p.price}
                </span>
                <span className="text-muted-foreground">{p.cadence}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-burnt" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="mt-8 block">
                <Button
                  className={`w-full ${
                    p.cta === "burnt"
                      ? "bg-burnt text-primary-foreground hover:bg-burnt/90"
                      : p.cta === "maroon"
                      ? "bg-maroon text-foreground hover:bg-maroon/80"
                      : "border border-foreground/40 bg-transparent text-foreground hover:bg-foreground/5"
                  }`}
                >
                  Choose {p.name}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center font-sans italic text-gold">
          Need help affording Pro? Find a scholarship through The Plug and use your winnings. We mean it.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Platform", items: ["Features", "Pricing", "Community", "About"] },
    { h: "Students", items: ["Scholarships", "Internships", "Summer Programs", "Talk to P"] },
    { h: "Parents", items: ["FAFSA Guide", "Cost Calculator", "Senior Year Guide", "Parent Forum"] },
    { h: "Company", items: ["Privacy Policy", "Terms of Service", "Contact", "FERPA Compliance"] },
  ];
  return (
    <footer className="bg-black">
      <div className="h-1 w-full bg-gradient-rule" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <img src={plugLogo.url} alt="The Plug logo" className="h-10 w-10 rounded-lg object-contain" />
              <span className="font-display text-2xl font-bold text-gold">The Plug</span>
            </div>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Your unfair advantage.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {c.h}
              </h4>
              <ul className="mt-3 space-y-2">
                {c.items.map((it) => (
                  <li key={it}>
                    <a
                      href="#"
                      className="text-sm text-foreground/80 transition hover:text-gold"
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-maroon">
        <p className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-muted-foreground">
          © 2026 The Plug. Built for first-generation students and the families
          who believe in them. Student data is never sold or shared.
        </p>
      </div>
    </footer>
  );
}
