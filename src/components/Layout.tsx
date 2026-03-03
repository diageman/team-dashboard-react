import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Settings, Trophy, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Дашборд' },
    { path: '/ideas', icon: Sparkles, label: 'Идеи' },
    { path: '/add', icon: UserPlus, label: 'Добавить' },
    { path: '/manage', icon: Settings, label: 'Управление' },
];

export const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 pb-20 md:pb-0">
            {/* Ambient background glow - static for performance */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ contain: 'strict' }}>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FDB813]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FDB813]/3 rounded-full blur-[80px]" />
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 liquid-glass-header">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            animate={{
                                y: [0, -3, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative"
                        >
                            <Trophy className="w-8 h-8 text-[#FDB813] drop-shadow-[0_0_10px_rgba(253,184,19,0.5)]" />
                            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
                        </motion.div>
                        <h1 className="text-xl font-bold gradient-text">
                            Таксопарк Свои
                        </h1>
                    </motion.div>

                    <nav className="hidden md:flex gap-1">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                >
                                    <Link
                                        to={item.path}
                                        className={clsx(
                                            'relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
                                            isActive
                                                ? 'text-[#FDB813] font-medium'
                                                : 'text-zinc-400 hover:text-[#FFCE3D]'
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="absolute inset-0 liquid-glass-subtle rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <item.icon className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10">{item.label}</span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="pt-24 px-4 max-w-7xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 liquid-glass-nav safe-area-bottom z-50" style={{ willChange: 'auto', contain: 'layout style paint' }}>
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-200',
                                    isActive ? 'text-[#FDB813]' : 'text-zinc-500'
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-[#FDB813]/10 rounded-xl border border-[#FDB813]/20" />
                                )}
                                <item.icon className={clsx(
                                    "w-6 h-6 relative z-10",
                                    isActive && "scale-110"
                                )} />
                                <span className="text-xs font-medium relative z-10">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
