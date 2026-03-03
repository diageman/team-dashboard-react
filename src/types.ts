export type Team = 'Команда 1' | 'Команда 2';

export interface WeeklyStats {
    kpi: number;
    chats: number;
    responseTime: number;
    activities: string[];
    startDate: string;
    endDate: string;
}

export interface Employee {
    id: string;
    name: string;
    team: Team;
    avatar: string;
    isActive?: boolean; // true = работает, false = уволен (по умолчанию true)
    terminatedAt?: string; // Дата увольнения (YYYY-MM-DD) для исключения из статистики
    // Format: "YYYY-MM" -> { "YYYY-MM-DD": Stats }
    weeks: Record<string, Record<string, WeeklyStats>>;
    // Format: "YYYY-MM-DD" -> Stats
    days?: Record<string, WeeklyStats>;
    // Format: "YYYY-MM" -> ["Идея 1", "Идея 2"]
    ideas?: Record<string, string[]>;
}

export interface MonthlyAggregatedStats {
    kpi: number;
    chats: number;
    responseTime: number;
    activityCount: number;
}
