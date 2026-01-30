import { useState, useMemo, useEffect } from 'react';
import { fetchEmployees } from '../lib/storage';
import { calculateMonthlyStats, getAvailableMonths } from '../lib/calculations';
import { Employee } from '../types';
import { Podium } from '../components/Podium';
import { Loader2 } from 'lucide-react';

export const Dashboard = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().slice(0, 7)
    );
    const [selectedWeek, setSelectedWeek] = useState<string>('all');

    useEffect(() => {
        const load = async () => {
            const data = await fetchEmployees();
            setEmployees(data);
            setLoading(false);
        };
        load();
    }, []);

    const availableMonths = useMemo(() => getAvailableMonths(employees), [employees]);

    // Get all available weeks for the selected month across all employees
    const availableWeeks = useMemo(() => {
        const weeksSet = new Set<string>();
        employees.forEach(emp => {
            const monthWeeks = emp.weeks?.[selectedMonth] || {};
            // monthWeeks is Record<string, WeeklyStats>
            Object.values(monthWeeks).forEach(stats => {
                // Should use stats.startDate as the key identifier
                // Ensure stats has startDate
                // In migration phase, older data might crash if we don't check
                if (stats.startDate) {
                    weeksSet.add(stats.startDate);
                }
            });
        });
        return Array.from(weeksSet).sort();
    }, [employees, selectedMonth]);

    const formatWeekLabel = (startDateStr: string) => {
        // Try to find ANY stats with this start date to get the end date
        for (const emp of employees) {
            const monthWeeks = emp.weeks?.[selectedMonth] || {};
            // We need to iterate values because keys might match startDateStr or not depending on old stats
            // But we refactored saved keys to be startDateStr
            const stats = monthWeeks[startDateStr];
            if (stats && stats.endDate) {
                const start = new Date(stats.startDate);
                const end = new Date(stats.endDate);
                return `${start.getDate()}.${String(start.getMonth() + 1).padStart(2, '0')} - ${end.getDate()}.${String(end.getMonth() + 1).padStart(2, '0')}`;
            }
        }
        return startDateStr; // Fallback
    }

    // Handle data aggregation based on Week Selection
    const dashboardData = useMemo(() => {
        return employees.map(emp => {
            const monthWeeks = emp.weeks?.[selectedMonth] || {};

            let stats: any;
            if (selectedWeek === 'all') {
                stats = calculateMonthlyStats(monthWeeks);
            } else {
                // Get specific week stats by StartDate key (which IS selectedWeek)
                const wStats = monthWeeks[selectedWeek];
                if (wStats) {
                    stats = {
                        kpi: wStats.kpi,
                        chats: wStats.chats,
                        responseTime: wStats.responseTime,
                        activityCount: wStats.activities.length
                    };
                } else {
                    stats = null;
                }
            }

            return {
                ...emp,
                stats
            };
        }).filter(e => e.stats !== null);
    }, [employees, selectedMonth, selectedWeek]);

    // Generators for leaderboard lists
    const getLeaderboard = (
        metric: 'kpi' | 'chats' | 'responseTime' | 'activityCount',
        sortDir: 'asc' | 'desc'
    ) => {
        return [...dashboardData]
            .sort((a, b) => {
                const valA = a.stats![metric];
                const valB = b.stats![metric];
                return sortDir === 'desc' ? valB - valA : valA - valB;
            })
            // No slicing here! We want full list.
            .map((e, index) => ({
                id: e.id,
                name: e.name,
                avatar: e.avatar,
                team: e.team,
                value: metric === 'kpi' ? `${e.stats![metric]}%`
                    : metric === 'responseTime' ? `${e.stats![metric]} мин`
                        : e.stats![metric],
                rank: (index + 1)
            }));
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-taxi-yellow" />
            </div>
        );
    }

    const sections = [
        {
            title: 'KPI - Лидеры команды',
            subtitle: 'Наивысший показатель эффективности',
            type: 'default',
            data: getLeaderboard('kpi', 'desc')
        },
        {
            title: 'Количество чатов',
            subtitle: 'Максимальная производительность',
            type: 'default',
            data: getLeaderboard('chats', 'desc')
        },
        {
            title: 'Самый быстрый ответ водителю',
            subtitle: 'Время ответа (минуты)',
            type: 'default',
            data: getLeaderboard('responseTime', 'asc') // Lower is better
        },
        {
            title: 'Активность и идеи',
            subtitle: 'Вклад в развитие',
            type: 'default',
            data: getLeaderboard('activityCount', 'desc')
        },
    ];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#FDB813] mb-2">Обзор команд</h2>
                    <p className="text-zinc-400">
                        {selectedWeek === 'all'
                            ? `Итоги месяца: ${selectedMonth}`
                            : `Период: ${formatWeekLabel(selectedWeek)}`}
                    </p>
                </div>

                <div className="flex gap-4">
                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setSelectedWeek('all'); // Reset week when month changes
                        }}
                        className="bg-[#121212]/80 backdrop-blur-sm border border-[#FDB813]/20 text-white rounded-xl px-4 py-2 outline-none focus:border-[#FDB813]/50"
                    >
                        {availableMonths.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                        {!availableMonths.includes(selectedMonth) && (
                            <option value={selectedMonth}>{selectedMonth}</option>
                        )}
                    </select>

                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="bg-[#121212]/80 backdrop-blur-sm border border-[#FDB813]/20 text-white rounded-xl px-4 py-2 outline-none focus:border-[#FDB813]/50"
                    >
                        <option value="all">Весь месяц (Итог)</option>
                        {availableWeeks.map(startDate => (
                            <option key={startDate} value={startDate}>
                                {formatWeekLabel(startDate)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-16">
                {sections.map((section, idx) => (
                    <section key={idx} className="scroll-mt-24">
                        <Podium
                            title={section.title}
                            subtitle={section.subtitle}
                            items={section.data}
                            type={section.type as any}
                        />
                    </section>
                ))}
            </div>
        </div>
    );
};
