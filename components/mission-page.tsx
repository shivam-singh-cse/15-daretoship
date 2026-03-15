"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { getLevelFromXp } from "@/lib/levels";
import { getMissionByDay } from "@/lib/missions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BuilderUser } from "@/lib/types";

export function MissionPage({ day }: { day: number }) {
  const mission = getMissionByDay(day);
  const router = useRouter();
  const hasSupabaseEnv = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
  );
  const [supabase] = useState(() => (hasSupabaseEnv ? createSupabaseBrowserClient() : null));
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<BuilderUser | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [pending, startTransition] = useTransition();

  const initialValues = useMemo(
    () =>
      mission?.steps.reduce<Record<string, string>>((accumulator, step) => {
        accumulator[step.id] = "";
        return accumulator;
      }, {}) ?? {},
    [mission],
  );

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!supabase) {
      setMessage("Add Supabase environment variables to open missions.");
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);
      const { data: profileRow } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
      setProfile(profileRow as BuilderUser | null);

      const { data: submission } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user.id)
        .eq("day_number", day)
        .maybeSingle();

      if (submission?.content) {
        setFormValues(submission.content as Record<string, string>);
      }

      const { data: progress } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("day_number", day)
        .maybeSingle();

      setCompleted(Boolean(progress?.completed));
    });
  }, [day, router, supabase]);

  if (!mission) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="glass-card rounded-[2rem] border border-white/80 p-8 shadow-glow">
          <p className="text-sm text-slate-500">Mission not found.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !userId || !profile) {
      setMessage("Please sign in first.");
      return;
    }

    startTransition(async () => {
      setMessage("");

      const { error: submissionError } = await supabase.from("submissions").upsert(
        {
          user_id: userId,
          day_number: day,
          content: formValues,
        },
        { onConflict: "user_id,day_number" },
      );

      if (submissionError) {
        setMessage(submissionError.message);
        return;
      }

      const { data: progressRow } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .eq("day_number", day)
        .maybeSingle();

      const firstCompletion = !progressRow?.completed;

      const { error: progressError } = await supabase.from("progress").upsert(
        {
          user_id: userId,
          day_number: day,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,day_number" },
      );

      if (progressError) {
        setMessage(progressError.message);
        return;
      }

      if (firstCompletion) {
        const nextXp = profile.xp + 20;
        const nextLevel = getLevelFromXp(nextXp);
        const { data: updatedUser, error: userError } = await supabase
          .from("users")
          .update({ xp: nextXp, level: nextLevel })
          .eq("id", userId)
          .select()
          .single();

        if (userError) {
          setMessage(userError.message);
          return;
        }

        setProfile(updatedUser as BuilderUser);
        setMessage("Mission completed. +20 XP earned.");
      } else {
        setMessage("Mission updated.");
      }

      setCompleted(true);
      setTimeout(() => router.push("/"), 1200);
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-glow">
          Back to dashboard
        </Link>
        <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
          {profile?.xp ?? 0} XP
        </div>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
        <div className="rounded-[1.75rem] bg-hero-gradient p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Day {day} - {mission.phase}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{mission.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{mission.summary}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {mission.steps.map((step) => (
            <label key={step.id} className="block rounded-[1.5rem] bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{step.label}</p>
              <p className="mt-2 text-lg font-medium text-slate-900">{step.prompt}</p>
              <textarea
                value={formValues[step.id] ?? ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    [step.id]: event.target.value,
                  }))
                }
                placeholder={step.placeholder}
                rows={4}
                className="mt-4 w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
            >
              {pending ? "Saving..." : "Submit Mission"}
            </button>
            {completed ? (
              <div className="rounded-full bg-emerald-100 px-4 py-3 text-sm text-emerald-700 animate-fadeUp">
                Mission complete. Nice work.
              </div>
            ) : null}
          </div>

          {message ? <p className="text-sm text-slate-500">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
