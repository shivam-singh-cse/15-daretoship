export type BuilderUser = {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: string;
  created_at?: string;
};

export type ProgressRow = {
  id: string;
  user_id: string;
  day_number: number;
  completed: boolean;
  completed_at?: string;
};

export type SubmissionRow = {
  id: string;
  user_id: string;
  day_number: number;
  content: Record<string, string>;
};

export type ProjectRow = {
  id: string;
  user_id: string;
  type: "game" | "product";
  url: string;
  created_at?: string;
};
