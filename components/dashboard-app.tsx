"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getLevelFromXp } from "@/lib/levels";
import { getMissionByDay, missions } from "@/lib/missions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BuilderUser, ProgressRow, ProjectRow, SubmissionRow } from "@/lib/types";

type AuthMode = "signup" | "signin";
type DetailTab = "roadmap" | "submissions" | "log" | "stack";

const xpActions = [
  { label: "Complete a mission", value: "+20" },
  { label: "Submit your game", value: "+50" },
  { label: "Submit your micro product", value: "+100" },
];

const stackItems = [
  {
    title: "Supabase",
    description: "Handles auth, progress, mission submissions, and project links.",
  },
  {
    title: "Vercel",
    description: "Deploys the app fast so students can share what they build.",
  },
  {
    title: "Resend",
    description: "Sends onboarding and reminder emails at the right moment.",
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--blue)] text-lg font-bold text-[var(--lime)] shadow-glow">
        B
      </div>
      <p className="text-base font-semibold text-[var(--ink)]">BuildLoop</p>
    </div>
  );
}

function Ticker() {
  const items = [
    "TODAY'S MISSION FIRST",
    "BUILD IN PUBLIC",
    "SHIP 2 REAL PROJECTS",
    "15 DAYS OF PROOF",
    "BEGINNER FRIENDLY",
  ];

  return (
    <div className="overflow-hidden bg-[var(--blue)] py-2 text-[11px] font-bold tracking-[0.24em] text-[var(--lime)]">
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
}: {
  authenticated: boolean;
  level?: string;
  onSignOut?: () => void;
}) {
  return (
    <header className="border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-black/70 md:flex">
          <span>Mission</span>
          <span>Progress</span>
          <span>Projects</span>
        </nav>
        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              <div className="nav-pill rounded-full px-4 py-2 text-sm text-black/70">{level}</div>
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <span className="hidden text-sm text-black/70 sm:inline">Sign In</span>
              <button
                type="button"
                className="rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
      <Ticker />
    </header>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-md bg-[var(--lime)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-black">
      {children}
    </div>
  );
}

function DetailTabs({
  active,
  setActive,
}: {
  active: DetailTab;
  setActive: (tab: DetailTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[
        { id: "roadmap", label: "Roadmap" },
        { id: "submissions", label: "Projects" },
        { id: "log", label: "Builder Log" },
        { id: "stack", label: "Stack" },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActive(tab.id as DetailTab)}
          className={`rounded-full px-4 py-2 text-sm transition ${
            active === tab.id
              ? "bg-[var(--blue)] text-white"
              : "nav-pill text-black/70 hover:bg-black/[0.03]"
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
    <div className="rounded-2xl border border-black/6 bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.16em] text-black/45">{title}</p>
      <p className="mt-2 text-sm font-bold text-black">{value}</p>
    </div>
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
    <div className="rounded-[1.7rem] border border-black/6 bg-white p-6">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent} text-sm font-bold text-[var(--blue)]`}
      >
        +
      </div>
      <p className="mt-5 text-xl font-bold text-black">{title}</p>
      <p className="mt-3 text-sm leading-7 text-black/60">{description}</p>
    </div>
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
      className="rounded-[1.7rem] border border-black/6 bg-white p-6"
    >
      <p className="text-lg font-bold text-black">{title}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--blue)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-xl bg-[var(--lime)] px-5 py-3 text-sm font-bold text-black transition hover:brightness-95 disabled:opacity-70"
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
  const [authPending, startAuthTransition] = useTransition();
  const [projectPending, startProjectTransition] = useTransition();
  const onboardingHandledRef = useRef<Set<string>>(new Set());

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
            <div className="glass-card rounded-[2rem] border border-black/5 p-8 shadow-glow">
              <p className="text-sm text-black/55">Loading your mission dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!authUserId || !profile) {
    return (
      <main>
        <TopNav authenticated={false} />
        <section className="grid-dots">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
            <div>
              <SectionLabel>MISSION DASHBOARD</SectionLabel>
              <h1 className="mt-8 text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
                Build your skills,
                <br />
                <span className="text-[var(--blue)]">made visible.</span>
                <br />
                <span className="text-black/25">Your progress, impossible to fake.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-black/65">
                A 15-day AI micro-product bootcamp for beginners. One mission each day. Two real
                products shipped by the end.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="rounded-xl bg-[var(--blue)] px-7 py-4 text-sm font-bold text-white transition hover:opacity-95"
                >
                  Join as Student
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className="rounded-xl border border-black/10 bg-[var(--lime)] px-7 py-4 text-sm font-bold text-black transition hover:brightness-95"
                >
                  Log In
                </button>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] border border-black/5 p-6 shadow-glow">
              <div className="rounded-[1.6rem] bg-white p-6">
                <SectionLabel>{authMode === "signup" ? "GET STARTED" : "WELCOME BACK"}</SectionLabel>
                <div className="mt-5 flex gap-2 rounded-full bg-black/[0.03] p-1">
                  {(["signup", "signin"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAuthMode(mode)}
                      className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                        authMode === mode ? "bg-[var(--blue)] text-white" : "text-black/60"
                      }`}
                    >
                      {mode === "signup" ? "Sign Up" : "Sign In"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
                  {!hasSupabaseEnv ? (
                    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to continue.
                    </div>
                  ) : null}

                  {authMode === "signup" ? (
                    <label className="block text-sm font-medium text-black/70">
                      Name
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--blue)]"
                        placeholder="Your name"
                      />
                    </label>
                  ) : null}

                  <label className="block text-sm font-medium text-black/70">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--blue)]"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="block text-sm font-medium text-black/70">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--blue)]"
                      placeholder="Create a password"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={authPending}
                    className="w-full rounded-xl bg-[var(--blue)] px-6 py-4 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-70"
                  >
                    {authPending
                      ? "Please wait..."
                      : authMode === "signup"
                        ? "Create account"
                        : "Open dashboard"}
                  </button>
                  {statusMessage ? <p className="text-sm text-black/55">{statusMessage}</p> : null}
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black py-10 text-white">
          <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 text-center sm:px-6 lg:px-8">
            <div>
              <p className="text-4xl font-bold text-[var(--lime)]">15</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/60">Days to ship</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[var(--lime)]">2</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/60">Real products</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[var(--lime)]">1</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/60">Clear mission daily</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <TopNav authenticated level={level} onSignOut={handleSignOut} />
      <section className="grid-dots">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
          <div>
            <SectionLabel>PROOF OF WORK DASHBOARD</SectionLabel>
            <h1 className="mt-8 text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-black sm:text-6xl lg:text-7xl">
              Today&apos;s mission,
              <br />
              <span className="text-[var(--blue)]">made obvious.</span>
              <br />
              <span className="text-black/25">Your journey, one clean step at a time.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-black/65">
              Welcome back, {profile.name}. Start the next mission, earn proof through progress,
              and ship both your game and micro product by day 15.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={`/mission/day-${nextMission.day}`}
                className="rounded-xl bg-[var(--blue)] px-7 py-4 text-sm font-bold text-white transition hover:opacity-95"
              >
                Start Day {nextMission.day}
              </Link>
              <div className="text-sm text-black/55">
                Next up: <span className="font-semibold text-black">{nextMission.title}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] border border-black/5 p-6 shadow-glow">
            <div className="rounded-[1.6rem] bg-white p-6">
              <SectionLabel>TODAY&apos;S MISSION</SectionLabel>
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-black">{nextMission.title}</h2>
              <p className="mt-4 text-base leading-7 text-black/65">{nextMission.mission}</p>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-[var(--blue)] transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f4f2ff] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-black/45">Progress</p>
                  <p className="mt-2 text-2xl font-bold text-black">
                    {completedDays.length} / {missions.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7ffd5] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-black/45">XP</p>
                  <p className="mt-2 text-2xl font-bold text-black">{xp}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatusCard title="Game" value={gameProject ? "Submitted" : "Not started"} />
                <StatusCard title="Micro Product" value={productProject ? "Submitted" : "Not started"} />
              </div>

              {statusMessage ? (
                <div className="mt-4 rounded-2xl bg-[#f3f6ff] px-4 py-3 text-sm text-black/65">
                  {statusMessage}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-10 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 text-center sm:px-6 lg:px-8">
          <div>
            <p className="text-4xl font-bold text-[var(--lime)]">{completedDays.length}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/60">Completed days</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[var(--lime)]">{xp}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/60">Proof score</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[var(--lime)]">{level}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/60">Current level</p>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf6] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionLabel>WHAT YOU SEE HERE</SectionLabel>
          <h2 className="mt-8 text-4xl font-bold tracking-[-0.05em] text-black sm:text-5xl">
            Built for beginners who
            <br />
            <span className="text-[var(--blue)]">actually ship.</span>
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <FeatureCard
              accent="bg-[#eef0ff]"
              title="One clear mission"
              description="When you open the dashboard, the next step is already chosen for you."
            />
            <FeatureCard
              accent="bg-[#f7ffd5]"
              title="Proof score"
              description="XP grows when you complete missions and submit real project links."
            />
            <FeatureCard
              accent="bg-[#eef0ff]"
              title="Public builder record"
              description="Your submissions, launches, and progress stay attached to your account."
            />
          </div>
        </div>
      </section>

      <section className="section-line bg-[#fbfaf6] py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <SectionLabel>PROOF SCORE</SectionLabel>
            <h2 className="mt-8 text-4xl font-bold tracking-[-0.05em] text-black sm:text-5xl">
              Your score is your
              <br />
              <span className="text-[var(--blue)]">reputation.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-black/65">
              Every finished mission and every shipped project adds visible proof that you can
              build, not just learn.
            </p>
          </div>

          <div className="space-y-3">
            {xpActions.map((action, index) => (
              <div
                key={action.label}
                className={`flex items-center justify-between rounded-2xl border border-black/6 px-5 py-5 text-sm font-medium ${
                  index === 1
                    ? "bg-[var(--blue)] text-white"
                    : index === 2
                      ? "bg-[var(--lime)] text-black"
                      : "bg-white text-black"
                }`}
              >
                <span>{action.label}</span>
                <span className="text-xl font-bold">{action.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-line bg-[#fbfaf6] py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
          <div className="rounded-[2rem] bg-[var(--blue)] p-8 text-white shadow-[4px_4px_0px_#111]">
            <SectionLabel>YOUR CONTROL PANEL</SectionLabel>
            <h2 className="mt-6 text-4xl font-bold tracking-[-0.05em]">
              One place for progress, projects, and proof.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              No duplicate buttons. No hidden maze. Just one clean view where you start the next
              mission and review what you have already shipped.
            </p>
            <Link
              href={`/mission/day-${nextMission.day}`}
              className="mt-8 inline-flex rounded-xl bg-[var(--lime)] px-6 py-4 text-sm font-bold text-black transition hover:brightness-95"
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
                    <div key={mission.day} className="rounded-[1.6rem] border border-black/6 bg-white px-5 py-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-black/45">
                            Day {mission.day} / {mission.phase}
                          </p>
                          <p className="mt-2 text-lg font-bold text-black">{mission.title}</p>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            done ? "bg-[var(--lime)] text-black" : "bg-black/[0.05] text-black/55"
                          }`}
                        >
                          {done ? "Done" : "Locked to next"}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-black/60">{mission.summary}</p>
                    </div>
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

            {detailTab === "log" ? (
              <div className="grid gap-3">
                {submissionRows.length === 0 ? (
                  <div className="rounded-[1.6rem] border border-black/6 bg-white px-5 py-5 text-sm text-black/55">
                    Your builder log fills automatically as you complete missions.
                  </div>
                ) : (
                  submissionRows.map((submission) => (
                    <div key={submission.id} className="rounded-[1.6rem] border border-black/6 bg-white px-5 py-5">
                      <p className="text-xs uppercase tracking-[0.16em] text-black/45">
                        Day {submission.day_number}
                      </p>
                      <div className="mt-4 space-y-3">
                        {Object.values(submission.content).map((value) => (
                          <div key={value} className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-black/65">
                            {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
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
