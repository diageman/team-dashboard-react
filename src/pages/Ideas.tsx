import { useState, useMemo } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { saveEmployeeIdea, removeEmployeeIdea, isAuthenticated } from '../lib/storage';
import { Button, Input } from '../components/Ui';
import { MagicSelect } from '../components/ui/MagicSelect';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Ideas = () => {
    const { employees, loading, refetch } = useEmployees();
    const navigate = useNavigate();

    // Default to current month
    const currentDate = new Date();
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

    // Idea Input Form State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [ideaText, setIdeaText] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Authentication check for managing ideas
    const isAdmin = isAuthenticated();

    // Active employees for the dropdown
    const activeEmployees = useMemo(() => {
        return employees
            .filter(emp => emp.isActive !== false)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [employees]);

    // Available months based on ideas history
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        months.add(currentMonthStr); // Always show current month

        employees.forEach(emp => {
            if (emp.ideas) {
                Object.keys(emp.ideas).forEach(month => months.add(month));
            }
        });

        return Array.from(months).sort().reverse();
    }, [employees, currentMonthStr]);

    // Format list of ideas for the selected month
    const monthIdeas = useMemo(() => {
        const list: { id: string, name: string, avatar: string, idea: string, ideaIndex: number }[] = [];

        employees.forEach(emp => {
            if (emp.ideas && emp.ideas[selectedMonth]) {
                emp.ideas[selectedMonth].forEach((idea, index) => {
                    list.push({
                        id: emp.id,
                        name: emp.name,
                        avatar: emp.avatar,
                        idea: idea,
                        ideaIndex: index
                    });
                });
            }
        });

        // Sort by name
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }, [employees, selectedMonth]);

    const handleSaveIdea = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAdmin) {
            toast.error('Только администраторы могут добавлять идеи');
            navigate('/manage');
            return;
        }

        if (!selectedEmployeeId) {
            toast.error('Выберите сотрудника');
            return;
        }

        if (!ideaText.trim()) {
            toast.error('Введите текст идеи');
            return;
        }

        try {
            setIsSaving(true);
            await saveEmployeeIdea(selectedEmployeeId, selectedMonth, ideaText.trim());
            toast.success('Идея успешно добавлена!');
            setIdeaText('');
            // Refetch employees to update the list
            await refetch();
        } catch (err) {
            toast.error('Ошибка при сохранении идеи');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteIdea = async (employeeId: string, ideaIndex: number) => {
        if (!isAdmin) {
            toast.error('Только администраторы могут удалять идеи');
            return;
        }

        if (window.confirm('Вы уверены, что хотите удалить эту идею?')) {
            try {
                await removeEmployeeIdea(employeeId, selectedMonth, ideaIndex);
                toast.success('Идея удалена');
                await refetch();
            } catch (err) {
                toast.error('Ошибка при удалении');
                console.error(err);
            }
        }
    };

    // We don't block the whole page if not admin, we just hide the form and show readonly list if needed.
    // However, user requested to manage this mainly, but viewing is available globally.

    if (loading && employees.length === 0) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-taxi-yellow" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
                className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-[#FDB813]" />
                    <h2 className="text-3xl font-bold gradient-text">Активность и идеи</h2>
                </div>

                <div className="flex gap-4 items-center">
                    <MagicSelect
                        label="Месяц:"
                        value={selectedMonth}
                        onChange={(val) => setSelectedMonth(val)}
                        options={availableMonths.map(m => ({ value: m, label: m }))}
                        className="w-[180px]"
                    />
                </div>
            </motion.div>

            {isAdmin ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-2xl relative"
                >
                    <h3 className="text-xl font-bold mb-6 text-zinc-100 flex items-center gap-2">
                        Добавить реализованную идею
                    </h3>

                    <form onSubmit={handleSaveIdea} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Сотрудник</label>
                                <MagicSelect
                                    value={selectedEmployeeId}
                                    onChange={(val) => setSelectedEmployeeId(val)}
                                    options={[
                                        { value: '', label: 'Выберите сотрудника...' },
                                        ...activeEmployees.map(emp => ({ value: emp.id, label: emp.name }))
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Отчетный Месяц</label>
                                <Input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Описание идеи / активности</label>
                            <textarea
                                className="w-full bg-taxi-surface/50 border border-taxi-border rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-taxi-yellow/50 transition-all min-h-[80px]"
                                placeholder="Например: Разработал новый скрипт продаж, который увеличил конверсию на 15%"
                                value={ideaText}
                                onChange={(e) => setIdeaText(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full md:w-auto px-8"
                            disabled={isSaving || !selectedEmployeeId || !ideaText.trim()}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Сохранение...
                                </>
                            ) : (
                                'Добавить идею'
                            )}
                        </Button>
                    </form>
                </motion.div>
            ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl text-center text-sm">
                    Только администраторы могут добавлять новые идеи. Войдите в раздел "Управление".
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                <h3 className="text-xl font-bold text-zinc-100 mb-4 flex justify-between items-center">
                    <span>Реализованные идеи за {selectedMonth}</span>
                    <span className="text-sm font-normal text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full">
                        Всего: {monthIdeas.length}
                    </span>
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {monthIdeas.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-zinc-500 bg-taxi-surface/20 rounded-xl border border-dashed border-taxi-border"
                            >
                                <Sparkles className="w-12 h-12 mx-auto opacity-20 mb-3" />
                                <p>В этом месяце еще нет добавленных идей</p>
                            </motion.div>
                        ) : (
                            monthIdeas.map((item, idx) => (
                                <motion.div
                                    key={`${item.id}-${item.ideaIndex}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start gap-4 p-5 rounded-2xl liquid-glass border border-[#FDB813]/20 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#FDB813]/5 to-transparent pointer-events-none" />

                                    <img
                                        src={item.avatar || 'about:blank'}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-[#FDB813]/30 z-10 shrink-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 48 48'%3E%3Crect fill='%23334155' width='48' height='48'/%3E%3C/svg%3E";
                                        }}
                                    />

                                    <div className="flex-1 min-w-0 z-10">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                                            <h4 className="font-bold text-zinc-100 text-lg truncate">{item.name}</h4>
                                        </div>
                                        <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{item.idea}</p>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteIdea(item.id, item.ideaIndex)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg shrink-0 z-10"
                                            title="Удалить идею"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
