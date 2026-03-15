"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SectionKey =
  | "mindset"
  | "discovery"
  | "prompting"
  | "game"
  | "product"
  | "launch";

type TimelinePhase = {
  id: SectionKey;
  title: string;
  days: number[];
  label: string;
  description: string;
  details: string[];
  ideas?: { title: string; icon?: string }[];
};

type LogEntry = {
  id: number;
  day: string;
  note: string;
};

const sections = [
  { id: "mindset", label: "Mindset" },
  { id: "discovery", label: "Discovery" },
  { id: "prompting", label: "Prompting" },
  { id: "game", label: "Build Game" },
  { id: "product", label: "Build Product" },
  { id: "launch", label: "Launch" },
] as const;

const gameIdeas = [
  "Reaction Speed Test",
  "Number Guessing Game",
  "Typing Speed Test",
  "Click Counter Challenge",
  "Memory Card Match",
  "Color Match Game",
  "AI Trivia Quiz",
  "Dodge Falling Blocks",
  "Rock Paper Scissors vs AI",
  "Snake Game",
];

const productIdeas = [
  { title: "AI Lecture Notes Cleaner", icon: "Spark Notes" },
  { title: "Resume Bullet Improver", icon: "Career Boost" },
  { title: "Study Timer + Focus Tracker", icon: "Focus Clock" },
  { title: "AI Email Reply Generator", icon: "Quick Mail" },
  { title: "Meeting Notes Summarizer", icon: "Meeting Mind" },
  { title: "Assignment Reminder Tool", icon: "Task Bell" },
  { title: "AI Instagram Caption Generator", icon: "Caption Pop" },
  { title: "Startup Idea Generator", icon: "Idea Rocket" },
  { title: "Habit Tracker", icon: "Daily Pulse" },
  { title: "College Resource Hub", icon: "Campus Map" },
];

const toolkit = [
  {
    title: "AI coding tools",
    description: "Use AI assistants to generate layouts, features, and debug faster.",
  },
  {
    title: "Vercel",
    description: "Deploy your product in minutes and share it with anyone.",
  },
  {
    title: "Supabase",
    description: "Add a simple database later when your app needs real data.",
  },
  {
    title: "Resend",
    description: "Send polished email updates, waitlists, or sign-in links.",
  },
];

const phases: TimelinePhase[] = [
  {
    id: "mindset",
    title: "Phase 1 - Builder Mindset",
    label: "Days 1-3",
    days: [1, 2, 3],
    description: "Students learn how AI is changing building and how to find real problems.",
    details: [
      "Day 1: Understanding the AI builder era and seeing live demos of AI building apps.",
      "Day 2: Learning how to discover real problems using personal frustrations, Reddit discussions, Twitter complaints, and observing real life.",
      "Day 3: Turning problems into simple product ideas using the MVP concept.",
    ],
  },
  {
    id: "prompting",
    title: "Phase 2 - Prompting Like a Builder",
    label: "Days 4-5",
    days: [4, 5],
    description: "Students learn how to communicate with AI to build software.",
    details: [
      "Day 4: Prompt structure using role, task, context, and features.",
      "Day 5: Using AI coding tools to generate UI and features.",
    ],
  },
  {
    id: "game",
    title: "Phase 3 - Build a Game",
    label: "Days 6-8",
    days: [6, 7, 8],
    description: "Students build their first real project: a simple browser game.",
    details: [
      "Choose one game idea and turn it into a polished browser experience.",
      "Practice the full mini-product loop: idea, prompt, build, test, refine.",
    ],
    ideas: gameIdeas.map((title) => ({ title })),
  },
  {
    id: "product",
    title: "Phase 4 - Build a Micro Product",
    label: "Days 9-13",
    days: [9, 10, 11, 12, 13],
    description: "Students build a useful AI-powered micro-product.",
    details: [
      "Pick a practical idea that solves a small but real student problem.",
      "Build simple flows, test with friends, and improve clarity before launch.",
    ],
    ideas: productIdeas,
  },
  {
    id: "launch",
    title: "Phase 5 - Launch",
    label: "Days 14-15",
    days: [14, 15],
    description: "Students deploy and share their products.",
    details: [
      "Day 14: Create a landing page.",
      "Day 15: Demo Day. Present the game you built and the product you built.",
    ],
  },
];

const allDays = Array.from({ length: 15 }, (_, index) => index + 1);
const storageKeys = {
  completed: "builder-journey-completed-days",
  logs: "builder-journey-daily-log",
  game: "builder-journey-selected-game",
  product: "builder-journey-selected-product",
};

function iconForLabel(label: string) {
  return label
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>("mindset");
  const [openPhase, setOpenPhase] = useState<SectionKey | null>("mindset");
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dayInput, setDayInput] = useState("1");
  const [noteInput, setNoteInput] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedCompleted = localStorage.getItem(storageKeys.completed);
    const savedLogs = localStorage.getItem(storageKeys.logs);
    const savedGame = localStorage.getItem(storageKeys.game);
    const savedProduct = localStorage.getItem(storageKeys.product);

    if (savedCompleted) {
      setCompletedDays(JSON.parse(savedCompleted));
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
    if (savedGame) {
      setSelectedGame(savedGame);
    }
    if (savedProduct) {
      setSelectedProduct(savedProduct);
    }

    const observers = sections.map((section) => {
      const node = document.getElementById(section.id);
      if (!node) {
        return null;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        },
        { rootMargin: "-35% 0px -45% 0px", threshold: 0.2 },
      );

      observer.observe(node);
      return observer;
    });

    setIsReady(true);

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    localStorage.setItem(storageKeys.completed, JSON.stringify(completedDays));
  }, [completedDays, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    localStorage.setItem(storageKeys.logs, JSON.stringify(logs));
  }, [logs, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    localStorage.setItem(storageKeys.game, selectedGame);
  }, [selectedGame, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    localStorage.setItem(storageKeys.product, selectedProduct);
  }, [selectedProduct, isReady]);

  const completedCount = completedDays.length;
  const remainingCount = 15 - completedCount;
  const progress = (completedCount / 15) * 100;
  const allComplete = completedCount === 15;

  const completionSummary = useMemo(
    () =>
      phases.map((phase) => ({
        id: phase.id,
        total: phase.days.length,
        completed: phase.days.filter((day) => completedDays.includes(day)).length,
      })),
    [completedDays],
  );

  function toggleDay(day: number) {
    setCompletedDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  }

  function handleLogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteInput.trim()) {
      return;
    }

    setLogs((current) => [
      {
        id: Date.now(),
        day: dayInput,
        note: noteInput.trim(),
      },
      ...current,
    ]);
    setNoteInput("");
  }

  function scrollToRoadmap() {
    document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="journey-shell relative">
      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Builder Journey
                </p>
                <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span>{completedCount} completed</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{remainingCount} remaining</span>
              </div>
            </div>

            <nav className="flex snap-x gap-2 overflow-x-auto pb-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                    activeSection === section.id
                      ? "bg-slate-900 text-white shadow-glow"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="animate-fadeUp">
              <div className="inline-flex rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-glow">
                15 days. 2 real products. 1 launch-ready builder journey.
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Build Your First AI Products in 15 Days
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                A beginner-friendly journey from idea to launching real products using AI.
              </p>
              <p className="mt-3 max-w-xl text-base text-slate-500">
                You will build 2 real things: a fun web game and a useful micro-product.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToRoadmap}
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Start the Journey
                </button>
                <div className="rounded-full bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-glow">
                  Learn by shipping, not by memorizing.
                </div>
              </div>
            </div>

            <div className="glass-card animate-float rounded-[2rem] border border-white/70 p-5 shadow-glow">
              <div className="rounded-[1.5rem] bg-hero-gradient p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Mission Snapshot</p>
                  <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                    Beginner friendly
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    "Find a real problem worth solving",
                    "Prompt AI like a product builder",
                    "Ship a browser game",
                    "Launch a useful micro-product",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 rounded-2xl bg-white/70 px-4 py-3 backdrop-blur"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-slate-900 px-5 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/65">Launch target</p>
                  <p className="mt-2 text-lg font-medium">Day 15 Demo Day</p>
                  <p className="mt-1 text-sm text-white/75">Present both products with confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="discovery" className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Discovery Sprint
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  Learn to spot problems worth building for
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Great products start with real pain points. This part of the journey helps
                  students notice frustrations, collect signals from the internet, and shape raw
                  observations into small product ideas.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Personal frustrations",
                  "Reddit discussions",
                  "Twitter complaints",
                  "Observing real life",
                ].map((source) => (
                  <div key={source} className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">{source}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Turn signals into product opportunities you can test quickly.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Roadmap Timeline
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Your 15-day builder mission
              </h2>
            </div>
            <div className="glass-card rounded-2xl border border-white/80 px-5 py-4 shadow-glow">
              <p className="text-sm text-slate-600">Stay focused on one day at a time.</p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
              <h3 className="text-lg font-semibold text-slate-900">Progress Tracking</h3>
              <p className="mt-2 text-sm text-slate-600">
                Mark each day as complete as you move through the bootcamp.
              </p>
              <div className="mt-6 grid grid-cols-5 gap-3">
                {allDays.map((day) => {
                  const done = completedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`rounded-2xl px-3 py-4 text-sm font-medium transition ${
                        done
                          ? "bg-slate-900 text-white shadow-glow"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Day {day}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 space-y-3">
                {completionSummary.map((phase) => (
                  <div key={phase.id}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                      <span>{sections.find((section) => section.id === phase.id)?.label}</span>
                      <span>
                        {phase.completed}/{phase.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 via-sky-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${(phase.completed / phase.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="relative pl-8 sm:pl-12">
              <div className="timeline-line absolute left-3 top-0 h-full w-px sm:left-5" />
              <div className="space-y-6">
                {phases.map((phase) => {
                  const expanded = openPhase === phase.id;

                  return (
                    <article key={phase.id} id={phase.id} className="relative scroll-mt-40">
                      <div className="absolute left-0 top-8 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-slate-900 shadow-glow sm:left-[-0.1rem]">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                      <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow transition hover:-translate-y-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                              {phase.label}
                            </div>
                            <h3 className="mt-4 text-2xl font-semibold text-slate-900">{phase.title}</h3>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                              {phase.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOpenPhase(expanded ? null : phase.id)}
                            className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
                          >
                            {expanded ? "Hide details" : "View details"}
                          </button>
                        </div>

                        <div
                          className={`grid transition-all duration-500 ${
                            expanded ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="rounded-[1.5rem] bg-slate-50 p-5">
                              <div className="grid gap-3">
                                {phase.details.map((detail) => (
                                  <div
                                    key={detail}
                                    className="rounded-2xl bg-white px-4 py-4 text-sm leading-7 text-slate-600"
                                  >
                                    {detail}
                                  </div>
                                ))}
                              </div>

                              {phase.ideas && phase.id === "game" ? (
                                <div className="mt-5">
                                  <p className="mb-3 text-sm font-medium text-slate-700">Game options</p>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {phase.ideas.map((idea) => {
                                      const selected = selectedGame === idea.title;
                                      return (
                                        <button
                                          key={idea.title}
                                          type="button"
                                          onClick={() => setSelectedGame(idea.title)}
                                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                                            selected
                                              ? "border-slate-900 bg-slate-900 text-white shadow-glow"
                                              : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                                          }`}
                                        >
                                          <p className="font-medium">{idea.title}</p>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : null}

                              {phase.ideas && phase.id === "product" ? (
                                <div className="mt-5">
                                  <p className="mb-3 text-sm font-medium text-slate-700">Product ideas</p>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {phase.ideas.map((idea) => {
                                      const selected = selectedProduct === idea.title;
                                      return (
                                        <button
                                          key={idea.title}
                                          type="button"
                                          onClick={() => setSelectedProduct(idea.title)}
                                          className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                                            selected
                                              ? "border-slate-900 bg-slate-900 text-white shadow-glow"
                                              : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                                          }`}
                                        >
                                          <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-semibold ${
                                              selected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                                            }`}
                                          >
                                            {iconForLabel(idea.icon ?? idea.title)}
                                          </div>
                                          <div>
                                            <p className="font-medium">{idea.title}</p>
                                            <p className={`text-xs ${selected ? "text-white/70" : "text-slate-500"}`}>
                                              {idea.icon}
                                            </p>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Daily Builder Log
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Capture your progress</h2>
              </div>
              <p className="text-sm text-slate-500">Small wins become momentum.</p>
            </div>

            <form onSubmit={handleLogSubmit} className="mt-6 grid gap-4 sm:grid-cols-[130px_1fr_auto]">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Day number
                <select
                  value={dayInput}
                  onChange={(event) => setDayInput(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                >
                  {allDays.map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                What you built today
                <input
                  value={noteInput}
                  onChange={(event) => setNoteInput(event.target.value)}
                  placeholder="I created my first prompt, tested my game flow..."
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
                />
              </label>
              <button
                type="submit"
                className="self-end rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Save log
              </button>
            </form>

            <div className="mt-6 grid gap-3">
              {logs.length === 0 ? (
                <div className="rounded-[1.5rem] bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  Your builder log will appear here as you add entries.
                </div>
              ) : (
                logs.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[1.5rem] bg-slate-50 px-5 py-4 transition hover:bg-white"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Day {entry.day}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{entry.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Tools You Will Use
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Simple tools, real results</h2>
              <div className="mt-6 grid gap-3">
                {toolkit.map((tool) => (
                  <div
                    key={tool.title}
                    className="rounded-[1.5rem] bg-slate-50 px-5 py-4 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <p className="font-medium text-slate-900">{tool.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[2rem] border border-white/80 p-6 shadow-glow">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Current Picks
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Game idea</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selectedGame || "Choose a game from Phase 3"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Micro-product</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selectedProduct || "Choose a product from Phase 4"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {allComplete ? (
          <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-slate-900 px-6 py-14 text-center text-white shadow-glow">
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className="confetti-piece animate-confetti"
                  style={{
                    left: `${(index + 1) * 5}%`,
                    animationDelay: `${index * 0.15}s`,
                    animationDuration: `${4 + (index % 4)}s`,
                    backgroundColor: ["#fbbf24", "#38bdf8", "#86efac", "#fda4af"][index % 4],
                  }}
                />
              ))}
              <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                Celebration Screen
              </p>
              <h2 className="relative z-10 mt-4 text-4xl font-semibold tracking-tight">
                You are now an AI Builder.
              </h2>
              <p className="relative z-10 mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">
                You shipped a game, launched a micro-product, and finished the full beginner journey.
                Share your project links and show people what you built.
              </p>
              <div className="relative z-10 mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900">
                Demo your work. Share your links. Keep building.
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
