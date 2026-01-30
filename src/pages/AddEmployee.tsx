import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { saveEmployeeData, fetchEmployees, isAuthenticated } from '../lib/storage';
import { Button, Input, Select } from '../components/Ui';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../lib/imageUtils';
import { Camera, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper: Convert HH:MM:SS to total seconds
const timeToSeconds = (timeStr: string): number => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
};

import { DEFAULT_AVATAR } from '../lib/constants';

export const AddEmployee = () => {
    const [formData, setFormData] = useState({
        name: '',
        team: '',
        avatar: DEFAULT_AVATAR,
        month: new Date().toISOString().slice(0, 7),
        weekStartDate: '',
        weekEndDate: '',
        kpi: '',
        chats: '',
        responseTime: '',
        activities: '',
        mode: 'week' as 'week' | 'day',
        dayDate: new Date().toISOString().slice(0, 10)
    });

    // Image Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('editId');
    const dataLoadedRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            toast.error('Доступ только для администраторов');
            navigate('/manage');
            return;
        }

        const loadEmployee = async () => {
            if (editId && !dataLoadedRef.current) {
                dataLoadedRef.current = true;
                const employees = await fetchEmployees();
                const emp = employees.find(e => e.id === editId);
                if (emp) {
                    // Find the most recent entry (week or day)
                    let latestStats: any = null;
                    let latestMode: 'week' | 'day' = 'week';
                    let latestMonth = '';
                    let latestWeekStart = '';
                    let latestWeekEnd = '';
                    let latestDayDate = '';

                    // Check weeks
                    if (emp.weeks) {
                        const months = Object.keys(emp.weeks).sort().reverse();
                        for (const month of months) {
                            const weeks = Object.keys(emp.weeks[month]).sort().reverse();
                            if (weeks.length > 0) {
                                latestStats = emp.weeks[month][weeks[0]];
                                latestMode = 'week';
                                latestMonth = month;
                                latestWeekStart = weeks[0];
                                latestWeekEnd = latestStats.endDate || weeks[0];
                                break;
                            }
                        }
                    }

                    // Check days (compare with weeks to get the most recent)
                    if (emp.days) {
                        const days = Object.keys(emp.days).sort().reverse();
                        if (days.length > 0) {
                            const latestDay = days[0];
                            // If no week data or day is more recent
                            if (!latestStats || latestDay > latestWeekStart) {
                                latestStats = emp.days[latestDay];
                                latestMode = 'day';
                                latestDayDate = latestDay;
                                latestMonth = latestDay.slice(0, 7);
                            }
                        }
                    }

                    // Helper to convert seconds to H:MM:SS
                    const secondsToTimeStr = (secs: number): string => {
                        const h = Math.floor(secs / 3600);
                        const m = Math.floor((secs % 3600) / 60);
                        const s = Math.floor(secs % 60);
                        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    };

                    setFormData(prev => ({
                        ...prev,
                        name: emp.name,
                        team: emp.team,
                        avatar: emp.avatar,
                        mode: latestMode,
                        month: latestMonth || prev.month,
                        weekStartDate: latestWeekStart || prev.weekStartDate,
                        weekEndDate: latestWeekEnd || prev.weekEndDate,
                        dayDate: latestDayDate || prev.dayDate,
                        kpi: latestStats?.kpi?.toString() || '',
                        chats: latestStats?.chats?.toString() || '',
                        responseTime: latestStats?.responseTime ? secondsToTimeStr(latestStats.responseTime) : '',
                        activities: latestStats?.activities?.join('\n') || ''
                    }));
                    toast('Данные загружены для редактирования', { icon: '✏️' });
                }
            }
        };
        loadEmployee();
    }, [editId, navigate]);

    // Image handlers
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl as string);
            setIsCropping(true);
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const handleCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const saveCroppedImage = async () => {
        try {
            if (imageSrc && croppedAreaPixels) {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                setFormData(prev => ({ ...prev, avatar: croppedImage }));
                setIsCropping(false);
                setImageSrc(null);
                toast.success('Фото обновлено!');
            }
        } catch (e) {
            console.error(e);
            toast.error('Ошибка при обработке фото');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.team) {
            toast.error('ФИО и Команда обязательны');
            return;
        }

        if (formData.mode === 'week' && (!formData.weekStartDate || !formData.weekEndDate)) {
            toast.error('Выберите даты начала и конца недели');
            return;
        }

        if (formData.mode === 'day' && !formData.dayDate) {
            toast.error('Выберите дату');
            return;
        }

        try {
            await saveEmployeeData(
                editId || null,
                formData.name,
                formData.team as any,
                formData.avatar,
                formData.month,
                formData.mode === 'day' ? formData.dayDate : formData.weekStartDate,
                formData.mode === 'day' ? formData.dayDate : formData.weekEndDate,
                {
                    kpi: parseFloat(formData.kpi) || 0,
                    chats: parseInt(formData.chats) || 0,
                    responseTime: timeToSeconds(formData.responseTime),
                    activities: formData.activities.split('\n').filter(s => s.trim()),
                    startDate: formData.mode === 'day' ? formData.dayDate : formData.weekStartDate,
                    endDate: formData.mode === 'day' ? formData.dayDate : formData.weekEndDate
                },
                formData.mode
            );

            toast.success('Данные успешно сохранены!');

            if (editId) {
                navigate('/manage');
            } else {
                setFormData(prev => ({
                    ...prev,
                    kpi: '',
                    chats: '',
                    responseTime: '',
                    activities: ''
                }));
            }
        } catch (err) {
            toast.error('Ошибка сохранения в базу данных.');
            console.error(err);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="glass-panel p-8 rounded-2xl relative">
                <h2 className="text-2xl font-bold mb-6 gradient-text">
                    {editId ? 'Редактирование сотрудника' : 'Ввод статистики'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Identity Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">ФИО Сотрудника</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Иванов Иван"
                                readOnly={!!editId}
                                className={editId ? 'opacity-80' : ''}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Команда</label>
                            <Select name="team" value={formData.team} onChange={handleInputChange}>
                                <option value="">Выберите...</option>
                                <option value="Команда 1">Команда 1</option>
                                <option value="Команда 2">Команда 2</option>
                            </Select>
                        </div>
                    </div>

                    {/* Time Period Section */}
                    <div className="p-4 bg-taxi-surface/50 rounded-xl border border-taxi-border space-y-4">
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, mode: 'week' }))}
                                className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.mode === 'week' ? 'bg-taxi-yellow text-black shadow-lg shadow-taxi-yellow/20' : 'bg-black/40 text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Недельный отчет
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, mode: 'day' }))}
                                className={`flex-1 py-2 rounded-lg font-bold transition-all ${formData.mode === 'day' ? 'bg-taxi-yellow text-black shadow-lg shadow-taxi-yellow/20' : 'bg-black/40 text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Ежедневный отчет
                            </button>
                        </div>

                        <div className="relative min-h-[120px]">
                            <AnimatePresence mode="wait">
                                {formData.mode === 'week' ? (
                                    <motion.div
                                        key="week"
                                        initial={{ opacity: 0, x: -20, position: 'absolute' }}
                                        animate={{ opacity: 1, x: 0, position: 'relative' }}
                                        exit={{ opacity: 0, x: 20, position: 'absolute' }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-2">Отчетный Месяц</label>
                                            <Input
                                                type="month"
                                                name="month"
                                                value={formData.month}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-2">Начало недели</label>
                                            <Input
                                                type="date"
                                                name="weekStartDate"
                                                value={formData.weekStartDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-2">Конец недели</label>
                                            <Input
                                                type="date"
                                                name="weekEndDate"
                                                value={formData.weekEndDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="day"
                                        initial={{ opacity: 0, x: 20, position: 'absolute' }}
                                        animate={{ opacity: 1, x: 0, position: 'relative' }}
                                        exit={{ opacity: 0, x: -20, position: 'absolute' }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-400 mb-2">Дата отчета</label>
                                            <Input
                                                type="date"
                                                name="dayDate"
                                                value={formData.dayDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-zinc-300 mb-4">Показатели за период</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">KPI (%)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    name="kpi"
                                    value={formData.kpi}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">Кол-во чатов</label>
                                <Input
                                    type="number"
                                    name="chats"
                                    value={formData.chats}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">Время ответа</label>
                                <Input
                                    type="text"
                                    placeholder="1:37:47 или 97:47"
                                    name="responseTime"
                                    value={formData.responseTime}
                                    onChange={handleInputChange}
                                />
                                <span className="text-[10px] text-zinc-600 mt-1">Формат: Ч:ММ:СС или ММ:СС</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase font-bold text-zinc-500 mb-1">Активность (по строке на идею)</label>
                            <textarea
                                className="w-full bg-taxi-surface/50 border border-taxi-border rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-taxi-yellow/50 transition-all min-h-[100px]"
                                placeholder="• Предложил идею..."
                                name="activities"
                                value={formData.activities}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Аватар</label>
                            <div className="flex gap-4 items-center">
                                <div className="relative group cursor-pointer w-20 h-20 rounded-full overflow-hidden border-2 border-taxi-border bg-taxi-surface"
                                    onClick={() => fileInputRef.current?.click()}>
                                    <img
                                        src={formData.avatar || "about:blank"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 48 48'%3E%3Crect fill='%23334155' width='48' height='48'/%3E%3C/svg%3E";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={onFileChange}
                                    className="hidden"
                                />
                                <div className="flex-1">
                                    <Input
                                        name="avatar"
                                        value={formData.avatar}
                                        onChange={handleInputChange}
                                        placeholder="Ссылка на фото (или загрузите файл)"
                                        className="text-sm"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Нажмите на круг, чтобы загрузить с устройства.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full py-4 text-lg">
                        {editId ? 'Обновить данные' : 'Сохранить данные'}
                    </Button>
                </form>

                {/* Crop Modal */}
                {isCropping && imageSrc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-taxi-dark w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-taxi-border">
                            <div className="p-4 border-b border-taxi-border flex justify-between items-center">
                                <h3 className="text-white font-bold">Редактирование фото</h3>
                                <button onClick={() => setIsCropping(false)} className="text-zinc-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="relative h-64 w-full bg-black">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={handleCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                />
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">Масштаб</label>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full h-1 bg-taxi-border rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="secondary" onClick={() => setIsCropping(false)} className="flex-1">
                                        Отмена
                                    </Button>
                                    <Button onClick={saveCroppedImage} className="flex-1">
                                        <Check className="w-4 h-4 mr-2" />
                                        Сохранить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
