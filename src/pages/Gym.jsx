import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input, Select, Textarea, Modal, Badge, Spinner } from '../components/ui';
import { dbHelpers } from '../db/database';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Dumbbell, HeartPulse, Flame, Activity, Plus, Pencil, Trash2 } from 'lucide-react';
import { Icon } from '../components/ui/Icon';

export const Gym = () => {
    const { gymSessions, refreshGymSessions, loading } = useData();
    const { success, error } = useToast();
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [formData, setFormData] = useState({
        datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        workoutType: 'strength',
        durationMin: '',
        cardioType: '',
        cardioMin: '',
        intensity: '5',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = {
                datetime: new Date(formData.datetime),
                workoutType: formData.workoutType,
                durationMin: parseInt(formData.durationMin),
                cardioType: formData.cardioType || null,
                cardioMin: formData.cardioMin ? parseInt(formData.cardioMin) : null,
                intensity: parseInt(formData.intensity),
                notes: formData.notes
            };

            if (editingId) {
                await dbHelpers.updateGymSession(editingId, data);
                success('Workout updated successfully');
            } else {
                await dbHelpers.addGymSession(data);
                success('Workout added successfully');
            }

            await refreshGymSessions();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            error('Failed to save workout');
            console.error(err);
        }
    };

    const handleEdit = (session) => {
        setEditingId(session.id);
        setFormData({
            datetime: format(new Date(session.datetime), "yyyy-MM-dd'T'HH:mm"),
            workoutType: session.workoutType,
            durationMin: session.durationMin.toString(),
            cardioType: session.cardioType || '',
            cardioMin: session.cardioMin ? session.cardioMin.toString() : '',
            intensity: session.intensity.toString(),
            notes: session.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this workout? This will also delete all associated exercises.')) return;

        try {
            await dbHelpers.deleteGymSession(id);
            success('Workout deleted successfully');
            await refreshGymSessions();
        } catch (err) {
            error('Failed to delete workout');
            console.error(err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            workoutType: 'strength',
            durationMin: '',
            cardioType: '',
            cardioMin: '',
            intensity: '5',
            notes: ''
        });
    };

    const workoutTypeIcons = {
        strength: Dumbbell,
        cardio: HeartPulse,
        mixed: Flame,
        flexibility: Activity
    };

    const getSessionsForDay = (date) => {
        return gymSessions.filter(session =>
            isSameDay(new Date(session.datetime), date)
        );
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        return (
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

                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 p-2">
                            {day}
                        </div>
                    ))}

                    {days.map(day => {
                        const sessions = getSessionsForDay(day);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[80px] p-2 border rounded-lg ${isToday ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        className="text-xs bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 rounded px-1 py-0.5 mb-1 cursor-pointer flex items-center gap-1"
                                        onClick={() => handleEdit(session)}
                                    >
                                        <Icon icon={workoutTypeIcons[session.workoutType]} size="sm" />
                                        {session.durationMin}m
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gym Sessions</h1>
                <div className="flex gap-2">
                    <Button
                        variant={view === 'list' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setView('list')}
                    >
                        List
                    </Button>
                    <Button
                        variant={view === 'calendar' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setView('calendar')}
                    >
                        Calendar
                    </Button>
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        <Icon icon={Plus} size="sm" className="mr-1" />
                        Add Workout
                    </Button>
                </div>
            </div>

            {view === 'calendar' ? (
                renderCalendar()
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gymSessions.length === 0 ? (
                        <Card className="col-span-full text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">No workouts logged yet</p>
                            <Button onClick={() => setIsModalOpen(true)}>Add your first workout</Button>
                        </Card>
                    ) : (
                        gymSessions.map((session) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Icon icon={workoutTypeIcons[session.workoutType]} size="md" className="text-emerald-600 dark:text-emerald-400" />
                                                <div>
                                                    <p className="font-semibold capitalize">{session.workoutType}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {format(new Date(session.datetime), 'MMM d, h:mm a')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="primary">{session.durationMin} min</Badge>
                                    </div>

                                    <div className="space-y-2 text-sm mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Intensity:</span>
                                            <span className="font-medium">{session.intensity}/10</span>
                                        </div>
                                        {session.cardioType && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Cardio:</span>
                                                    <span className="font-medium capitalize">{session.cardioType}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Cardio Duration:</span>
                                                    <span className="font-medium">{session.cardioMin} min</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {session.notes && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 border-t pt-2">
                                            {session.notes}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <Link to={`/gym/${session.id}`} className="flex-1">
                                            <Button variant="success" size="sm" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEdit(session)}
                                            className="flex items-center justify-center gap-1"
                                        >
                                            <Icon icon={Pencil} size="sm" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(session.id)}
                                            className="flex items-center justify-center gap-1"
                                        >
                                            <Icon icon={Trash2} size="sm" />
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingId ? 'Edit Workout' : 'Add Workout'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Date & Time"
                        type="datetime-local"
                        value={formData.datetime}
                        onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Workout Type"
                            value={formData.workoutType}
                            onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
                            required
                        >
                            <option value="strength">Strength</option>
                            <option value="cardio">Cardio</option>
                            <option value="mixed">Mixed</option>
                            <option value="flexibility">Flexibility</option>
                        </Select>

                        <Input
                            label="Duration (min)"
                            type="number"
                            value={formData.durationMin}
                            onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Cardio Type (Optional)"
                            value={formData.cardioType}
                            onChange={(e) => setFormData({ ...formData, cardioType: e.target.value })}
                        >
                            <option value="">None</option>
                            <option value="running">Running</option>
                            <option value="cycling">Cycling</option>
                            <option value="rowing">Rowing</option>
                            <option value="elliptical">Elliptical</option>
                            <option value="swimming">Swimming</option>
                        </Select>

                        <Input
                            label="Cardio Duration (min)"
                            type="number"
                            value={formData.cardioMin}
                            onChange={(e) => setFormData({ ...formData, cardioMin: e.target.value })}
                            disabled={!formData.cardioType}
                        />
                    </div>

                    <div>
                        <label className="label">Intensity (1-10)</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={formData.intensity}
                            onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>1 (Easy)</span>
                            <span className="font-bold text-primary-600">{formData.intensity}</span>
                            <span>10 (Max)</span>
                        </div>
                    </div>

                    <Textarea
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="How did the workout feel? Any achievements?"
                    />

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingId ? 'Update' : 'Add'} Workout
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
