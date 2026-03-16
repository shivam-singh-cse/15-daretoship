"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getLevelFromXp } from "@/lib/levels";
import { getMissionByDay, missions } from "@/lib/missions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BuilderUser, ProgressRow, ProjectRow, SubmissionRow } from "@/lib/types";

type AuthMode = "signup" | "signin";
type DetailTab = "roadmap" | "submissions" | "stack";
type IdeaTab = "game" | "product";

const roadmapPhases = [
  {
    id: "mindset",
    label: "Days 1-3",
    title: "Builder Mindset",
    learn: "You learn how to spot real student problems and turn them into simple ideas.",
    build: "You build your first product direction and choose a problem worth solving.",
    goal: "Finish this phase with one clear idea you feel confident building.",
  },
  {
    id: "prompting",
    label: "Days 4-5",
    title: "Prompt Like a Builder",
    learn: "You learn how to ask AI for better screens, features, and code help.",
    build: "You build stronger prompts that guide AI tools more clearly.",
    goal: "Use AI as a practical building partner instead of just chatting with it.",
  },
  {
    id: "game",
    label: "Days 6-8",
    title: "Build a Simple Game",
    learn: "You learn how a small project comes together from idea to playable version.",
    build: "You build one browser game and ship a live link.",
    goal: "Gain confidence by finishing something fun and real.",
  },
  {
    id: "product",
    label: "Days 9-13",
    title: "Build a Micro Product",
    learn: "You learn how to make an AI product useful, simple, and easy to understand.",
    build: "You build one small product that solves a real student problem.",
    goal: "Ship a product people can actually use and show to others.",
  },
  {
    id: "launch",
    label: "Days 14-15",
    title: "Launch and Demo",
    learn: "You learn how to present what you built and explain its value clearly.",
    build: "You build your launch page and prepare your final demo.",
    goal: "End the bootcamp with two finished projects and proof of your work.",
  },
];

const gameIdeas = [
  { title: "Reaction Speed Test", description: "Click when the screen changes color and measure reaction time." },
  { title: "Number Guessing Game", description: "Guess a number between 1 and 100 with hints." },
  { title: "Typing Speed Test", description: "Measure words per minute and typing accuracy." },
  { title: "Click Counter Challenge", description: "See how many clicks a user can make in 10 seconds." },
  { title: "Memory Card Match", description: "Flip cards and match identical pairs." },
  { title: "Color Match Game", description: "Pick the correct color based on the name shown." },
  { title: "AI Trivia Quiz", description: "A quiz game with randomly generated questions." },
  { title: "Dodge the Falling Blocks", description: "Move left or right to avoid falling obstacles." },
  { title: "Rock Paper Scissors vs AI", description: "Classic game played against an AI opponent." },
  { title: "Snake Game", description: "A simple version of the classic snake game." },
];

const productIdeas = [
  { title: "AI Lecture Notes Cleaner", description: "Paste messy lecture notes and convert them into structured summaries." },
  { title: "Resume Bullet Improver", description: "Improve resume bullet points using AI suggestions." },
  { title: "Study Timer + Focus Tracker", description: "A simple Pomodoro-style study timer with progress tracking." },
  { title: "AI Email Reply Generator", description: "Generate quick responses to emails." },
  { title: "Meeting Notes Summarizer", description: "Convert raw meeting notes into concise summaries." },
  { title: "Assignment Reminder Tool", description: "Track assignments and receive reminders." },
  { title: "AI Instagram Caption Generator", description: "Generate captions based on a short description." },
  { title: "Startup Idea Generator", description: "Generate startup ideas based on selected categories." },
  { title: "Habit Tracker", description: "Track daily habits and maintain streaks." },
  { title: "College Resource Hub", description: "Upload and share study resources among students." },
];

const learnItems = [
  "How to identify real problems worth solving",
  "How to turn a problem into a simple product idea",
  "How to use AI tools to build software faster",
  "How to ship and deploy projects online",
  "How to build and launch micro products with confidence",
];

const getItems = [
  "Two real projects you build yourself: one game and one micro product",
  "A certificate for completing the bootcamp",
  "Early access to our upcoming student platform",
];

const xpActions = [
  { label: "Complete a mission", value: "+20" },
  { label: "Submit your game", value: "+50" },
  { label: "Submit your micro product", value: "+100" },
];

const stackItems = [
  { title: "Supabase", description: "Handles login, progress saving, submissions, and project links." },
  { title: "Vercel", description: "Deploys the app so students can share their work online." },
  { title: "Resend", description: "Sends onboarding and reminder emails at the right time." },
];

function scrollToRef(ref: React.RefObject<HTMLElement | null>) {
  ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[var(--blue)] text-lg font-black text-[var(--lime)]">
        B
      </div>
      <p className="text-xl font-black tracking-[-0.04em] text-black">BuildLoop</p>
    </div>
  );
}

function Ticker() {
  const items = ["BUILD 2 REAL PROJECTS", "BEGINNER FRIENDLY", "ONE MISSION EACH DAY", "LEARN BY BUILDING", "LAUNCH IN 15 DAYS"];

  return (
    <div className="border-t-2 border-black bg-[var(--blue)] py-2 text-[11px] font-black tracking-[0.24em] text-[var(--lime)]">
      <div className="flex min-w-max gap-10 whitespace-nowrap px-6">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function TopNav({
  authenticated,
  level,
  onSignOut,
  onMissionClick,
  onProgressClick,
  onProjectsClick,
  homeLinks,
  onAuthOpen,
}: {
  authenticated: boolean;
  level?: string;
  onSignOut?: () => void;
  onMissionClick?: () => void;
  onProgressClick?: () => void;
  onProjectsClick?: () => void;
  homeLinks?: Array<{ label: string; onClick: () => void }>;
  onAuthOpen?: () => void;
}) {
  return (
    <header className="border-b-2 border-black bg-[#fbfaf6]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-black/75 md:flex">
          {authenticated ? (
            <>
              <button type="button" onClick={onMissionClick} className="hover:text-[var(--blue)]">
                Mission
              </button>
              <button type="button" onClick={onProgressClick} className="hover:text-[var(--blue)]">
                Progress
              </button>
              <button type="button" onClick={onProjectsClick} className="hover:text-[var(--blue)]">
                Projects
              </button>
            </>
          ) : (
            homeLinks?.map((link) => (
              <button key={link.label} type="button" onClick={link.onClick} className="hover:text-[var(--blue)]">
                {link.label}
              </button>
            ))
          )}
        </nav>
        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              <div className="border-2 border-black bg-[#f3f0e8] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-black">
                {level}
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="border-2 border-black bg-[var(--blue)] px-5 py-3 text-sm font-black text-white transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onAuthOpen}
              className="border-2 border-black bg-[var(--blue)] px-5 py-3 text-sm font-black text-white transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
      <Ticker />
    </header>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex border-2 border-black bg-[var(--lime)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-black">
      {children}
    </div>
  );
}

function BrutalCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border-2 border-black bg-white ${className}`}>{children}</div>;
}

function DetailTabs({ active, setActive }: { active: DetailTab; setActive: (tab: DetailTab) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[
        { id: "roadmap", label: "Roadmap" },
        { id: "submissions", label: "Projects" },
        { id: "stack", label: "Stack" },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActive(tab.id as DetailTab)}
          className={`border-2 border-black px-4 py-2 text-sm font-black transition ${
            active === tab.id
              ? "bg-[var(--blue)] text-white shadow-[4px_4px_0px_#111]"
              : "bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function StatusCard({ title, value }: { title: string; value: string }) {
  return (
    <BrutalCard className="p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">{title}</p>
      <p className="mt-2 text-sm font-black text-black">{value}</p>
    </BrutalCard>
  );
}

function FeatureCard({
  accent,
  title,
  description,
}: {
  accent: string;
  title: string;
  description: string;
}) {
  return (
    <BrutalCard className="p-6">
      <div className={`flex h-11 w-11 items-center justify-center border-2 border-black ${accent} text-sm font-black text-black`}>
        +
      </div>
      <p className="mt-5 text-xl font-black tracking-[-0.03em] text-black">{title}</p>
      <p className="mt-3 text-sm leading-7 text-black/70">{description}</p>
    </BrutalCard>
  );
}

function SubmissionForm({
  title,
  value,
  onChange,
  onSubmit,
  pending,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  placeholder: string;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="border-2 border-black bg-white p-6"
    >
      <p className="text-lg font-black text-black">{title}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-5 w-full border-2 border-black bg-[#fbfaf6] px-4 py-3 outline-none focus:bg-white"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-5 border-2 border-black bg-[var(--lime)] px-5 py-3 text-sm font-black text-black transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-70"
      >
        Save link
      </button>
    </form>
  );
}

export function DashboardApp() {
  const router = useRouter();
  const hasSupabaseEnv = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
  );
  const [supabase] = useState(() => (hasSupabaseEnv ? createSupabaseBrowserClient() : null));
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<BuilderUser | null>(null);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [submissionRows, setSubmissionRows] = useState<SubmissionRow[]>([]);
  const [projectRows, setProjectRows] = useState<ProjectRow[]>([]);
  const [gameUrl, setGameUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState<DetailTab>("roadmap");
  const [ideaTab, setIdeaTab] = useState<IdeaTab>("game");
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [openRoadmapId, setOpenRoadmapId] = useState<string>("mindset");
  const [authPending, startAuthTransition] = useTransition();
  const [projectPending, startProjectTransition] = useTransition();
  const onboardingHandledRef = useRef<Set<string>>(new Set());
  const authSectionRef = useRef<HTMLElement | null>(null);
  const missionSectionRef = useRef<HTMLElement | null>(null);
  const progressSectionRef = useRef<HTMLElement | null>(null);
  const projectsSectionRef = useRef<HTMLElement | null>(null);
  const roadmapIntroRef = useRef<HTMLElement | null>(null);
  const ideasRef = useRef<HTMLElement | null>(null);
  const learnRef = useRef<HTMLElement | null>(null);
  const getRef = useRef<HTMLElement | null>(null);

  const completedDays = useMemo(
    () =>
      progressRows
        .filter((row) => row.completed)
        .map((row) => row.day_number)
        .sort((a, b) => a - b),
    [progressRows],
  );

  const nextMission = useMemo(() => {
    const nextDay = missions.find((mission) => !completedDays.includes(mission.day))?.day ?? 15;
    return getMissionByDay(nextDay) ?? missions[0];
  }, [completedDays]);

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? "Explorer";
  const progressPercent = (completedDays.length / missions.length) * 100;
  const gameProject = projectRows.find((project) => project.type === "game");
  const productProject = projectRows.find((project) => project.type === "product");
  const visibleIdeas = ideaTab === "game" ? gameIdeas : productIdeas;

  async function loadDashboard(userId: string, fallbackName?: string, fallbackEmail?: string) {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const results = await Promise.allSettled([
      supabase.from("users").select("*").eq("id", userId).maybeSingle(),
      supabase.from("progress").select("*").eq("user_id", userId).order("day_number"),
      supabase.from("submissions").select("*").eq("user_id", userId).order("day_number", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", userId),
    ]);

    const userResult = results[0].status === "fulfilled" ? results[0].value.data : null;
    const progressResult = results[1].status === "fulfilled" ? results[1].value.data : [];
    const submissionResult = results[2].status === "fulfilled" ? results[2].value.data : [];
    const projectResult = results[3].status === "fulfilled" ? results[3].value.data : [];

    let resolvedUser = userResult as BuilderUser | null;

    if (!resolvedUser && fallbackEmail) {
      const inserted = await supabase
        .from("users")
        .upsert({
          id: userId,
          name: fallbackName || "Builder",
          email: fallbackEmail,
          xp: 0,
          level: getLevelFromXp(0),
        })
        .select()
        .single();

      resolvedUser = (inserted.data as BuilderUser | null) ?? {
        id: userId,
        name: fallbackName || "Builder",
        email: fallbackEmail,
        xp: 0,
        level: getLevelFromXp(0),
      };
    }

    if (resolvedUser) {
      setProfile(resolvedUser);
    }
    setProgressRows((progressResult as ProgressRow[]) ?? []);
    setSubmissionRows((submissionResult as SubmissionRow[]) ?? []);
    setProjectRows((projectResult as ProjectRow[]) ?? []);
    setGameUrl((projectResult as ProjectRow[] | null)?.find((row) => row.type === "game")?.url ?? "");
    setProductUrl((projectResult as ProjectRow[] | null)?.find((row) => row.type === "product")?.url ?? "");
  }

  async function maybeSendOnboardingEmail(user: {
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown>;
  }) {
    if (!supabase || !user.email || !user.email_confirmed_at) {
      return;
    }
    if (user.user_metadata?.onboarded || onboardingHandledRef.current.has(user.id)) {
      return;
    }

    onboardingHandledRef.current.add(user.id);

    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Builder",
        kind: "welcome",
      }),
    }).catch(() => null);

    if (!response?.ok) {
      onboardingHandledRef.current.delete(user.id);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        onboarded: true,
      },
    });

    if (error) {
      onboardingHandledRef.current.delete(user.id);
    }
  }

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) {
        return;
      }

      const user = data.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      setAuthUserId(user.id);
      setProfile({
        id: user.id,
        name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Builder",
        email: user.email ?? "",
        xp: 0,
        level: getLevelFromXp(0),
      });
      setLoading(false);
      void loadDashboard(user.id, user.user_metadata?.name, user.email);
      void maybeSendOnboardingEmail(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setAuthUserId(user?.id ?? null);

      if (!user) {
        setProfile(null);
        setProgressRows([]);
        setSubmissionRows([]);
        setProjectRows([]);
        setLoading(false);
        return;
      }

      setProfile((current) =>
        current ?? {
          id: user.id,
          name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Builder",
          email: user.email ?? "",
          xp: 0,
          level: getLevelFromXp(0),
        },
      );
      setLoading(false);
      void loadDashboard(user.id, user.user_metadata?.name, user.email);
      void maybeSendOnboardingEmail(user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    startAuthTransition(async () => {
      if (!supabase) {
        setStatusMessage("Add Supabase environment variables to continue.");
        return;
      }

      const action =
        authMode === "signup"
          ? await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { name },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            })
          : await supabase.auth.signInWithPassword({ email, password });

      if (action.error) {
        setStatusMessage(action.error.message);
        return;
      }

      const user = action.data.user;

      if (authMode === "signup" && user) {
        await supabase.from("users").upsert({
          id: user.id,
          name: name || user.user_metadata?.name || "Builder",
          email: user.email ?? email,
          xp: 0,
          level: getLevelFromXp(0),
        });
        setAuthMode("signin");
        setStatusMessage("Confirmation email sent. Verify your email, then log in.");
        return;
      }

      setStatusMessage("Welcome back.");
      router.push("/dashboard");
    });
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setStatusMessage("Signed out.");
  }

  async function saveProject(type: "game" | "product", url: string) {
    if (!supabase || !authUserId || !profile || !url.trim()) {
      return;
    }

    startProjectTransition(async () => {
      const existing = projectRows.find((project) => project.type === type);
      const reward = type === "game" ? 50 : 100;
      const shouldAwardXp = !existing;
      const nextXp = shouldAwardXp ? profile.xp + reward : profile.xp;
      const nextLevel = getLevelFromXp(nextXp);

      const { data: savedProject, error: projectError } = await supabase
        .from("projects")
        .upsert(
          {
            user_id: authUserId,
            type,
            url: url.trim(),
          },
          { onConflict: "user_id,type" },
        )
        .select()
        .single();

      if (projectError) {
        setStatusMessage(projectError.message);
        return;
      }

      if (shouldAwardXp) {
        const { data: updatedUser, error: userError } = await supabase
          .from("users")
          .update({ xp: nextXp, level: nextLevel })
          .eq("id", authUserId)
          .select()
          .single();

        if (userError) {
          setStatusMessage(userError.message);
          return;
        }

        setProfile(updatedUser as BuilderUser);
      }

      setProjectRows((current) => {
        const rest = current.filter((project) => project.type !== type);
        return [...rest, savedProject as ProjectRow];
      });
      setStatusMessage(
        shouldAwardXp
          ? `${type === "game" ? "Game" : "Micro product"} submitted. +${reward} XP earned.`
          : `${type === "game" ? "Game" : "Micro product"} URL updated.`,
      );
    });
  }

  if (loading) {
    return (
      <main>
        <TopNav authenticated={false} />
        <div className="grid-dots min-h-[calc(100vh-92px)]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <BrutalCard className="p-8">
              <p className="text-sm font-medium text-black/60">Loading your mission dashboard...</p>
            </BrutalCard>
          </div>
        </div>
      </main>
    );
  }

  if (!authUserId || !profile) {
    return (
      <main>
        <TopNav
          authenticated={false}
          homeLinks={[
            { label: "Check Roadmap", onClick: () => scrollToRef(roadmapIntroRef) },
            { label: "Explore Ideas", onClick: () => scrollToRef(ideasRef) },
            { label: "What You Will Learn", onClick: () => scrollToRef(learnRef) },
            { label: "What You Will Get", onClick: () => scrollToRef(getRef) },
          ]}
          onAuthOpen={() => scrollToRef(authSectionRef)}
        />

        <section className="grid-dots">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
            <div>
              <SectionLabel>15-DAY AI BOOTCAMP</SectionLabel>
              <h1 className="mt-8 text-5xl font-black leading-[0.94] tracking-[-0.07em] text-black sm:text-6xl lg:text-7xl">
                Build your first
                <br />
                <span className="text-[var(--blue)]">AI products.</span>
                <br />
                <span className="text-black/30">One day at a time.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-black/70">
                A beginner-friendly bootcamp for college students. You will build one game, one
                micro product, and learn how to launch both.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => scrollToRef(authSectionRef)}
                  className="border-2 border-black bg-[var(--blue)] px-7 py-4 text-sm font-black text-white shadow-[6px_6px_0px_#111] transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                >
                  Get Started
                </button>
                <button
                  type="button"
                  onClick={() => scrollToRef(roadmapIntroRef)}
                  className="border-2 border-black bg-[var(--lime)] px-7 py-4 text-sm font-black text-black shadow-[6px_6px_0px_#111] transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                >
                  Check Roadmap
                </button>
              </div>
            </div>

            <section ref={authSectionRef}>
              <BrutalCard className="bg-white p-6 shadow-[8px_8px_0px_#111]">
                <SectionLabel>{authMode === "signup" ? "JOIN THE JOURNEY" : "WELCOME BACK"}</SectionLabel>
                <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-black">
                  {authMode === "signup" ? "Create your account to start building." : "Log in and open your dashboard."}
                </p>
                <div className="mt-6 flex gap-2 border-2 border-black bg-[#f1eee5] p-1">
                  {(["signup", "signin"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAuthMode(mode)}
                      className={`flex-1 border-2 border-black px-4 py-3 text-sm font-black transition ${
                        authMode === mode ? "bg-[var(--blue)] text-white" : "bg-white text-black"
                      }`}
                    >
                      {mode === "signup" ? "Sign Up" : "Log In"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
                  {!hasSupabaseEnv ? (
                    <div className="border-2 border-black bg-[#ffe08b] px-4 py-3 text-sm font-medium text-black">
                      Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to continue.
                    </div>
                  ) : null}

                  {authMode === "signup" ? (
                    <label className="block text-sm font-black text-black">
                      Name
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2 w-full border-2 border-black bg-[#fbfaf6] px-4 py-3 outline-none focus:bg-white"
                        placeholder="Your name"
                      />
                    </label>
                  ) : null}

                  <label className="block text-sm font-black text-black">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-2 w-full border-2 border-black bg-[#fbfaf6] px-4 py-3 outline-none focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="block text-sm font-black text-black">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-2 w-full border-2 border-black bg-[#fbfaf6] px-4 py-3 outline-none focus:bg-white"
                      placeholder={authMode === "signup" ? "Create a password" : "Enter your password"}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={authPending}
                    className="w-full border-2 border-black bg-[var(--blue)] px-6 py-4 text-sm font-black text-white shadow-[6px_6px_0px_#111] transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:opacity-70"
                  >
                    {authPending
                      ? "Please wait..."
                      : authMode === "signup"
                        ? "Create account"
                        : "Open dashboard"}
                  </button>

                  {statusMessage ? <p className="text-sm text-black/70">{statusMessage}</p> : null}
                </form>
              </BrutalCard>
            </section>
          </div>
        </section>

        <section ref={roadmapIntroRef} className="border-t-2 border-black bg-[#fbfaf6] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionLabel>CHECK ROADMAP</SectionLabel>
            <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] text-black sm:text-5xl">
              See the journey
              <br />
              <span className="text-[var(--blue)]">before you start.</span>
            </h2>
            <div className="mt-10 grid gap-4">
              {roadmapPhases.map((phase) => {
                const isOpen = openRoadmapId === phase.id;
                return (
                  <BrutalCard key={phase.id} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenRoadmapId(isOpen ? "" : phase.id)}
                      className="flex w-full items-start justify-between gap-4 bg-white px-6 py-5 text-left"
                    >
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">{phase.label}</p>
                        <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-black">{phase.title}</p>
                      </div>
                      <div className="border-2 border-black bg-[var(--lime)] px-3 py-1 text-xs font-black uppercase text-black">
                        {isOpen ? "Hide" : "Open"}
                      </div>
                    </button>
                    {isOpen ? (
                      <div className="border-t-2 border-black bg-[#f4f0e6] px-6 py-5 text-sm leading-7 text-black">
                        <p>
                          <span className="font-black">What you learn:</span> {phase.learn}
                        </p>
                        <p className="mt-3">
                          <span className="font-black">What you build:</span> {phase.build}
                        </p>
                        <p className="mt-3">
                          <span className="font-black">Goal:</span> {phase.goal}
                        </p>
                      </div>
                    ) : null}
                  </BrutalCard>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={ideasRef} className="border-t-2 border-black bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionLabel>EXPLORE IDEAS</SectionLabel>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black tracking-[-0.05em] text-black sm:text-5xl">
                  Pick a simple idea
                  <br />
                  <span className="text-[var(--blue)]">if you feel stuck.</span>
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-black/70">
                  You can choose a fun game idea or a useful micro product idea. These are here to
                  help beginners start faster.
                </p>
              </div>
              <div className="flex gap-2">
                {([
                  { id: "game", label: "Simple Game Ideas" },
                  { id: "product", label: "Simple Product Ideas" },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setIdeaTab(tab.id);
                      setSelectedIdea(null);
                    }}
                    className={`border-2 border-black px-4 py-3 text-sm font-black transition ${
                      ideaTab === tab.id
                        ? "bg-[var(--blue)] text-white shadow-[4px_4px_0px_#111]"
                        : "bg-white text-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleIdeas.map((idea, index) => {
                const active = selectedIdea === idea.title;
                return (
                  <button
                    key={idea.title}
                    type="button"
                    onClick={() => setSelectedIdea(idea.title)}
                    className={`border-2 border-black p-5 text-left transition ${
                      active
                        ? "bg-[var(--lime)] shadow-[6px_6px_0px_#111]"
                        : "bg-white hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[6px_6px_0px_#111]"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">
                      Idea {index + 1}
                    </p>
                    <p className="mt-3 text-xl font-black tracking-[-0.03em] text-black">{idea.title}</p>
                    <p className="mt-3 text-sm leading-7 text-black/70">{idea.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={learnRef} className="border-t-2 border-black bg-[#fbfaf6] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionLabel>WHAT YOU WILL LEARN</SectionLabel>
            <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] text-black sm:text-5xl">
              Skills that help you
              <br />
              <span className="text-[var(--blue)]">build with confidence.</span>
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {learnItems.map((item) => (
                <BrutalCard key={item} className="p-5">
                  <p className="text-lg font-black tracking-[-0.03em] text-black">{item}</p>
                </BrutalCard>
              ))}
            </div>
          </div>
        </section>

        <section ref={getRef} className="border-t-2 border-b-2 border-black bg-black py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionLabel>WHAT YOU WILL GET</SectionLabel>
            <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              Real outcomes,
              <br />
              <span className="text-[var(--lime)]">not just lessons.</span>
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {getItems.map((item) => (
                <div key={item} className="border-2 border-white bg-black px-5 py-6">
                  <p className="text-lg font-black text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <TopNav
        authenticated
        level={level}
        onSignOut={handleSignOut}
        onMissionClick={() => scrollToRef(missionSectionRef)}
        onProgressClick={() => scrollToRef(progressSectionRef)}
        onProjectsClick={() => {
          setDetailTab("submissions");
          requestAnimationFrame(() => scrollToRef(projectsSectionRef));
        }}
      />

      <section ref={missionSectionRef} className="grid-dots">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
          <div>
            <SectionLabel>MISSION DASHBOARD</SectionLabel>
            <h1 className="mt-8 text-5xl font-black leading-[0.94] tracking-[-0.07em] text-black sm:text-6xl lg:text-7xl">
              Today&apos;s mission,
              <br />
              <span className="text-[var(--blue)]">made obvious.</span>
              <br />
              <span className="text-black/30">One clear next step.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-black/70">
              Welcome back, {profile.name}. Start the next mission, track your proof, and submit
              both project links from one place.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={`/mission/day-${nextMission.day}`}
                className="border-2 border-black bg-[var(--blue)] px-7 py-4 text-sm font-black text-white shadow-[6px_6px_0px_#111] transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
              >
                Start Day {nextMission.day}
              </Link>
              <div className="text-sm font-medium text-black/65">
                Next up: <span className="font-black text-black">{nextMission.title}</span>
              </div>
            </div>
          </div>

          <BrutalCard className="bg-white p-6 shadow-[8px_8px_0px_#111]">
            <SectionLabel>TODAY&apos;S MISSION</SectionLabel>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-black">{nextMission.title}</h2>
            <p className="mt-4 text-base leading-7 text-black/70">{nextMission.mission}</p>

            <div className="mt-6 border-2 border-black bg-[#f1eee5] p-1">
              <div
                className="h-4 bg-[var(--blue)] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <BrutalCard className="bg-[#eef0ff] px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">Progress</p>
                <p className="mt-2 text-2xl font-black text-black">
                  {completedDays.length} / {missions.length}
                </p>
              </BrutalCard>
              <BrutalCard className="bg-[#f7ffd5] px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">XP</p>
                <p className="mt-2 text-2xl font-black text-black">{xp}</p>
              </BrutalCard>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatusCard title="Game" value={gameProject ? "Submitted" : "Not started"} />
              <StatusCard title="Micro Product" value={productProject ? "Submitted" : "Not started"} />
            </div>

            {statusMessage ? (
              <div className="mt-4 border-2 border-black bg-[#f3f6ff] px-4 py-3 text-sm text-black/70">
                {statusMessage}
              </div>
            ) : null}
          </BrutalCard>
        </div>
      </section>

      <section ref={progressSectionRef} className="border-y-2 border-black bg-black py-10 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 text-center sm:px-6 lg:px-8">
          <div>
            <p className="text-4xl font-black text-[var(--lime)]">{completedDays.length}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/60">Completed days</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[var(--lime)]">{xp}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/60">Proof score</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[var(--lime)]">{level}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/60">Current level</p>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf6] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionLabel>WHAT THIS DASHBOARD DOES</SectionLabel>
          <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] text-black sm:text-5xl">
            Built to keep your
            <br />
            <span className="text-[var(--blue)]">next move clear.</span>
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <FeatureCard
              accent="bg-[#eef0ff]"
              title="One clear mission"
              description="The next day is ready the moment you open the dashboard."
            />
            <FeatureCard
              accent="bg-[#f7ffd5]"
              title="Visible progress"
              description="You can quickly see how many days are done and what is left."
            />
            <FeatureCard
              accent="bg-[#eef0ff]"
              title="Project proof"
              description="Your game and product links stay attached to your account."
            />
          </div>
        </div>
      </section>

      <section ref={projectsSectionRef} className="section-line bg-[#fbfaf6] py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <SectionLabel>PROOF SCORE</SectionLabel>
            <h2 className="mt-8 text-4xl font-black tracking-[-0.05em] text-black sm:text-5xl">
              Progress that
              <br />
              <span className="text-[var(--blue)]">actually counts.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-black/70">
              Each finished mission and each live project adds proof that you can build and ship.
            </p>
          </div>

          <div className="space-y-3">
            {xpActions.map((action, index) => (
              <div
                key={action.label}
                className={`flex items-center justify-between border-2 border-black px-5 py-5 text-sm font-black ${
                  index === 1
                    ? "bg-[var(--blue)] text-white shadow-[6px_6px_0px_#111]"
                    : index === 2
                      ? "bg-[var(--lime)] text-black shadow-[6px_6px_0px_#111]"
                      : "bg-white text-black"
                }`}
              >
                <span>{action.label}</span>
                <span className="text-xl">{action.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-line bg-[#fbfaf6] py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
          <div className="border-2 border-black bg-[var(--blue)] p-8 text-white shadow-[8px_8px_0px_#111]">
            <SectionLabel>YOUR CONTROL PANEL</SectionLabel>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.05em]">
              One place for missions, projects, and proof.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/80">
              Start the next mission, review the roadmap, and submit your project links without
              jumping between different sections.
            </p>
            <Link
              href={`/mission/day-${nextMission.day}`}
              className="mt-8 inline-flex border-2 border-black bg-[var(--lime)] px-6 py-4 text-sm font-black text-black transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            >
              Start Mission
            </Link>
          </div>

          <div className="space-y-5">
            <DetailTabs active={detailTab} setActive={setDetailTab} />

            {detailTab === "roadmap" ? (
              <div className="grid gap-3">
                {missions.map((mission) => {
                  const done = completedDays.includes(mission.day);
                  return (
                    <BrutalCard key={mission.day} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">
                            Day {mission.day} / {mission.phase}
                          </p>
                          <p className="mt-2 text-xl font-black tracking-[-0.03em] text-black">{mission.title}</p>
                        </div>
                        <div
                          className={`border-2 border-black px-3 py-1 text-xs font-black uppercase ${
                            done ? "bg-[var(--lime)] text-black" : "bg-[#f1eee5] text-black/65"
                          }`}
                        >
                          {done ? "Done" : mission.day === nextMission.day ? "Next" : "Upcoming"}
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm leading-7 text-black/75">
                        <p>
                          <span className="font-black">Learn:</span> {mission.mission}
                        </p>
                        <p>
                          <span className="font-black">Build:</span>{" "}
                          {mission.phase === "Build a Game"
                            ? "A simple browser game students can play."
                            : mission.phase === "Build a Micro Product"
                              ? "A useful student-focused micro product."
                              : mission.phase === "Launch"
                                ? "A launch-ready version and a demo."
                                : "The thinking and direction for what you will build next."}
                        </p>
                        <p>
                          <span className="font-black">Goal:</span> {mission.summary}
                        </p>
                      </div>
                    </BrutalCard>
                  );
                })}
              </div>
            ) : null}

            {detailTab === "submissions" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <SubmissionForm
                  title="Submit your game"
                  value={gameUrl}
                  onChange={setGameUrl}
                  onSubmit={() => void saveProject("game", gameUrl)}
                  pending={projectPending}
                  placeholder="https://your-game-url.com"
                />
                <SubmissionForm
                  title="Submit your micro product"
                  value={productUrl}
                  onChange={setProductUrl}
                  onSubmit={() => void saveProject("product", productUrl)}
                  pending={projectPending}
                  placeholder="https://your-product-url.com"
                />
              </div>
            ) : null}

            {detailTab === "stack" ? (
              <div className="grid gap-3 md:grid-cols-3">
                {stackItems.map((item) => (
                  <FeatureCard
                    key={item.title}
                    accent={item.title === "Resend" ? "bg-[#f7ffd5]" : "bg-[#eef0ff]"}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
