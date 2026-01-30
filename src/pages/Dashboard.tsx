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
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().slice(0, 10)
    );

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
            Object.values(monthWeeks).forEach(stats => {
                if (stats.startDate) {
                    weeksSet.add(stats.startDate);
                }
            });
        });
        return Array.from(weeksSet).sort();
    }, [employees, selectedMonth]);

    const formatWeekLabel = (startDateStr: string) => {
        for (const emp of employees) {
            const monthWeeks = emp.weeks?.[selectedMonth] || {};
            const stats = monthWeeks[startDateStr];
            if (stats && stats.endDate) {
                const start = new Date(stats.startDate);
                const end = new Date(stats.endDate);
                return `${start.getDate()}.${String(start.getMonth() + 1).padStart(2, '0')} - ${end.getDate()}.${String(end.getMonth() + 1).padStart(2, '0')}`;
            }
        }
        return startDateStr;
    }

    // Handle data aggregation based on Week Selection OR Daily Selection
    const dashboardData = useMemo(() => {
        return employees.map(emp => {
            let stats: any = null;

            if (viewMode === 'week') {
                const monthWeeks = emp.weeks?.[selectedMonth] || {};
                if (selectedWeek === 'all') {
                    stats = calculateMonthlyStats(monthWeeks);
                } else {
                    const wStats = monthWeeks[selectedWeek];
                    if (wStats) {
                        stats = {
                            kpi: wStats.kpi,
                            chats: wStats.chats,
                            responseTime: wStats.responseTime,
                            activityCount: wStats.activities.length
                        };
                    }
                }
            } else {
                // DAILY MODE
                const dayStats = emp.days?.[selectedDate];
                if (dayStats) {
                    stats = {
                        kpi: dayStats.kpi,
                        chats: dayStats.chats,
                        responseTime: dayStats.responseTime,
                        activityCount: dayStats.activities.length
                    };
                }
            }

            return {
                ...emp,
                stats
            };
        }).filter(e => e.stats !== null);
    }, [employees, selectedMonth, selectedWeek, viewMode, selectedDate]);

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
                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${viewMode === 'week' ? 'bg-[#FDB813] text-black border-[#FDB813]' : 'bg-transparent text-zinc-500 border-zinc-700'}`}
                        >
                            Неделя / Месяц
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${viewMode === 'day' ? 'bg-[#FDB813] text-black border-[#FDB813]' : 'bg-transparent text-zinc-500 border-zinc-700'}`}
                        >
                            Ежедневный
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    {viewMode === 'week' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-sm">Дата:</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-[#121212]/80 backdrop-blur-sm border border-[#FDB813]/20 text-white rounded-xl px-4 py-2 outline-none focus:border-[#FDB813]/50"
                            />
                        </div>
                    )}
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
