"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { getLevelFromXp } from "@/lib/levels";
import { getMissionByDay } from "@/lib/missions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BuilderUser, ProjectRow } from "@/lib/types";

type MissionField = {
  id: string;
  label: string;
  placeholder: string;
  type?: "textarea" | "url";
};

type MissionTemplate = {
  intro: string;
  checklist: string[];
  fields: MissionField[];
};

function getMissionTemplate(day: number): MissionTemplate {
  const map: Record<number, MissionTemplate> = {
    1: {
      intro: "Use this session to understand what AI builders can make today.",
      checklist: [
        "Saw live examples of AI-built products",
        "Understood what a beginner can realistically build in 15 days",
        "Noted one product that felt exciting or useful",
      ],
      fields: [
        { id: "summary", label: "What did you learn today?", placeholder: "Write the biggest thing that clicked for you." },
      ],
    },
    2: {
      intro: "Today is about spotting real problems instead of guessing what to build.",
      checklist: [
        "Identified at least one real frustration",
        "Checked where that problem appears online or in real life",
        "Noted who feels this problem the most",
      ],
      fields: [
        { id: "problem", label: "Problem you found", placeholder: "Describe the problem in plain language." },
        { id: "summary", label: "What did you learn today?", placeholder: "Write your short takeaway from the session." },
      ],
    },
    3: {
      intro: "Turn a problem into a simple product idea with a realistic MVP.",
      checklist: [
        "Defined the problem clearly",
        "Wrote a simple solution idea",
        "Reduced the idea to the smallest MVP version",
      ],
      fields: [
        { id: "idea", label: "Your product idea", placeholder: "Write the product idea you want to test." },
        { id: "summary", label: "What did you learn today?", placeholder: "What changed in how you think about products?" },
      ],
    },
    4: {
      intro: "Learn how to prompt AI like a builder, not like a casual user.",
      checklist: [
        "Used role, task, context, and feature structure",
        "Practiced writing a clearer prompt",
        "Compared weak prompts vs stronger prompts",
      ],
      fields: [
        { id: "summary", label: "Best prompting lesson from today", placeholder: "What will you now always include in a builder prompt?" },
      ],
    },
    5: {
      intro: "Use AI coding tools to shape UI and features faster.",
      checklist: [
        "Generated a screen or component with AI",
        "Reviewed and improved the first output",
        "Learned how to ask for a cleaner second version",
      ],
      fields: [
        { id: "summary", label: "What did AI help you build today?", placeholder: "Describe the most useful thing you got from the tool." },
      ],
    },
    6: {
      intro: "Choose your game and define the core loop before building.",
      checklist: [
        "Picked one game idea to focus on",
        "Defined the main player action",
        "Defined how the player wins or scores",
      ],
      fields: [
        { id: "idea", label: "Chosen game idea", placeholder: "Reaction test, memory game, typing speed, snake..." },
        { id: "summary", label: "What became clearer today?", placeholder: "What did you understand about your game after the session?" },
      ],
    },
    7: {
      intro: "Build the game UI and make the main interaction feel satisfying.",
      checklist: [
        "Created the first playable screen",
        "Built the main game interaction",
        "Added feedback like score, timer, or motion",
      ],
      fields: [
        { id: "summary", label: "Progress update", placeholder: "What part of the game works now?" },
      ],
    },
    8: {
      intro: "Polish the game and submit the live link once it is playable.",
      checklist: [
        "Tested the game flow end to end",
        "Fixed at least one issue",
        "Prepared the game to share publicly",
      ],
      fields: [
        { id: "game_url", label: "Game link", placeholder: "https://your-game-url.com", type: "url" },
        { id: "summary", label: "What did you improve before shipping?", placeholder: "Describe the final polish or fixes you made." },
      ],
    },
    9: {
      intro: "Pick your micro product and define who it is for.",
      checklist: [
        "Picked one product idea",
        "Defined the target user clearly",
        "Defined the main output the product gives",
      ],
      fields: [
        { id: "idea", label: "Chosen product idea", placeholder: "Write the micro product you are building." },
        { id: "summary", label: "What did you learn today?", placeholder: "What made this idea worth building?" },
      ],
    },
    10: {
      intro: "Map the flow: input, action, output.",
      checklist: [
        "Defined what the user inputs",
        "Defined the result they receive",
        "Sketched the main screen structure",
      ],
      fields: [
        { id: "summary", label: "Flow summary", placeholder: "Describe your product flow in a few lines." },
      ],
    },
    11: {
      intro: "Build the one feature that makes the product useful.",
      checklist: [
        "Implemented the core feature",
        "Tested the output quality",
        "Improved clarity or usefulness",
      ],
      fields: [
        { id: "summary", label: "Feature progress", placeholder: "What is working now in your product?" },
      ],
    },
    12: {
      intro: "Refine the UX so a beginner can understand it quickly.",
      checklist: [
        "Removed confusion from the interface",
        "Improved labels, defaults, or instructions",
        "Made the product easier to trust and use",
      ],
      fields: [
        { id: "summary", label: "What changed today?", placeholder: "What did you improve in the user experience?" },
      ],
    },
    13: {
      intro: "Prepare your micro product for launch and submit the live link.",
      checklist: [
        "Wrote a clear value proposition",
        "Made the product presentable for demo",
        "Prepared a live version to share",
      ],
      fields: [
        { id: "product_url", label: "Micro product link", placeholder: "https://your-product-url.com", type: "url" },
        { id: "summary", label: "Launch prep summary", placeholder: "What makes your product ready to share now?" },
      ],
    },
    14: {
      intro: "Create a landing page that explains the value clearly.",
      checklist: [
        "Wrote the landing page headline",
        "Explained the product clearly",
        "Added a clear call to action",
      ],
      fields: [
        { id: "summary", label: "Landing page summary", placeholder: "What message does your landing page communicate?" },
      ],
    },
    15: {
      intro: "Demo what you built and reflect on your progress.",
      checklist: [
        "Prepared the game demo",
        "Prepared the product demo",
        "Practiced explaining the journey from idea to launch",
      ],
      fields: [
        { id: "summary", label: "Demo day reflection", placeholder: "What are you most proud of after finishing the bootcamp?" },
      ],
    },
  };

  return map[day] ?? map[1];
}

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
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [pending, startTransition] = useTransition();

  const template = useMemo(() => getMissionTemplate(day), [day]);

  useEffect(() => {
    setChecks(
      template.checklist.reduce<Record<string, boolean>>((accumulator, _, index) => {
        accumulator[`check_${index}`] = false;
        return accumulator;
      }, {}),
    );
    setFields(
      template.fields.reduce<Record<string, string>>((accumulator, field) => {
        accumulator[field.id] = "";
        return accumulator;
      }, {}),
    );
  }, [template]);

  useEffect(() => {
    if (!supabase) {
      setMessage("Add Supabase environment variables to open missions.");
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);
      setProfile({
        id: user.id,
        name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "Builder",
        email: user.email ?? "",
        xp: 0,
        level: getLevelFromXp(0),
      });

      const [profileResult, submissionResult, progressResult] = await Promise.allSettled([
        supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("submissions").select("*").eq("user_id", user.id).eq("day_number", day).maybeSingle(),
        supabase.from("progress").select("*").eq("user_id", user.id).eq("day_number", day).maybeSingle(),
      ]);

      if (profileResult.status === "fulfilled" && profileResult.value.data) {
        setProfile(profileResult.value.data as BuilderUser);
      }

      if (submissionResult.status === "fulfilled" && submissionResult.value.data?.content) {
        const content = submissionResult.value.data.content as {
          checks?: Record<string, boolean>;
          fields?: Record<string, string>;
        };
        if (content.checks) {
          setChecks(content.checks);
        }
        if (content.fields) {
          setFields(content.fields);
        }
      }

      if (progressResult.status === "fulfilled") {
        setCompleted(Boolean(progressResult.value.data?.completed));
      }
    });
  }, [day, router, supabase, template]);

  if (!mission) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="border-2 border-black bg-white p-8">
          <p className="text-sm text-black/55">Mission not found.</p>
        </div>
      </div>
    );
  }

  async function upsertProjectFromMission(type: "game" | "product", url: string) {
    if (!supabase || !userId || !profile || !url.trim()) {
      return;
    }

    const reward = type === "game" ? 50 : 100;
    const { data: existingProject } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .maybeSingle();

    const shouldAwardXp = !existingProject;

    await supabase.from("projects").upsert(
      {
        user_id: userId,
        type,
        url: url.trim(),
      },
      { onConflict: "user_id,type" },
    );

    if (shouldAwardXp) {
      const nextXp = profile.xp + reward;
      const nextLevel = getLevelFromXp(nextXp);
      const { data: updatedUser } = await supabase
        .from("users")
        .update({ xp: nextXp, level: nextLevel })
        .eq("id", userId)
        .select()
        .single();

      if (updatedUser) {
        setProfile(updatedUser as BuilderUser);
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !userId || !profile) {
      setMessage("Please sign in first.");
      return;
    }

    startTransition(async () => {
      setMessage("");

      await supabase.from("submissions").upsert(
        {
          user_id: userId,
          day_number: day,
          content: {
            checks,
            fields,
          },
        },
        { onConflict: "user_id,day_number" },
      );

      if (day === 8 && fields.game_url) {
        await upsertProjectFromMission("game", fields.game_url);
      }
      if (day === 13 && fields.product_url) {
        await upsertProjectFromMission("product", fields.product_url);
      }

      const { data: progressRow } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .eq("day_number", day)
        .maybeSingle();

      const firstCompletion = !progressRow?.completed;

      await supabase.from("progress").upsert(
        {
          user_id: userId,
          day_number: day,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,day_number" },
      );

      if (firstCompletion) {
        const nextXp = profile.xp + 20;
        const nextLevel = getLevelFromXp(nextXp);
        const { data: updatedUser } = await supabase
          .from("users")
          .update({ xp: nextXp, level: nextLevel })
          .eq("id", userId)
          .select()
          .single();

        if (updatedUser) {
          setProfile(updatedUser as BuilderUser);
        }
        setMessage("Mission completed. Progress saved.");
      } else {
        setMessage("Mission updated.");
      }

      setCompleted(true);
      setTimeout(() => router.push("/dashboard"), 1100);
    });
  }

  return (
    <div className="grid-dots min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="border-2 border-black bg-white px-4 py-2 text-sm font-black text-black"
          >
            Back to dashboard
          </Link>
          <div className="border-2 border-black bg-[var(--blue)] px-4 py-2 text-sm font-black text-white">
            {profile?.xp ?? 0} XP
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="inline-flex border-2 border-black bg-[var(--lime)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-black">
              Day {day} / {mission.phase}
            </div>
            <h1 className="mt-8 text-5xl font-bold leading-[0.94] tracking-[-0.06em] text-black sm:text-6xl">
              {mission.title},
              <br />
              <span className="text-[var(--blue)]">done live.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-black/65">{template.intro}</p>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#111]">
            <div className="border-2 border-black bg-[#f4f2ff] p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45">How to use this page</p>
              <p className="mt-3 text-sm leading-7 text-black/65">
                Tick the work you completed during the live session, write your summary, and only
                submit links on shipping days.
              </p>
              <div className="mt-5 border-2 border-black bg-white px-4 py-4 text-sm text-black/65">
                {completed ? "This day is already marked complete. You can still update it." : "Finish the checklist, then submit your day."}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-4">
            {template.checklist.map((item, index) => {
              const key = `check_${index}`;
              const checked = checks[key] ?? false;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setChecks((current) => ({
                      ...current,
                      [key]: !checked,
                    }))
                  }
                  className={`flex w-full items-start gap-4 border-2 px-5 py-5 text-left transition ${
                    checked
                      ? "border-black bg-[#eef0ff] shadow-[6px_6px_0px_#111]"
                      : "border-black bg-white hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[6px_6px_0px_#111]"
                  }`}
                >
                  <div
                    className={`mt-1 flex h-6 w-6 items-center justify-center border-2 border-black text-xs font-black ${
                      checked ? "bg-[var(--blue)] text-white" : "bg-black/[0.05] text-black/45"
                    }`}
                  >
                    {checked ? "OK" : index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-black">{item}</p>
                    <p className="mt-1 text-sm text-black/55">
                      Tick this once it is covered in today&apos;s live session.
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {template.fields.map((field) => (
              <label key={field.id} className="block border-2 border-black bg-white p-5">
                <p className="text-sm font-black text-black">{field.label}</p>
                {field.type === "url" ? (
                  <input
                    value={fields[field.id] ?? ""}
                    onChange={(event) =>
                      setFields((current) => ({
                        ...current,
                        [field.id]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="mt-4 w-full border-2 border-black bg-[#fbfaf6] px-4 py-3 outline-none focus:bg-white"
                  />
                ) : (
                  <textarea
                    value={fields[field.id] ?? ""}
                    onChange={(event) =>
                      setFields((current) => ({
                        ...current,
                        [field.id]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    rows={field.id === "summary" ? 6 : 4}
                    className="mt-4 w-full border-2 border-black bg-[#fbfaf6] px-4 py-3 outline-none focus:bg-white"
                  />
                )}
              </label>
            ))}

            <div className="border-2 border-black bg-[var(--blue)] p-6 text-white shadow-[8px_8px_0px_#111]">
              <p className="text-2xl font-black">Submit today&apos;s progress.</p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                This saves your checklist, your learning summary, and marks the day complete.
              </p>
              <button
                type="submit"
                disabled={pending}
                className="mt-6 border-2 border-black bg-[var(--lime)] px-6 py-4 text-sm font-black text-black transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:opacity-70"
              >
                {pending ? "Saving..." : "Submit Day"}
              </button>
              {message ? <p className="mt-4 text-sm text-white/80">{message}</p> : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
