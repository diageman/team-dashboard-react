import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles } from 'lucide-react';

interface PodiumItem {
    id: string;
    name: string;
    avatar: string;
    value: string | number;
    subValue?: string;
    rank: number;
    team: string;
    isPremium?: boolean;
}

interface PodiumProps {
    title: string;
    subtitle: string;
    items: PodiumItem[];
    type?: 'default' | 'premium';
}

export const Podium = ({ title, subtitle, items, type = 'default' }: PodiumProps) => {
    const isPremium = type === 'premium';

    // Top 3 for Podium
    const top3 = items.filter(i => i.rank <= 3).sort((a, b) => a.rank - b.rank);
    const others = items.filter(i => i.rank > 3).sort((a, b) => a.rank - b.rank);

    return (
        <div className="mb-12">
            <div className={clsx(
                "p-6 rounded-t-2xl text-center relative overflow-hidden",
                isPremium
                    ? "bg-gradient-to-br from-amber-500/15 to-[#0A0A0A] border-b border-amber-500/20"
                    : "bg-gradient-to-br from-[#FDB813]/10 to-[#0A0A0A] border-b border-[#FDB813]/20"
            )}>
                <h2 className="text-2xl font-bold text-[#FDB813] mb-2 flex items-center justify-center gap-2">
                    {isPremium && <Sparkles className="text-amber-400" />}
                    {title}
                </h2>
                <p className="text-zinc-400">{subtitle}</p>
            </div>

            <div className="liquid-glass rounded-b-2xl overflow-hidden flex flex-col max-h-[800px]">
                {/* Podium Section */}
                {top3.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">Нет данных</div>
                ) : (
                    <div className="p-8 pt-12 shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {[
                                top3.find(i => i.rank === 2),
                                top3.find(i => i.rank === 1),
                                top3.find(i => i.rank === 3)
                            ].filter(Boolean).map((item) => {
                                if (!item) return null;
                                const isGold = item.rank === 1;
                                const isSilver = item.rank === 2;

                                let borderColor = 'border-orange-700';
                                let bgColor = 'bg-surface';
                                let medal = '🥉';
                                let height = 'h-auto';

                                if (isGold) {
                                    borderColor = 'border-amber-400';
                                    bgColor = 'bg-gradient-to-b from-primary/20 to-surface';
                                    medal = '🥇';
                                    height = 'md:h-[105%]';
                                } else if (isSilver) {
                                    borderColor = 'border-zinc-400';
                                    bgColor = 'bg-gradient-to-b from-zinc-700/40 to-surface';
                                    medal = '🥈';
                                    height = 'md:h-[102%]';
                                }

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -2 }}
                                        className={clsx(
                                            "relative p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all",
                                            borderColor,
                                            bgColor,
                                            height,
                                            // On mobile, simple stack. On desktop, podium arrangement.
                                            isGold ? 'order-first md:order-2 z-10 shadow-amber-500/20 shadow-xl' :
                                                isSilver ? 'order-2 md:order-1' : 'order-3 md:order-3'
                                        )}
                                    >
                                        <div className="absolute -top-5 text-3xl filter drop-shadow-lg animate-bounce">
                                            {medal}
                                        </div>

                                        <div className="relative mt-2 mb-2">
                                            <img
                                                src={item.avatar}
                                                alt={item.name}
                                                className={clsx(
                                                    "w-20 h-20 rounded-full object-cover border-4 shadow-xl",
                                                    isGold ? 'border-amber-400' : isSilver ? 'border-zinc-400' : 'border-orange-700'
                                                )}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect fill='%23334155' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%2394a3b8'%3E👤%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                            {isPremium && isGold && (
                                                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                    BONUS
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-white leading-tight mb-1 truncate w-full">{item.name}</h3>
                                        <span className="text-[10px] text-zinc-400 mb-2 truncate w-full">{item.team}</span>

                                        <div className="text-xl font-black text-white">{item.value}</div>
                                        {item.subValue && <div className="text-[10px] text-zinc-400 mt-1">{item.subValue}</div>}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* List Section for others */}
                {others.length > 0 && (
                    <div className="overflow-y-auto custom-scrollbar bg-surface/80 p-4 space-y-2">
                        {others.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-4 rounded-xl border border-secondary/50 hover:bg-secondary/50 transition-colors bg-background/40"
                            >
                                <div className="font-mono text-zinc-500 font-bold w-8 text-center text-lg">#{item.rank}</div>
                                <img
                                    src={item.avatar}
                                    className="w-12 h-12 rounded-full object-cover border border-secondary"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect fill='%23334155' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%2394a3b8'%3E👤%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="font-bold text-zinc-200 text-lg">{item.name}</div>
                                    <div className="text-sm text-zinc-500">{item.team}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-zinc-200 text-xl">{item.value}</div>
                                    {item.subValue && <div className="text-xs text-zinc-500">{item.subValue}</div>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
