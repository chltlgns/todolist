export type Priority = "URGENT" | "HIGH" | "NORMAL" | "LOW";

// User Roles
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  coins: number;
  role: UserRole;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  startTime: Date | null;
  endTime: Date | null;
  dueDate: Date | null;
  categoryId: string | null;
  completed: boolean;
  coinReward: number;
  notifyBefore: number | null;
  notified: boolean;
  kanbanStatus?: KanbanStatus;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
  tags?: TodoTag[];
}

export interface TodoTag {
  todoId: string;
  tagId: string;
  tag?: Tag;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  price: number;
  used: boolean;
  createdAt: Date;
}

export interface TodoFilters {
  search?: string;
  priority?: Priority | "ALL";
  categoryId?: string | "ALL";
  completed?: boolean | "ALL";
  tagId?: string;
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  URGENT: { label: "긴급", color: "text-red-500", bgColor: "bg-red-500/10" },
  HIGH: { label: "높음", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  NORMAL: { label: "보통", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  LOW: { label: "낮음", color: "text-gray-500", bgColor: "bg-gray-500/10" },
};

export const NOTIFY_OPTIONS = [
  { value: 5, label: "5분 전" },
  { value: 10, label: "10분 전" },
  { value: 15, label: "15분 전" },
  { value: 30, label: "30분 전" },
];

// Goal Setting
export interface UserGoal {
  id: string;
  userId: string;
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  createdAt: Date;
  updatedAt: Date;
}

// Recurring Task
export type RecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY";

export interface RecurringTask {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  categoryId: string | null;
  recurrenceType: RecurrenceType;
  recurrenceDays: number[]; // For weekly: 0-6 (Sun-Sat), For monthly: 1-31
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  coinReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
}

// Subtask
export interface Subtask {
  id: string;
  todoId: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: Date;
}

// Task Template
export interface TaskTemplate {
  id: string;
  userId: string;
  name: string;
  title: string;
  description: string | null;
  priority: Priority;
  categoryId: string | null;
  defaultDuration: number; // in minutes
  coinReward: number;
  subtasks: string[]; // array of subtask titles
  createdAt: Date;
  category?: Category | null;
}

// User Settings
export type ThemeType = "system" | "dark" | "navy";

export interface UserSettings {
  id: string;
  userId: string;
  theme: ThemeType;
  notificationsEnabled: boolean;
  emailReminders: boolean;
  dailySummary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Pomodoro Session
export interface PomodoroSession {
  id: string;
  todoId: string | null;
  userId: string;
  duration: number; // in minutes
  completedAt: Date;
  createdAt: Date;
}

// Kanban Status
export type KanbanStatus = "TODO" | "IN_PROGRESS" | "DONE";

// =============================================
// Admin Feature Types
// =============================================

// Announcement Types
export type AnnouncementType = "info" | "warning" | "important";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isActive: boolean;
  priority: number;
  startDate: Date | null;
  endDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
}

// Admin Activity Log
export type AdminAction =
  | "USER_COIN_ADJUST"
  | "USER_ROLE_CHANGE"
  | "REWARD_CREATE"
  | "REWARD_UPDATE"
  | "REWARD_DELETE"
  | "ANNOUNCEMENT_CREATE"
  | "ANNOUNCEMENT_UPDATE"
  | "ANNOUNCEMENT_DELETE";

export type AdminTargetType = "user" | "reward" | "announcement";

export interface AdminActivityLog {
  id: string;
  adminId: string;
  action: AdminAction;
  targetType: AdminTargetType;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
  admin?: User;
}

// Admin Dashboard Statistics
export interface AdminDashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalTasks: number;
  completedTasksToday: number;
  totalCoinsInCirculation: number;
  totalRewardsPurchased: number;
  activeAnnouncements: number;
}

// User with extended stats for admin
export interface UserWithStats extends User {
  totalTasks: number;
  completedTasks: number;
  totalPurchases: number;
  lastActiveAt: Date | null;
}

// Report Types
export interface CategoryPopularity {
  categoryId: string;
  categoryName: string;
  taskCount: number;
  completedCount: number;
  completionRate: number;
}

export interface UserRanking {
  userId: string;
  email: string;
  totalCompleted: number;
  totalCoinsEarned: number;
  rank: number;
}

export interface CoinUsageReport {
  date: string;
  coinsEarned: number;
  coinsSpent: number;
  netChange: number;
}
