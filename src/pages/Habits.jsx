import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input, Badge } from '../components/ui';
import { dbHelpers, db } from '../db/database';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Droplet, Footprints, Pill, Activity, Moon } from 'lucide-react';
import { Icon } from '../components/ui/Icon';

export const Habits = () => {
    const { refreshHabits } = useData();
    const { success, error } = useToast();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [todayHabit, setTodayHabit] = useState(null);
    const [monthHabits, setMonthHabits] = useState([]);
    const [formData, setFormData] = useState({
        waterMl: '',
        steps: '',
        creatine: false,
        stretching: false,
        sleepHours: ''
    });

    useEffect(() => {
        loadData();
    }, [currentMonth]);

    const loadData = async () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayData = await dbHelpers.getHabitByDate(today);
        setTodayHabit(todayData);

        if (todayData) {
            setFormData({
                waterMl: todayData.waterMl?.toString() || '',
                steps: todayData.steps?.toString() || '',
                creatine: todayData.creatine || false,
                stretching: todayData.stretching || false,
                sleepHours: todayData.sleepHours?.toString() || ''
            });
        }

        // Load month habits
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const habits = await db.habits
            .where('date')
            .between(format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd'))
            .toArray();
        setMonthHabits(habits);
    };

    const handleSave = async () => {
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const data = {
                date: today,
                waterMl: formData.waterMl ? parseInt(formData.waterMl) : null,
                steps: formData.steps ? parseInt(formData.steps) : null,
                creatine: formData.creatine,
                stretching: formData.stretching,
                sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null
            };

            if (todayHabit) {
                await dbHelpers.updateHabit(todayHabit.id, data);
                success('Habits updated successfully');
            } else {
                await dbHelpers.addHabit(data);
                success('Habits saved successfully');
            }

            await loadData();
            await refreshHabits();
        } catch (err) {
            error('Failed to save habits');
            console.error(err);
        }
    };

    const getHabitForDay = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return monthHabits.find(h => h.date === dateStr);
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return (
            <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 p-2">
                        {day}
                    </div>
                ))}

                {days.map(day => {
                    const habit = getHabitForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isFuture = day > new Date();

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[80px] p-2 border rounded-lg ${isToday ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' :
                                isFuture ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900' :
                                    'border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
                            {habit && !isFuture && (
                                <div className="space-y-1">
                                    <Badge
                                        variant={
                                            habit.score >= 80 ? 'success' :
                                                habit.score >= 60 ? 'primary' :
                                                    habit.score >= 40 ? 'warning' : 'danger'
                                        }
                                        className="text-xs"
                                    >
                                        {habit.score}%
                                    </Badge>
                                    <div className="text-xs space-y-0.5">
                                        {habit.waterMl && <div className="flex items-center gap-1"><Icon icon={Droplet} size="sm" className="text-blue-500" /> {habit.waterMl}ml</div>}
                                        {habit.steps && <div className="flex items-center gap-1"><Icon icon={Footprints} size="sm" className="text-gray-600" /> {habit.steps}</div>}
                                        {habit.creatine && <div className="flex items-center gap-1"><Icon icon={Pill} size="sm" className="text-purple-500" /></div>}
                                        {habit.stretching && <div className="flex items-center gap-1"><Icon icon={Activity} size="sm" className="text-green-500" /></div>}
                                        {habit.sleepHours && <div className="flex items-center gap-1"><Icon icon={Moon} size="sm" className="text-indigo-500" /> {habit.sleepHours}h</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const score = todayHabit ? todayHabit.score : 0;

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Habit Tracker</h1>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Today's Habits</h2>
                    <Badge
                        variant={
                            score >= 80 ? 'success' :
                                score >= 60 ? 'primary' :
                                    score >= 40 ? 'warning' : 'danger'
                        }
                        className="text-lg px-4 py-2"
                    >
                        {score}% Complete
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Water (ml)"
                        type="number"
                        value={formData.waterMl}
                        onChange={(e) => setFormData({ ...formData, waterMl: e.target.value })}
                        placeholder="Target: 2000ml"
                    />

                    <Input
                        label="Steps"
                        type="number"
                        value={formData.steps}
                        onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                        placeholder="Target: 8000 steps"
                    />

                    <Input
                        label="Sleep Hours"
                        type="number"
                        step="0.5"
                        value={formData.sleepHours}
                        onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                        placeholder="Target: 7+ hours"
                    />

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.creatine}
                                onChange={(e) => setFormData({ ...formData, creatine: e.target.checked })}
                                className="w-5 h-5"
                            />
                            <span className="flex-1 flex items-center gap-2">
                                <Icon icon={Pill} size="sm" className="text-purple-500" />
                                Creatine
                            </span>
                        </label>

                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.stretching}
                                onChange={(e) => setFormData({ ...formData, stretching: e.target.checked })}
                                className="w-5 h-5"
                            />
                            <span className="flex-1 flex items-center gap-2">
                                <Icon icon={Activity} size="sm" className="text-green-500" />
                                Stretching
                            </span>
                        </label>
                    </div>
                </div>

                <Button onClick={handleSave} className="mt-4 w-full">
                    Save Today's Habits
                </Button>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                        >
                            ←
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentMonth(new Date())}
                        >
                            Today
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                        >
                            →
                        </Button>
                    </div>
                </div>

                {renderCalendar()}
            </Card>
        </div>
    );
};
