import { memo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Sparkles, Trophy } from 'lucide-react';

import { DEFAULT_AVATAR } from '../lib/constants';
import { BorderBeam } from './ui/BorderBeam';

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

export const Podium = memo(function Podium({ title, subtitle, items, type = 'default' }: PodiumProps) {
    const isPremium = type === 'premium';

    // Top 3 for Podium
    const top3 = items.filter(i => i.rank <= 3).sort((a, b) => a.rank - b.rank);
    const others = items.filter(i => i.rank > 3).sort((a, b) => a.rank - b.rank);

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
                    <Trophy className="w-6 h-6 text-[#FDB813] opacity-80" />
                    {title}
                </motion.h2>
                <p className="text-zinc-400">{subtitle}</p>
            </div>

            <div className="liquid-glass rounded-b-2xl overflow-hidden flex flex-col max-h-[1200px]">

                <div className="text-center py-2 text-xs uppercase tracking-widest text-zinc-500 font-bold bg-black/40">
                    Общий рейтинг
                </div>

                {/* Podium Section */}
                {top3.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">Нет данных</div>
                ) : (
                    <div className="relative p-8 pt-12 shrink-0">
                        {/* Spotlight прожекторы сверху */}
                        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none hidden md:block">
                            {/* Прожектор для 2 места (слева - 16.66% от центра) */}
                            <div
                                className="absolute top-0 w-[22%] h-full opacity-25"
                                style={{
                                    left: '18%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(180deg, rgba(192,192,192,0.7) 0%, rgba(192,192,192,0.15) 35%, transparent 65%)',
                                    clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                                }}
                            />
                            {/* Прожектор для 1 места (центр - 50%) */}
                            <div
                                className="absolute top-0 w-[28%] h-full opacity-35"
                                style={{
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(180deg, rgba(253,184,19,0.9) 0%, rgba(253,184,19,0.25) 40%, transparent 70%)',
                                    clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
                                }}
                            />
                            {/* Прожектор для 3 места (справа - 83.33% от левого края) */}
                            <div
                                className="absolute top-0 w-[22%] h-full opacity-25"
                                style={{
                                    left: '82%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(180deg, rgba(205,127,50,0.7) 0%, rgba(205,127,50,0.15) 35%, transparent 65%)',
                                    clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end relative z-10">
                            {[
                                top3.find(i => i.rank === 2),
                                top3.find(i => i.rank === 1),
                                top3.find(i => i.rank === 3)
                            ].filter(Boolean).map((item) => {
                                if (!item) return null;
                                const isGold = item.rank === 1;
                                const isSilver = item.rank === 2;

                                let borderColor = 'border-orange-700/50';
                                let bgColor = 'bg-gradient-to-b from-orange-900/20 to-black/40 backdrop-blur-md';
                                let glowColor = 'shadow-orange-700/10';
                                let medal = '🥉';
                                let height = 'h-auto';

                                if (isGold) {
                                    borderColor = 'border-amber-400/60';
                                    bgColor = 'bg-gradient-to-b from-amber-500/20 via-amber-900/10 to-black/50 backdrop-blur-lg';
                                    glowColor = 'shadow-amber-500/30 shadow-2xl';
                                    medal = '🥇';
                                    height = 'md:h-[105%]';
                                } else if (isSilver) {
                                    borderColor = 'border-zinc-400/50';
                                    bgColor = 'bg-gradient-to-b from-zinc-400/15 via-zinc-700/10 to-black/40 backdrop-blur-md';
                                    glowColor = 'shadow-zinc-400/15';
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
                                            glowColor,
                                            height,
                                            // On mobile, simple stack. On desktop, podium arrangement.
                                            isGold ? 'order-first md:order-2 z-10' :
                                                isSilver ? 'order-2 md:order-1' : 'order-3 md:order-3'
                                        )}
                                    >
                                        <div className="absolute -top-5 text-3xl filter drop-shadow-lg animate-bounce">
                                            {medal}
                                        </div>

                                        <div className="relative mt-2 mb-2">
                                            <img
                                                src={item.avatar || DEFAULT_AVATAR}
                                                alt={item.name}
                                                className={clsx(
                                                    "w-20 h-20 rounded-full object-cover border-4 shadow-xl",
                                                    isGold ? 'border-amber-400' : isSilver ? 'border-zinc-400' : 'border-orange-700'
                                                )}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
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

                                        {/* Border Beam для призовых мест */}
                                        {isGold && <BorderBeam size={250} duration={10} colorFrom="#FDB813" colorTo="#FFD700" />}
                                        {isSilver && <BorderBeam size={200} duration={12} colorFrom="#C0C0C0" colorTo="#E8E8E8" />}
                                        {!isGold && !isSilver && <BorderBeam size={180} duration={14} colorFrom="#CD7F32" colorTo="#B87333" />}
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
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 rounded-xl border border-secondary/50 bg-background/40 cursor-default hover:bg-[#FDB813]/10 hover:border-[#FDB813]/30 transition-colors duration-200"
                            >
                                <div className="font-mono text-zinc-500 font-bold w-8 text-center text-lg">#{item.rank}</div>
                                <img
                                    src={item.avatar || DEFAULT_AVATAR}
                                    className="w-12 h-12 rounded-full object-cover border border-secondary"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
});
