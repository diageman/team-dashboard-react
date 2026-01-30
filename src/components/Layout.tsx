import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Settings, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Дашборд' },
    { path: '/add', icon: UserPlus, label: 'Добавить' },
    { path: '/manage', icon: Settings, label: 'Управление' },
];

export const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 pb-20 md:pb-0">
            <header className="fixed top-0 left-0 right-0 z-50 liquid-glass-header">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-[#FDB813]" />
                        <h1 className="text-xl font-bold text-[#FDB813]">
                            Таксопарк Свои
                        </h1>
                    </div>

                    <nav className="hidden md:flex gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
                                        isActive
                                            ? 'liquid-glass-subtle text-[#FDB813] font-medium'
                                            : 'text-zinc-400 hover:text-[#FFCE3D] hover:bg-white/5'
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="pt-24 px-4 max-w-7xl mx-auto">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 liquid-glass-nav safe-area-bottom z-50">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex flex-col items-center gap-1 p-2 rounded-xl transition-colors',
                                    isActive ? 'text-[#FDB813]' : 'text-zinc-500'
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
