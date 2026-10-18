export type UserRole = 'user' | 'admin';

export type WorkMode = 'remote' | 'hybrid' | 'onsite' | 'any';

export interface JobProfile {
  target_role: string;
  skills: string;
  experience_years: number;
  preferred_locations: string;
  work_mode: WorkMode;
  education?: string | null;
  salary_expectation?: string | null;
  resume_url?: string | null;
  professional_summary?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  onboarding_completed: boolean;
  is_active?: boolean;
  profile_image?: string | null;
  job_profile?: JobProfile | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  admin_code?: string;
  job_profile?: JobProfile | null;
}

export interface ProfileUpdateRequest {
  name?: string;
  profile_image?: string;
  job_profile?: JobProfile | null;
}

export interface DashboardSummary {
  role: UserRole;
  my_tasks: number;
  total_users?: number;
  total_tasks?: number;
}

export type OnboardingStepIcon =
  | 'dashboard'
  | 'chat'
  | 'results'
  | 'history'
  | 'users'
  | 'finish';

export interface OnboardingStep {
  title: string;
  body: string;
  target: string;
  icon?: OnboardingStepIcon;
  tips?: string[];
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  address: string;
  salary: string;
  job_type: string;
  posted: string;
  link: string;
  description: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface StoredMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: StoredMessage[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  website?: string;
  headless?: boolean;
}

export interface ChatResponse {
  conversation_id: string;
  reply: string;
  status: string;
  intent: string;
  task_id: string | null;
  session_id: string | null;
  result_id: string | null;
  summary: string | null;
  data: Record<string, unknown> | null;
  plan: Record<string, unknown> | null;
  jobs: JobListing[];
  source_website: string | null;
}

export interface ChatJobStatusResponse {
  task_id: string;
  status: string;
  reply: string | null;
  summary: string | null;
  data: Record<string, unknown> | null;
  jobs: JobListing[];
  source_website: string | null;
  session_id: string | null;
  result_id: string | null;
}

export interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  meta?: ChatResponse;
  createdAt: Date;
}

export interface ResultTableRow {
  id: string;
  task_id: string;
  session_id: string;
  conversation_id: string | null;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  task_name: string | null;
  command: string | null;
  website: string | null;
  summary: string | null;
  job_count: number;
  jobs: JobListing[];
  timestamp: string;
}
