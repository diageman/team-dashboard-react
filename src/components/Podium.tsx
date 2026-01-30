import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, Zap, Crown } from 'lucide-react';

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

    // Find best of each team (since items are sorted by rank, first find is best)
    const team1Leader = items.find(i => i.team === 'Команда 1');
    const team2Leader = items.find(i => i.team === 'Команда 2');

    return (
        <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
            {/* Header with shimmer effect */}
            <div className={clsx(
                "relative p-6 rounded-t-2xl text-center overflow-hidden",
                isPremium
                    ? "bg-gradient-to-br from-amber-500/15 to-[#0A0A0A] border-b border-amber-500/20"
                    : "bg-gradient-to-br from-[#FDB813]/10 to-[#0A0A0A] border-b border-[#FDB813]/20"
            )}>
                {/* Shimmer overlay */}
                <div className="absolute inset-0 gold-shimmer pointer-events-none" />

                <motion.h2
                    className="text-2xl font-bold gradient-text mb-2 flex items-center justify-center gap-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {isPremium && <Sparkles className="text-amber-400 animate-pulse" />}
                    <Crown className="w-6 h-6 text-[#FDB813] opacity-60" />
                    {title}
                </motion.h2>
                <p className="text-zinc-400">{subtitle}</p>
            </div>

            <div className="liquid-glass rounded-b-2xl overflow-hidden flex flex-col max-h-[1200px]">
                {/* Team Battles Section */}
                <div className="p-4 grid grid-cols-2 gap-4 border-b border-white/5 bg-black/20">
                    {/* Team 1 Leader */}
                    <motion.div
                        className="relative p-3 rounded-xl border border-blue-500/30 bg-blue-900/10 flex flex-col items-center text-center group cursor-default"
                        whileHover={{
                            scale: 1.02,
                            borderColor: "rgba(59, 130, 246, 0.6)",
                            boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="absolute -top-3 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/50 uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Команда 1
                        </div>
                        {team1Leader ? (
                            <>
                                <motion.div
                                    className="mt-2 mb-2"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    <img
                                        src={team1Leader.avatar}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 48 48'%3E%3Crect fill='%231e3a8a' width='48' height='48'/%3E%3C/svg%3E";
                                        }}
                                    />
                                </motion.div>
                                <div className="font-bold text-white text-sm leading-tight truncate w-full">{team1Leader.name}</div>
                                <div className="text-blue-300 font-mono font-bold text-lg mt-1">{team1Leader.value}</div>
                            </>
                        ) : (
                            <div className="text-zinc-500 text-xs py-4">Нет данных</div>
                        )}
                    </motion.div>

                    {/* Team 2 Leader */}
                    <motion.div
                        className="relative p-3 rounded-xl border border-rose-500/30 bg-rose-900/10 flex flex-col items-center text-center group cursor-default"
                        whileHover={{
                            scale: 1.02,
                            borderColor: "rgba(244, 63, 94, 0.6)",
                            boxShadow: "0 0 30px rgba(244, 63, 94, 0.2)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="absolute -top-3 bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/50 uppercase tracking-wider flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Команда 2
                        </div>
                        {team2Leader ? (
                            <>
                                <motion.div
                                    className="mt-2 mb-2"
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                >
                                    <img
                                        src={team2Leader.avatar}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-rose-400 shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-shadow"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 48 48'%3E%3Crect fill='%23881337' width='48' height='48'/%3E%3C/svg%3E";
                                        }}
                                    />
                                </motion.div>
                                <div className="font-bold text-white text-sm leading-tight truncate w-full">{team2Leader.name}</div>
                                <div className="text-rose-300 font-mono font-bold text-lg mt-1">{team2Leader.value}</div>
                            </>
                        ) : (
                            <div className="text-zinc-500 text-xs py-4">Нет данных</div>
                        )}
                    </motion.div>
                </div>


                <div className="text-center py-2 text-xs uppercase tracking-widest text-zinc-500 font-bold bg-black/40">
                    Общий рейтинг
                </div>

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
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(253, 184, 19, 0.1)" }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex items-center gap-4 p-4 rounded-xl border border-secondary/50 transition-colors bg-background/40 cursor-default"
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
        </motion.div>
    );
};
