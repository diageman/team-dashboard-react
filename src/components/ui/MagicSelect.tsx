import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MagicSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: {
        value: string;
        label: string;
        key?: string;
    }[];
    placeholder?: string;
    className?: string;
    label?: string; // Верхний лейбл (например "Месяц:")
}

export const MagicSelect = ({
    value,
    onChange,
    options,
    placeholder = 'Выберите...',
    className,
    label
}: MagicSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={cn("relative", isOpen ? "z-[100]" : "z-10", className)} ref={containerRef}>
            {/* Label if provided */}
            {label && (
                <span className="text-zinc-400 text-sm mr-2">{label}</span>
            )}

            <div className="relative inline-block min-w-[200px]">
                {/* Trigger Button */}
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(253, 184, 19, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between",
                        "bg-[#121212]/80 backdrop-blur-md",
                        "border border-[#FDB813]/20",
                        "text-white rounded-xl px-4 py-2.5",
                        "transition-colors duration-200",
                        isOpen && "border-[#FDB813]/50 shadow-[0_0_15px_rgba(253,184,19,0.1)]",
                        className
                    )}
                >
                    <span className="truncate mr-2">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-4 h-4 text-[#FDB813]" />
                    </motion.div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={cn(
                                "absolute top-[calc(100%+8px)] left-0 w-full",
                                "bg-[#121212]/95 backdrop-blur-xl",
                                "border border-[#FDB813]/20",
                                "rounded-xl shadow-2xl shadow-black/50",
                                "overflow-hidden z-50",
                                "max-h-[300px] overflow-y-auto",
                                // Custom Scrollbar Styles
                                "[&::-webkit-scrollbar]:w-1.5",
                                "[&::-webkit-scrollbar-track]:bg-transparent",
                                "[&::-webkit-scrollbar-thumb]:bg-[#FDB813]/20",
                                "[&::-webkit-scrollbar-thumb]:rounded-full",
                                "[&::-webkit-scrollbar-thumb:hover]:bg-[#FDB813]/50"
                            )}
                        >
                            <div className="p-1">
                                {options.map((option) => (
                                    <motion.button
                                        type="button"
                                        key={option.key || option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 last:mb-0",
                                            "flex items-center justify-between",
                                            "transition-colors duration-150",
                                            value === option.value
                                                ? "bg-[#FDB813]/20 text-[#FDB813]"
                                                : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                        )}
                                        whileHover={{ x: 4 }}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {value === option.value && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                                {options.length === 0 && (
                                    <div className="px-3 py-4 text-center text-zinc-500 text-sm">
                                        Нет данных
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
