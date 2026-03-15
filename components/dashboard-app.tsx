"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { getLevelFromXp } from "@/lib/levels";
import { getMissionByDay, missions } from "@/lib/missions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BuilderUser, ProgressRow, ProjectRow, SubmissionRow } from "@/lib/types";

type AuthMode = "signup" | "signin";
type PanelKey = "roadmap" | "tools" | "log" | "discovery" | "projects";

const tools = [
  {
    title: "AI coding tools",
    description: "Generate layouts, features, and fixes using simple prompts.",
  },
  {
    title: "Vercel",
    description: "Deploy your app and share links quickly.",
  },
  {
    title: "Supabase",
    description: "Store users, submissions, and progress in one place.",
  },
  {
    title: "Resend",
    description: "Send welcome and reminder emails automatically.",
  },
];

const discoveryTips = [
  "Personal frustrations",
  "Reddit discussions",
  "Twitter complaints",
  "Observing real life",
];

function ExpandablePanel({
  open,
  title,
  children,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid transition-all duration-500 ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
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
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [gameUrl, setGameUrl] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [authPending, startAuthTransition] = useTransition();
  const [projectPending, startProjectTransition] = useTransition();

  const completedDays = useMemo(
    () =>
      progressRows
        .filter((row) => row.completed)
        .map((row) => row.day_number)
        .sort((a, b) => a - b),
    [progressRows],
  );

  const nextMissionDay = useMemo(() => {
    const nextDay = missions.find((mission) => !completedDays.includes(mission.day))?.day ?? 15;
    return getMissionByDay(nextDay) ?? missions[0];
  }, [completedDays]);

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? "Explorer";
  const progressPercent = (completedDays.length / missions.length) * 100;
  const gameComplete = projectRows.some((project) => project.type === "game");
  const productComplete = projectRows.some((project) => project.type === "product");

  async function loadDashboard(userId: string, fallbackName?: string, fallbackEmail?: string) {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [{ data: userRow }, { data: progressData }, { data: submissionData }, { data: projectData }] =
      await Promise.all([
        supabase.from("users").select("*").eq("id", userId).maybeSingle(),
        supabase.from("progress").select("*").eq("user_id", userId).order("day_number"),
        supabase.from("submissions").select("*").eq("user_id", userId).order("day_number", { ascending: false }),
        supabase.from("projects").select("*").eq("user_id", userId),
      ]);

    let resolvedUser = userRow as BuilderUser | null;

    if (!resolvedUser && fallbackEmail) {
      const { data: insertedUser } = await supabase
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

      resolvedUser = insertedUser as BuilderUser;
    }

    setProfile(resolvedUser);
    setProgressRows((progressData as ProgressRow[]) ?? []);
    setSubmissionRows((submissionData as SubmissionRow[]) ?? []);
    setProjectRows((projectData as ProjectRow[]) ?? []);
    setGameUrl((projectData as ProjectRow[] | null)?.find((row) => row.type === "game")?.url ?? "");
    setProductUrl((projectData as ProjectRow[] | null)?.find((row) => row.type === "product")?.url ?? "");
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) {
        return;
      }

      const user = data.user;
      if (user) {
        setAuthUserId(user.id);
        await loadDashboard(user.id, user.user_metadata?.name, user.email);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setAuthUserId(user?.id ?? null);

      if (user) {
        await loadDashboard(user.id, user.user_metadata?.name, user.email);
      } else {
        setProfile(null);
        setProgressRows([]);
        setSubmissionRows([]);
        setProjectRows([]);
        setLoading(false);
      }
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
              options: { data: { name } },
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

        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email ?? email,
            name: name || user.user_metadata?.name || "Builder",
            kind: "welcome",
          }),
        }).catch(() => null);
      }

      setStatusMessage(authMode === "signup" ? "Account ready. Opening your dashboard..." : "Welcome back.");
      router.push("/");
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
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="glass-card rounded-[2rem] border border-white/80 p-8 shadow-glow">
          <p className="text-sm text-slate-500">Loading your mission dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authUserId || !profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fadeUp">
            <div className="inline-flex rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-glow">
              Calm, guided, beginner-friendly
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Build Your First AI Products in 15 Days
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              The journey now starts with one clear focus: today&apos;s mission.
            </p>
            <p className="mt-3 max-w-xl text-base text-slate-500">
              Create an account to unlock daily missions, XP, progress sync, and project submissions.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
            <div className="rounded-[1.5rem] bg-hero-gradient p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Start your journey</p>
                <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                  Supabase Auth
                </div>
              </div>

              <div className="mt-5 flex gap-2 rounded-full bg-white/70 p-1">
                {(["signup", "signin"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAuthMode(mode)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                      authMode === mode ? "bg-slate-900 text-white" : "text-slate-600"
                    }`}
                  >
                    {mode === "signup" ? "Sign up" : "Sign in"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
                {!hasSupabaseEnv ? (
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to enable signup.
                  </div>
                ) : null}
                {authMode === "signup" ? (
                  <label className="block text-sm text-slate-600">
                    Name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                      placeholder="Shivam"
                    />
                  </label>
                ) : null}
                <label className="block text-sm text-slate-600">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="block text-sm text-slate-600">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Create a password"
                  />
                </label>
                <button
                  type="submit"
                  disabled={authPending}
                  className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
                >
                  {authPending ? "Please wait..." : authMode === "signup" ? "Create account" : "Enter dashboard"}
                </button>
                {statusMessage ? <p className="text-sm text-slate-500">{statusMessage}</p> : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <section className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Mission Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Welcome {profile.name}
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Today&apos;s mission keeps the journey simple. Focus on one clear task, finish it,
                and your next step will unlock automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>

          <div className="mt-8 grid gap-4 rounded-[1.75rem] bg-hero-gradient p-6 lg:grid-cols-[1fr_220px]">
            <div>
              <p className="text-sm font-medium text-slate-600">Day {nextMissionDay.day} Mission</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {nextMissionDay.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                {nextMissionDay.mission}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/mission/day-${nextMissionDay.day}`}
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Start Mission
                </Link>
                <button
                  type="button"
                  onClick={() => setPanel(panel === "roadmap" ? null : "roadmap")}
                  className="rounded-full bg-white/80 px-5 py-3 text-sm text-slate-700 transition hover:bg-white"
                >
                  View Roadmap
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {completedDays.length} / {missions.length}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">XP</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{xp} XP</p>
                <p className="mt-1 text-xs text-slate-500">{level}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>Builder progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Game</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {gameComplete ? "Completed" : "Not started"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Micro Product</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {productComplete ? "Completed" : "Not started"}
              </p>
            </div>
          </div>

          {statusMessage ? (
            <div className="mt-6 rounded-[1.5rem] bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              {statusMessage}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Level
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{level}</h2>
              </div>
              <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">{xp} XP</div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {missions.map((mission) => {
                const done = completedDays.includes(mission.day);
                return (
                  <div
                    key={mission.day}
                    className={`rounded-2xl px-3 py-3 text-center text-sm transition ${
                      done ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    Day {mission.day} {done ? "[done]" : "[ ]"}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] border border-white/80 p-4 shadow-glow">
            {[
              { key: "discovery", label: "View Discovery Tips" },
              { key: "roadmap", label: "View Roadmap" },
              { key: "tools", label: "View Tools" },
              { key: "projects", label: "View Project Submissions" },
              { key: "log", label: "View Builder Log" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPanel(panel === item.key ? null : (item.key as PanelKey))}
                className="flex w-full items-center justify-between rounded-[1.5rem] px-4 py-4 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span>{item.label}</span>
                <span>{panel === item.key ? "Close" : "Open"}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <ExpandablePanel open={panel === "discovery"} title="Discovery Sprint">
          <div className="grid gap-3 sm:grid-cols-2">
            {discoveryTips.map((tip) => (
              <div key={tip} className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                <p className="text-sm font-medium text-slate-800">{tip}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Use this as a source for finding real student problems.
                </p>
              </div>
            ))}
          </div>
        </ExpandablePanel>

        <ExpandablePanel open={panel === "roadmap"} title="Roadmap Timeline">
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.day} className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Day {mission.day} / {mission.phase}
                    </p>
                    <p className="mt-2 font-medium text-slate-900">{mission.title}</p>
                  </div>
                  {completedDays.includes(mission.day) ? (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
                      Done
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{mission.summary}</p>
              </div>
            ))}
          </div>
        </ExpandablePanel>

        <ExpandablePanel open={panel === "tools"} title="Tools You Will Use">
          <div className="grid gap-3">
            {tools.map((tool) => (
              <div key={tool.title} className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                <p className="font-medium text-slate-900">{tool.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{tool.description}</p>
              </div>
            ))}
          </div>
        </ExpandablePanel>

        <ExpandablePanel open={panel === "projects"} title="Project Submissions">
          <div className="grid gap-4 lg:grid-cols-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveProject("game", gameUrl);
              }}
              className="rounded-[1.5rem] bg-slate-50 p-5"
            >
              <p className="text-sm font-medium text-slate-900">Submit your game URL</p>
              <input
                value={gameUrl}
                onChange={(event) => setGameUrl(event.target.value)}
                placeholder="https://your-game-url.com"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
              />
              <button
                type="submit"
                disabled={projectPending}
                className="mt-4 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                Save game URL
              </button>
            </form>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveProject("product", productUrl);
              }}
              className="rounded-[1.5rem] bg-slate-50 p-5"
            >
              <p className="text-sm font-medium text-slate-900">Submit your micro-product URL</p>
              <input
                value={productUrl}
                onChange={(event) => setProductUrl(event.target.value)}
                placeholder="https://your-product-url.com"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
              />
              <button
                type="submit"
                disabled={projectPending}
                className="mt-4 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                Save product URL
              </button>
            </form>
          </div>
        </ExpandablePanel>

        <ExpandablePanel open={panel === "log"} title="Daily Builder Log">
          <div className="grid gap-3">
            {submissionRows.length === 0 ? (
              <div className="rounded-[1.5rem] bg-slate-50 px-5 py-5 text-sm text-slate-500">
                Complete missions to build your log automatically.
              </div>
            ) : (
              submissionRows.map((submission) => (
                <div key={submission.id} className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Day {submission.day_number}
                  </p>
                  <div className="mt-3 space-y-2">
                    {Object.entries(submission.content).map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ExpandablePanel>
      </section>
    </div>
  );
}
