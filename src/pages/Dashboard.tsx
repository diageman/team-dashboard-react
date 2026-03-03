import { useState, useMemo } from 'react';
import { getISOWeek, getISOWeekYear, startOfISOWeek, endOfISOWeek, parseISO, format } from 'date-fns';
import { useEmployees } from '../hooks/useEmployees';
import { getAvailableMonths } from '../lib/calculations';
import { secondsToTime } from '../lib/utils';
import { Podium } from '../components/Podium';
import { IdeasModal } from '../components/IdeasModal';
import { MagicSelect } from '../components/ui/MagicSelect';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';



export const Dashboard = () => {
    const { employees, loading } = useEmployees();

    // Получаем доступные месяцы
    const availableMonths = useMemo(() => getAvailableMonths(employees), [employees]);

    // По умолчанию выбираем первый месяц с данными (не текущий!)
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    // Устанавливаем месяц когда данные загружены
    useMemo(() => {
        if (availableMonths.length > 0 && !selectedMonth) {
            setSelectedMonth(availableMonths[0]);
        }
    }, [availableMonths, selectedMonth]);

    const [selectedWeek, setSelectedWeek] = useState<string>('all');
    // По умолчанию режим day - т.к. импортируются дневные данные
    const [viewMode, setViewMode] = useState<'week' | 'day'>('day');
    const [selectedDate, setSelectedDate] = useState<string>('all');
    const [selectedEmployeeForIdeas, setSelectedEmployeeForIdeas] = useState<string | null>(null);

    // Генерируем список недель из days (ISO недели)
    const availableWeeks = useMemo(() => {
        const weeksMap = new Map<string, { start: Date, end: Date, label: string, weekNum: number, year: number }>();
        employees.forEach(emp => {
            Object.keys(emp.days || {}).forEach(dateStr => {
                if (dateStr.startsWith(selectedMonth)) {
                    const date = parseISO(dateStr);
                    const weekNum = getISOWeek(date);
                    const year = getISOWeekYear(date);
                    const key = `${year}-${weekNum}`;

                    if (!weeksMap.has(key)) {
                        const start = startOfISOWeek(date);
                        const end = endOfISOWeek(date);
                        weeksMap.set(key, {
                            start,
                            end,
                            label: `${format(start, 'dd.MM')} - ${format(end, 'dd.MM')}`,
                            weekNum,
                            year
                        });
                    }
                }
            });
        });

        return Array.from(weeksMap.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [employees, selectedMonth]);

    // Handle data aggregation based on Week Selection OR Daily Selection
    // ВАЖНО: Все расчёты теперь базируются на данных из days
    const dashboardData = useMemo(() => {
        // Фильтруем только активных сотрудников (isActive !== false)
        const activeEmployees = employees.filter(emp => emp.isActive !== false);

        const aggregateDays = (entries: [string, any][]) => {
            let totalKpi = 0, totalChats = 0, weightedResponseTime = 0, rtSimpleSum = 0, rtDays = 0;
            let kpiCount = 0;
            entries.forEach(([_, data]) => {
                if (data.kpi > 0) {
                    totalKpi += data.kpi;
                    kpiCount++;
                }
                const chats = data.chats || 0;
                const rt = data.responseTime || 0;
                totalChats += chats;
                if (rt > 0 && chats > 0) {
                    weightedResponseTime += rt * chats;
                    rtSimpleSum += rt;
                    rtDays++;
                } else if (rt > 0) {
                    weightedResponseTime += rt;
                    rtSimpleSum += rt;
                    rtDays++;
                }
            });

            const avgResponseTime = totalChats > 0
                ? (weightedResponseTime / totalChats)
                : (rtDays > 0 ? (rtSimpleSum / rtDays) : 0);

            return {
                kpi: kpiCount > 0 ? parseFloat((totalKpi / kpiCount).toFixed(2)) : 0,
                chats: totalChats,
                responseTime: Math.round(avgResponseTime),
                activityCount: 0
            };
        };

        return activeEmployees.map(emp => {
            let stats: any = null;

            // Для месячного расчёта берём ВСЕ дни, группируем по неделям
            // и включаем недели, которые пересекаются с выбранным месяцем
            const allDays = Object.entries(emp.days || {});

            // Фильтруем дни за выбранный месяц (для режима "конкретный день")
            const monthDays: Record<string, any> = {};
            Object.entries(emp.days || {}).forEach(([date, data]) => {
                if (date.startsWith(selectedMonth)) {
                    monthDays[date] = data;
                }
            });

            const dayEntries = Object.entries(monthDays);

            const ideasCount = emp.ideas?.[selectedMonth]?.length || 0;

            if (viewMode === 'week') {
                if (selectedWeek === 'all') {
                    if (dayEntries.length > 0) {
                        stats = aggregateDays(dayEntries);
                        if (stats.kpi === 0 && stats.chats === 0) stats = null;
                    }
                } else {
                    const [yearStr, weekStr] = selectedWeek.split('-');
                    const targetYear = parseInt(yearStr);
                    const targetWeek = parseInt(weekStr);

                    const weekDays = allDays.filter(([dateStr]) => {
                        const d = parseISO(dateStr);
                        return getISOWeek(d) === targetWeek && getISOWeekYear(d) === targetYear;
                    });

                    if (weekDays.length > 0) {
                        stats = aggregateDays(weekDays);
                        if (stats.kpi === 0 && stats.chats === 0) stats = null;
                    }
                }
            } else {
                // DAILY MODE
                if (dayEntries.length > 0) {
                    if (selectedDate === 'all') {
                        stats = aggregateDays(dayEntries);
                        if (stats.kpi === 0 && stats.chats === 0) stats = null;
                    } else {
                        const dayStats = emp.days?.[selectedDate];
                        if (dayStats) {
                            stats = {
                                kpi: dayStats.kpi,
                                chats: dayStats.chats,
                                responseTime: dayStats.responseTime || 0,
                                activityCount: 0
                            };
                        }
                    }
                }
            }

            if (stats) {
                stats.activityCount = ideasCount;
            } else if (ideasCount > 0) {
                stats = { kpi: 0, chats: 0, responseTime: 0, activityCount: ideasCount };
            }

            return {
                ...emp,
                stats,
                daysWorked: dayEntries.length
            };
        }).filter(e => e.stats !== null);
    }, [employees, selectedMonth, selectedWeek, viewMode, selectedDate]);

    // Generators for leaderboard lists
    const getLeaderboard = (
        metric: 'kpi' | 'chats' | 'responseTime' | 'activityCount',
        sortDir: 'asc' | 'desc'
    ) => {
        let data = [...dashboardData];

        // Отсеиваем сотрудников, которые отработали мало дней, если смотрим "За месяц"
        // Высчитываем порог динамически на случай если мы смотрим в начале месяца (не успел отработать 10 дней)
        const isMonthlyView = (viewMode === 'week' && selectedWeek === 'all') || (viewMode === 'day' && selectedDate === 'all');
        if (isMonthlyView) {
            const maxDays = Math.max(...data.map(e => e.daysWorked || 0), 0);
            const threshold = Math.min(10, Math.ceil(maxDays * 0.5)); // Порог = 50% от лидера месяца, но не больше 10
            data = data.filter(e => (e.daysWorked || 0) >= threshold);
        }

        // Для responseTime: исключаем сотрудников с 0 (не работали)
        if (metric === 'responseTime') {
            data = data.filter(e => e.stats![metric] > 0);
        }

        return data
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
                    : metric === 'responseTime' ? secondsToTime(e.stats![metric])
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
            data: getLeaderboard('activityCount', 'desc'),
            onItemClick: (id: string) => setSelectedEmployeeForIdeas(id)
        },
    ];

    return (
        <div>
            <motion.div
                className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h2 className="text-3xl font-bold gradient-text mb-2">Обзор команд</h2>
                    <div className="flex gap-2 mb-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${viewMode === 'week' ? 'bg-[#FDB813] text-black border-[#FDB813] shadow-lg shadow-[#FDB813]/20' : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-[#FDB813]/50'}`}
                        >
                            Неделя / Месяц
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${viewMode === 'day' ? 'bg-[#FDB813] text-black border-[#FDB813] shadow-lg shadow-[#FDB813]/20' : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-[#FDB813]/50'}`}
                        >
                            Ежедневный
                        </motion.button>
                    </div>
                </div>

                <div className="flex gap-8 flex-wrap items-center">
                    {/* Общий выбор месяца для всех режимов */}
                    <MagicSelect
                        label="Месяц:"
                        value={selectedMonth}
                        onChange={(val) => {
                            setSelectedMonth(val);
                            setSelectedWeek('all');
                            setSelectedDate('all');
                        }}
                        options={[
                            ...availableMonths.map(m => ({ value: m, label: m })),
                            ...(!availableMonths.includes(selectedMonth) && selectedMonth ? [{ value: selectedMonth, label: selectedMonth }] : [])
                        ]}
                        className="w-[180px]"
                    />

                    {/* Выбор периода в зависимости от режима */}
                    {viewMode === 'week' ? (
                        <MagicSelect
                            label="Неделя:"
                            value={selectedWeek}
                            onChange={(val) => setSelectedWeek(val)}
                            options={[
                                { value: 'all', label: 'Весь месяц (Итог)' },
                                ...availableWeeks.map(week => ({
                                    value: `${week.year}-${week.weekNum}`,
                                    label: week.label,
                                    key: `${week.year}-${week.weekNum}`
                                }))
                            ]}
                            className="w-[220px]"
                        />
                    ) : (
                        <MagicSelect
                            label="Дата:"
                            value={selectedDate}
                            onChange={(val) => setSelectedDate(val)}
                            options={[
                                { value: 'all', label: 'Весь месяц (Итог)' },
                                ...employees.flatMap(emp =>
                                    Object.keys(emp.days || {})
                                        .filter(d => d.startsWith(selectedMonth))
                                ).filter((v, i, a) => a.indexOf(v) === i)
                                    .sort()
                                    .map(date => ({
                                        value: date,
                                        label: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
                                        key: date
                                    }))
                            ]}
                            className="w-[200px]"
                        />
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.15 }}
                className="space-y-16"
            >
                {sections.map((section, idx) => (
                    <motion.section
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                        className="scroll-mt-24"
                    >
                        <Podium
                            title={section.title}
                            subtitle={section.subtitle}
                            items={section.data}
                            type={section.type as any}
                            onItemClick={section.title === 'Активность и идеи' ? (id) => setSelectedEmployeeForIdeas(id) : undefined}
                        />
                    </motion.section>
                ))}
            </motion.div>

            <IdeasModal
                isOpen={!!selectedEmployeeForIdeas}
                onClose={() => setSelectedEmployeeForIdeas(null)}
                employee={employees.find(e => e.id === selectedEmployeeForIdeas) || null}
                month={selectedMonth}
            />
        </div >
    );
};
