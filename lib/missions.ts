export type MissionStep = {
  id: string;
  label: string;
  prompt: string;
  placeholder: string;
};

export type MissionDefinition = {
  day: number;
  slug: string;
  title: string;
  mission: string;
  summary: string;
  phase: string;
  steps: MissionStep[];
};

export const missions: MissionDefinition[] = [
  {
    day: 1,
    slug: "ai-builder-era",
    title: "AI Builder Era",
    mission: "Understand how AI changes what beginners can build.",
    summary: "See how simple prompts can turn ideas into working interfaces and products.",
    phase: "Builder Mindset",
    steps: [
      {
        id: "demo",
        label: "Step 1",
        prompt: "Write one AI product demo that impressed you today.",
        placeholder: "A site or tool that made you think, 'I could build something too.'",
      },
      {
        id: "why",
        label: "Step 2",
        prompt: "Explain why it felt exciting or useful.",
        placeholder: "It solved a real problem quickly, felt magical, saved time...",
      },
      {
        id: "idea",
        label: "Step 3",
        prompt: "Describe one tiny thing you want to build by the end of this bootcamp.",
        placeholder: "A quiz app, note cleaner, reminder tool, game...",
      },
    ],
  },
  {
    day: 2,
    slug: "problem-discovery",
    title: "Problem Discovery",
    mission: "Notice real frustrations that can become product ideas.",
    summary: "Look for signals in your own life and on the internet instead of guessing.",
    phase: "Builder Mindset",
    steps: [
      {
        id: "frustration",
        label: "Step 1",
        prompt: "Write one frustration you noticed this week.",
        placeholder: "Something annoying in studying, communication, planning, or campus life.",
      },
      {
        id: "signal",
        label: "Step 2",
        prompt: "Where else did you see this problem show up?",
        placeholder: "Reddit, X, classmates, group chats, a club, your own routine...",
      },
      {
        id: "audience",
        label: "Step 3",
        prompt: "Who would care most about solving it?",
        placeholder: "First-year students, job seekers, study groups, event organizers...",
      },
    ],
  },
  {
    day: 3,
    slug: "product-thinking",
    title: "Product Thinking",
    mission: "Turn problems into clear product ideas.",
    summary: "Move from pain point to simple solution and define the smallest MVP.",
    phase: "Builder Mindset",
    steps: [
      {
        id: "problem",
        label: "Step 1",
        prompt: "Write a problem you noticed this week.",
        placeholder: "Students forget deadlines, messy lecture notes, hard-to-write emails...",
      },
      {
        id: "solution",
        label: "Step 2",
        prompt: "Describe a simple solution.",
        placeholder: "A tool that summarizes, tracks, reminds, or generates...",
      },
      {
        id: "mvp",
        label: "Step 3",
        prompt: "Define the simplest version of this product.",
        placeholder: "One form, one output, one user flow, no extra features.",
      },
    ],
  },
  {
    day: 4,
    slug: "prompt-structure",
    title: "Prompt Structure",
    mission: "Learn to prompt like a builder.",
    summary: "Use role, task, context, and features to ask AI for useful product output.",
    phase: "Prompting",
    steps: [
      {
        id: "role",
        label: "Step 1",
        prompt: "Write the role you want the AI to play.",
        placeholder: "You are a product designer, frontend developer, startup coach...",
      },
      {
        id: "task",
        label: "Step 2",
        prompt: "Describe the task clearly.",
        placeholder: "Build a landing page, suggest features, create a simple app flow...",
      },
      {
        id: "context",
        label: "Step 3",
        prompt: "Add the context and constraints.",
        placeholder: "Audience, features, tone, design style, beginner-friendly needs...",
      },
    ],
  },
  {
    day: 5,
    slug: "ai-coding-tools",
    title: "AI Coding Tools",
    mission: "Use AI to generate interface and feature ideas.",
    summary: "Practice turning product thoughts into screens and small working pieces.",
    phase: "Prompting",
    steps: [
      {
        id: "feature",
        label: "Step 1",
        prompt: "Name one feature you want the AI tool to generate.",
        placeholder: "Progress tracker, card grid, login form, mission page...",
      },
      {
        id: "ui",
        label: "Step 2",
        prompt: "Describe the UI you want in plain language.",
        placeholder: "Minimal cards, soft gradients, simple mobile layout...",
      },
      {
        id: "review",
        label: "Step 3",
        prompt: "Write one improvement you would request after the first result.",
        placeholder: "Make it simpler, cleaner, easier to understand, more focused...",
      },
    ],
  },
  {
    day: 6,
    slug: "choose-game",
    title: "Choose Your Game",
    mission: "Pick a game idea and define the core loop.",
    summary: "Start with one fun mechanic you can ship quickly in the browser.",
    phase: "Build a Game",
    steps: [
      {
        id: "game",
        label: "Step 1",
        prompt: "Which game are you building?",
        placeholder: "Reaction Speed Test, Snake Game, Memory Match...",
      },
      {
        id: "loop",
        label: "Step 2",
        prompt: "Describe the main action the player repeats.",
        placeholder: "Click fast, guess correctly, avoid obstacles, match cards...",
      },
      {
        id: "win",
        label: "Step 3",
        prompt: "How does the player know they are doing well?",
        placeholder: "Score, time, streak, survival time, level complete...",
      },
    ],
  },
  {
    day: 7,
    slug: "build-game-ui",
    title: "Build the Game UI",
    mission: "Create the layout and interaction for your game.",
    summary: "Focus on a clean interface and one satisfying interaction.",
    phase: "Build a Game",
    steps: [
      {
        id: "screen",
        label: "Step 1",
        prompt: "Describe the first screen of your game.",
        placeholder: "Start button, title, how to play, score area...",
      },
      {
        id: "interaction",
        label: "Step 2",
        prompt: "Describe the main interaction in one sentence.",
        placeholder: "Players click targets before they disappear...",
      },
      {
        id: "feedback",
        label: "Step 3",
        prompt: "How will your UI give feedback after each action?",
        placeholder: "Score updates, color change, timer, sound, animation...",
      },
    ],
  },
  {
    day: 8,
    slug: "ship-game",
    title: "Polish and Ship the Game",
    mission: "Finish the game so someone else can play it.",
    summary: "Fix rough edges, test the flow, and make it feel ready to share.",
    phase: "Build a Game",
    steps: [
      {
        id: "test",
        label: "Step 1",
        prompt: "What did you test in your game today?",
        placeholder: "Start flow, scoring, restart, mobile layout, bugs...",
      },
      {
        id: "fix",
        label: "Step 2",
        prompt: "What is one issue you fixed?",
        placeholder: "Button overlap, score bug, unclear instructions...",
      },
      {
        id: "share",
        label: "Step 3",
        prompt: "Write one line you would use to introduce your game.",
        placeholder: "A fast reaction game for friendly competition...",
      },
    ],
  },
  {
    day: 9,
    slug: "choose-product",
    title: "Choose a Micro Product",
    mission: "Pick a useful AI product idea to build.",
    summary: "Choose one problem, one user, and one simple output.",
    phase: "Build a Micro Product",
    steps: [
      {
        id: "idea",
        label: "Step 1",
        prompt: "Which micro product are you building?",
        placeholder: "Lecture notes cleaner, email reply generator, habit tracker...",
      },
      {
        id: "user",
        label: "Step 2",
        prompt: "Who is this for?",
        placeholder: "Students, job seekers, club leads, roommates, creators...",
      },
      {
        id: "result",
        label: "Step 3",
        prompt: "What exact result will the product generate or show?",
        placeholder: "Clean notes, improved bullets, summarized text, reminder list...",
      },
    ],
  },
  {
    day: 10,
    slug: "product-flow",
    title: "Design the Product Flow",
    mission: "Map the simplest user journey.",
    summary: "Keep the product calm and useful with one clear input and output.",
    phase: "Build a Micro Product",
    steps: [
      {
        id: "input",
        label: "Step 1",
        prompt: "What does the user input?",
        placeholder: "Raw notes, resume bullet, prompt, task list, email...",
      },
      {
        id: "output",
        label: "Step 2",
        prompt: "What output do they receive?",
        placeholder: "Clean summary, improved text, generated captions, organized notes...",
      },
      {
        id: "screen",
        label: "Step 3",
        prompt: "Describe the main screen layout.",
        placeholder: "One input box, one action button, one result card...",
      },
    ],
  },
  {
    day: 11,
    slug: "build-core-feature",
    title: "Build the Core Feature",
    mission: "Implement the one feature that makes the product useful.",
    summary: "Focus on the main value before thinking about extra polish.",
    phase: "Build a Micro Product",
    steps: [
      {
        id: "feature",
        label: "Step 1",
        prompt: "What is the single most important feature you built today?",
        placeholder: "Text cleanup, output generation, reminder creation...",
      },
      {
        id: "prompt",
        label: "Step 2",
        prompt: "What prompt or logic powers that feature?",
        placeholder: "Summarize these notes, rewrite this email, improve these bullets...",
      },
      {
        id: "check",
        label: "Step 3",
        prompt: "How will you know it works well enough?",
        placeholder: "Clear output, fewer clicks, understandable result, helpful formatting...",
      },
    ],
  },
  {
    day: 12,
    slug: "refine-product",
    title: "Refine the Product",
    mission: "Make the product easier to understand and use.",
    summary: "Polish clarity, labels, and small interactions instead of adding complexity.",
    phase: "Build a Micro Product",
    steps: [
      {
        id: "clarity",
        label: "Step 1",
        prompt: "What confused a first-time user?",
        placeholder: "Unclear input label, too many buttons, vague output...",
      },
      {
        id: "change",
        label: "Step 2",
        prompt: "What change will make it clearer?",
        placeholder: "Shorter labels, helper text, cleaner spacing, better default content...",
      },
      {
        id: "confidence",
        label: "Step 3",
        prompt: "What makes the experience feel trustworthy?",
        placeholder: "Simple instructions, stable output, clean design, useful examples...",
      },
    ],
  },
  {
    day: 13,
    slug: "prepare-launch",
    title: "Prepare for Launch",
    mission: "Make your product presentable and shareable.",
    summary: "Get the app ready for demo with a clear value proposition and stable flow.",
    phase: "Build a Micro Product",
    steps: [
      {
        id: "headline",
        label: "Step 1",
        prompt: "Write a one-line headline for your product.",
        placeholder: "An AI tool that helps students turn messy notes into clean summaries.",
      },
      {
        id: "promise",
        label: "Step 2",
        prompt: "What promise does your product make?",
        placeholder: "Save time, reduce stress, improve clarity, generate ideas quickly...",
      },
      {
        id: "demo",
        label: "Step 3",
        prompt: "What will you show first during your demo?",
        placeholder: "The input, the output, the key feature, the simplest wow moment...",
      },
    ],
  },
  {
    day: 14,
    slug: "landing-page",
    title: "Launch Setup",
    mission: "Create a landing page and get ready to deploy.",
    summary: "Show what your project does and make it easy for others to try.",
    phase: "Launch",
    steps: [
      {
        id: "hero",
        label: "Step 1",
        prompt: "Write the headline for your landing page.",
        placeholder: "Describe the problem and promise in one simple sentence.",
      },
      {
        id: "proof",
        label: "Step 2",
        prompt: "What should the page show to build trust?",
        placeholder: "Feature preview, short explanation, demo screenshot, example output...",
      },
      {
        id: "cta",
        label: "Step 3",
        prompt: "What action should users take?",
        placeholder: "Try it now, play the game, explore the tool, share feedback...",
      },
    ],
  },
  {
    day: 15,
    slug: "demo-day",
    title: "Demo Day",
    mission: "Present what you built with confidence.",
    summary: "Tell the story of the problem, the build, and what shipped.",
    phase: "Launch",
    steps: [
      {
        id: "story",
        label: "Step 1",
        prompt: "What problem did your product solve?",
        placeholder: "Explain it in simple language for someone seeing it the first time.",
      },
      {
        id: "build",
        label: "Step 2",
        prompt: "What are you most proud of building?",
        placeholder: "The game loop, the AI output, the design, the launch flow...",
      },
      {
        id: "next",
        label: "Step 3",
        prompt: "What would you improve next?",
        placeholder: "More polish, more features, more testing, stronger onboarding...",
      },
    ],
  },
];

export function getMissionByDay(day: number) {
  return missions.find((mission) => mission.day === day);
}
