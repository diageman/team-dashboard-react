import { WeeklyStats, MonthlyAggregatedStats } from '../types';

export const calculateMonthlyStats = (
    weeks: Record<string, WeeklyStats>
): MonthlyAggregatedStats | null => {
    const weekKeys = Object.keys(weeks);
    if (weekKeys.length === 0) return null;

    let totalKpi = 0;
    let totalChats = 0;
    let weightedResponseTime = 0;
    let totalActivities = 0;

    weekKeys.forEach((week) => {
        const data = weeks[week];
        totalKpi += data.kpi;
        totalChats += data.chats;
        weightedResponseTime += data.responseTime * data.chats; // Weight by chats
        totalActivities += data.activities?.length || 0;
    });

    // Calculate averages
    const avgKpi = totalKpi / weekKeys.length;
    // Avoid division by zero for response time
    const avgResponseTime = totalChats > 0
        ? weightedResponseTime / totalChats
        : weekKeys.reduce((acc, w) => acc + weeks[w].responseTime, 0) / weekKeys.length; // Fallback to simple average

    return {
        kpi: parseFloat(avgKpi.toFixed(2)),
        chats: totalChats,
        responseTime: parseFloat(avgResponseTime.toFixed(1)),
        activityCount: totalActivities,
    };
};

// Рассчёт статистики из дневных данных
export const calculateDailyAggregatedStats = (
    days: Record<string, WeeklyStats>
): MonthlyAggregatedStats | null => {
    const dayKeys = Object.keys(days);
    if (dayKeys.length === 0) return null;

    let totalKpi = 0;
    let totalChats = 0;
    let weightedResponseTime = 0;
    let totalActivities = 0;

    dayKeys.forEach((day) => {
        const data = days[day];
        totalKpi += data.kpi || 0;
        totalChats += data.chats || 0;
        weightedResponseTime += (data.responseTime || 0) * (data.chats || 1);
        totalActivities += data.activities?.length || 0;
    });

    const avgKpi = totalKpi / dayKeys.length;
    const avgResponseTime = totalChats > 0 ? weightedResponseTime / totalChats : 0;

    return {
        kpi: parseFloat(avgKpi.toFixed(2)),
        chats: totalChats,
        responseTime: parseFloat(avgResponseTime.toFixed(1)),
        activityCount: totalActivities,
    };
};

export const getAvailableMonths = (employees: any[]): string[] => {
    const months = new Set<string>();
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentMonth);

    employees.forEach(emp => {
        // Добавляем месяцы из weeks
        Object.keys(emp.weeks || {}).forEach(m => months.add(m));
        // Добавляем месяцы из days (извлекаем YYYY-MM из YYYY-MM-DD)
        Object.keys(emp.days || {}).forEach(d => {
            if (d.length >= 7) months.add(d.slice(0, 7));
        });
    });

    return Array.from(months).sort().reverse();
};

// Получение доступных дат для конкретного месяца
export const getAvailableDays = (employees: any[], month: string): string[] => {
    const daysSet = new Set<string>();
    employees.forEach(emp => {
        Object.keys(emp.days || {}).forEach(d => {
            if (d.startsWith(month)) {
                daysSet.add(d);
            }
        });
    });
    return Array.from(daysSet).sort();
};
