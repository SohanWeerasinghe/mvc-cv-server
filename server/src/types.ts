export type ResumeJob = {
  role: string;
  company?: string;
  start?: string;
  end?: string;
  bullets?: string[];
};

export type ResumeData = {
  name?: string;
  title?: string;
  email?: string;
  location?: string;
  summary?: string;
  experience: ResumeJob[];
  education?: string[];
  skills?: string[];
};
