import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Accent = "gold" | "burnt" | "maroon" | "navy";
type ThemeMode = "light" | "dark" | "system";

type Ctx = {
  accent: Accent;
  themeMode: ThemeMode;
  setAccent: (a: Accent) => Promise<void>;
  setThemeMode: (m: ThemeMode) => Promise<void>;
};

const ThemeCtx = createContext<Ctx>({
  accent: "gold",
  themeMode: "dark",
  setAccent: async () => {},
  setThemeMode: async () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

function apply(accent: Accent, mode: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute("data-accent", accent);
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : mode;
  root.classList.toggle("dark", resolved === "dark");
  root.setAttribute("data-theme", resolved);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<Accent>("gold");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        apply("gold", "dark");
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("accent, theme_mode")
        .eq("id", user.id)
        .maybeSingle();
      const a = (data?.accent as Accent) || "gold";
      const m = (data?.theme_mode as ThemeMode) || "dark";
      setAccentState(a);
      setThemeModeState(m);
      apply(a, m);
    })();
  }, []);

  async function setAccent(a: Accent) {
    setAccentState(a);
    apply(a, themeMode);
    if (userId) await supabase.from("profiles").update({ accent: a }).eq("id", userId);
  }

  async function setThemeMode(m: ThemeMode) {
    setThemeModeState(m);
    apply(accent, m);
    if (userId) await supabase.from("profiles").update({ theme_mode: m }).eq("id", userId);
  }

  return (
    <ThemeCtx.Provider value={{ accent, themeMode, setAccent, setThemeMode }}>
      {children}
    </ThemeCtx.Provider>
  );
}
