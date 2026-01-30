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
    // Format: "YYYY-MM" -> { "YYYY-MM-DD": Stats }
    weeks: Record<string, Record<string, WeeklyStats>>;
}

export interface MonthlyAggregatedStats {
    kpi: number;
    chats: number;
    responseTime: number;
    activityCount: number;
}
