import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, Users, BookOpen, ArrowRight, Zap, Trophy, Calendar, Music2, VolumeX, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Plug — Your unfair advantage" },
      { name: "description", content: "The one-stop platform for high school students and parents. Academic support, college readiness, creative resources, and community." },
    ],
  }),
  component: Landing,
});

// Royalty-free upbeat marching-band-ish track (Pixabay CDN). Swap freely.
const MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc6c4b8.mp3?filename=marching-band-sport-intro-122222.mp3";

function Landing() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) {
      const a = new Audio(MUSIC_URL);
      a.loop = true;
      a.volume = 0.5;
      audioRef.current = a;
    }
    try {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
    } catch (e) {
      console.error("Music playback failed", e);
    }
  };

  // Floating music notes
  const notes = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 10,
        size: 14 + Math.random() * 22,
      })),
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-night">
      {/* Cursor-following gold glow */}
      <div
        className="pointer-events-none fixed -z-0 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl transition-transform duration-300 ease-out"
        style={{
          background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
          transform: `translate(${mouse.x - 250}px, ${mouse.y - 250}px)`,
        }}
      />

      {/* Pulsing stadium spotlights */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gold/20 blur-3xl"
        animate={{ opacity: [0.15, 0.45, 0.15], scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Floating music notes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {notes.map((n) => (
          <motion.div
            key={n.id}
            className="absolute text-gold/40"
            style={{ left: `${n.left}%`, bottom: -40, fontSize: n.size }}
            animate={{
              y: [0, -window.innerHeight - 80],
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

      {/* Grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
              <span className="font-display text-lg font-bold text-primary-foreground">P</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">The Plug</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMusic}
              className="group border-gold/40 bg-card/40 hover:bg-gold/10 hover:text-gold"
              aria-label={playing ? "Pause music" : "Play hype music"}
            >
              {playing ? (
                <Volume2 className="mr-1 h-4 w-4 animate-pulse text-gold" />
              ) : (
                <VolumeX className="mr-1 h-4 w-4" />
              )}
              {playing ? "Hype: ON" : "Play hype music"}
            </Button>
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground hover:text-gold">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 text-center md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          For students and parents
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
        >
          Your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-gold bg-clip-text text-transparent">unfair</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -bottom-1 left-0 h-1 w-full origin-left rounded-full bg-gradient-gold"
            />
          </span>{" "}
          advantage.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          The one-stop platform built for high school. Academic support, college prep, creative
          resources, and a community that has your back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="group bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
            >
              <GraduationCap className="mr-1 h-4 w-4" />
              I'm a Student
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button
              size="lg"
              variant="outline"
              className="group border-gold/40 bg-card/40 hover:bg-gold/10 hover:text-gold"
            >
              <Users className="mr-1 h-4 w-4" />
              I'm a Parent
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Stat ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted-foreground"
        >
          {[
            { icon: Trophy, label: "$2M+ in scholarships tracked" },
            { icon: Zap, label: "AI tutoring 24/7" },
            { icon: Calendar, label: "Never miss a deadline" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-gold" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Modules */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-24 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, title: "Academic Support", body: "Resource library and AI tutoring whenever you're stuck." },
          { icon: GraduationCap, title: "College & Career", body: "Application tracker, scholarship search, FAFSA dates." },
          { icon: Sparkles, title: "Creative Resources", body: "Grad templates, senior guides, HOCO planning." },
          { icon: Users, title: "Community", body: "Discussion spaces organized by what matters to you." },
        ].map(({ icon: Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-gold/50"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <Icon className="h-7 w-7 text-gold" />
            <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA strip */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-10 text-center shadow-gold"
        >
          <div className="absolute inset-0 bg-gradient-gold opacity-10" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Ready to plug in?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join students and parents already using The Plug to win high school.
            </p>
            <Link to="/auth" className="mt-6 inline-block">
              <Button
                size="lg"
                className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              >
                Create your account <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
