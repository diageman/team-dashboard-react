import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee } from '../types';

interface IdeasModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
    month: string;
}

export const IdeasModal = ({ isOpen, onClose, employee, month }: IdeasModalProps) => {
    if (!isOpen || !employee) return null;

    const ideas = employee.ideas?.[month] || [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#111] border border-taxi-border rounded-2xl shadow-2xl overflow-hidden z-10"
                >
                    <div className="p-6 border-b border-taxi-border bg-black/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img
                                src={employee.avatar || 'about:blank'}
                                alt={employee.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#FDB813]/30"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 48 48'%3E%3Crect fill='%23334155' width='48' height='48'/%3E%3C/svg%3E";
                                }}
                            />
                            <div>
                                <h3 className="text-xl font-bold text-zinc-100">{employee.name}</h3>
                                <p className="text-sm text-zinc-400">Идеи за {month}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {ideas.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">
                                <Sparkles className="w-12 h-12 mx-auto opacity-20 mb-3" />
                                <p>У сотрудника пока нет добавленных идей за этот период</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ideas.map((idea, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-xl bg-taxi-surface/30 border border-zinc-800 relative group"
                                    >
                                        <div className="absolute top-4 left-4 text-[#FDB813]/20">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <p className="text-zinc-200 pl-8 whitespace-pre-wrap text-sm leading-relaxed">
                                            {idea}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
