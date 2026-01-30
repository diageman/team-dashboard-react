import { useState, useEffect } from 'react';
import { getEmployees, isAuthenticated, login, logout, deleteEmployee } from '../lib/storage';
import { Employee } from '../types';
import { Button, Input } from '../components/Ui';
import { Trash2, Edit, LogIn, LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Manage = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setIsAdmin(isAuthenticated());
        setEmployees(getEmployees());
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            setIsAdmin(true);
            toast.success('Вы вошли как администратор');
            setPassword('');
        } else {
            toast.error('Неверный код доступа');
        }
    };

    const handleLogout = () => {
        logout();
        setIsAdmin(false);
        toast.success('Сессия завершена');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Вы уверены? Это действие нельзя отменить.')) {
            setEmployees(deleteEmployee(id));
            toast.success('Сотрудник удален');
        }
    };

    const handleEdit = (id: string) => {
        navigate(`/add?editId=${id}`);
    };

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.team.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAdmin) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 glass-panel rounded-2xl text-center">
                <ShieldAlert className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Доступ ограничен</h2>
                <p className="text-zinc-400 mb-6">Введите код администратора для управления сотрудниками.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Код доступа"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-center tracking-widest"
                    />
                    <Button type="submit" className="w-full">
                        <LogIn className="w-4 h-4" /> Войти
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Управление сотрудниками</h2>
                <Button variant="ghost" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
                    Выйти
                </Button>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Поиск по имени или команде..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface text-zinc-400 font-medium">
                            <tr>
                                <th className="p-4">Сотрудник</th>
                                <th className="p-4">Команда</th>
                                <th className="p-4">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        <span className="font-semibold">{emp.name}</span>
                                    </td>
                                    <td className="p-4 text-zinc-300">{emp.team}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                className="px-3 py-1.5 text-xs"
                                                onClick={() => handleEdit(emp.id)}
                                            >
                                                <Edit className="w-3 h-3 mr-1" /> Изменить
                                            </Button>
                                            <Button
                                                variant="danger"
                                                className="px-3 py-1.5 text-xs"
                                                onClick={() => handleDelete(emp.id)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" /> Удалить
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-zinc-500">
                                        Сотрудники не найдены
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
