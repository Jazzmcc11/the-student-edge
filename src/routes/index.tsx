import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, Users, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Plug — Your unfair advantage" },
      { name: "description", content: "The one-stop platform for high school students and parents. Academic support, college readiness, creative resources, and community." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-night">
      {/* Nav */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
              <span className="font-display text-lg font-bold text-primary-foreground">P</span>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">The Plug</span>
          </div>
          <Link to="/auth">
            <Button variant="ghost" className="text-foreground hover:text-gold">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium text-gold">
          <Sparkles className="h-3.5 w-3.5" />
          For students and parents
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
          Your <span className="bg-gradient-gold bg-clip-text text-transparent">unfair</span> advantage.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The one-stop platform built for high school. Academic support, college prep, creative resources, and a community that has your back.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95">
              Get started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="border-border bg-card/40">
              I'm a parent
            </Button>
          </Link>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-24 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, title: "Academic Support", body: "Resource library and AI tutoring." },
          { icon: GraduationCap, title: "College & Career", body: "Tracker, scholarships, FAFSA dates." },
          { icon: Sparkles, title: "Creative Resources", body: "Grad templates, senior guides, HOCO." },
          { icon: Users, title: "Community", body: "Discussion spaces by topic." },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-gold/40 hover:shadow-gold"
          >
            <Icon className="h-7 w-7 text-gold" />
            <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
