import { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input, Select, Modal, Badge, Spinner } from '../components/ui';
import { dbHelpers } from '../db/database';
import { format } from 'date-fns';

export const Goals = () => {
    const { goals, refreshGoals, loading } = useData();
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: '',
        targetValue: '',
        currentValue: '',
        deadline: '',
        status: 'active'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = {
                type: formData.type,
                targetValue: parseFloat(formData.targetValue),
                currentValue: parseFloat(formData.currentValue),
                deadline: formData.deadline ? new Date(formData.deadline) : null,
                status: formData.status
            };

            if (editingId) {
                await dbHelpers.updateGoal(editingId, data);
                success('Goal updated successfully');
            } else {
                await dbHelpers.addGoal(data);
                success('Goal added successfully');
            }

            await refreshGoals();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            error('Failed to save goal');
            console.error(err);
        }
    };

    const handleEdit = (goal) => {
        setEditingId(goal.id);
        setFormData({
            type: goal.type,
            targetValue: goal.targetValue.toString(),
            currentValue: goal.currentValue.toString(),
            deadline: goal.deadline ? format(new Date(goal.deadline), 'yyyy-MM-dd') : '',
            status: goal.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            await dbHelpers.deleteGoal(id);
            success('Goal deleted successfully');
            await refreshGoals();
        } catch (err) {
            error('Failed to delete goal');
            console.error(err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            type: '',
            targetValue: '',
            currentValue: '',
            deadline: '',
            status: 'active'
        });
    };

    const getProgress = (goal) => {
        return goal.targetValue > 0
            ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
            : 0;
    };

    const getStatus = (goal) => {
        const progress = getProgress(goal);
        if (progress >= 100) return { text: 'Completed', variant: 'success' };
        if (progress >= 70) return { text: 'On Track', variant: 'primary' };
        if (progress >= 40) return { text: 'Behind', variant: 'warning' };
        return { text: 'At Risk', variant: 'danger' };
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
                <h1 className="text-3xl font-bold">Goals & Plan</h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    + Add Goal
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No goals set yet</p>
                        <Button onClick={() => setIsModalOpen(true)}>Set your first goal</Button>
                    </Card>
                ) : (
                    goals.map((goal) => {
                        const progress = getProgress(goal);
                        const status = getStatus(goal);

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold">{goal.type}</h3>
                                            {goal.deadline && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={status.variant}>{status.text}</Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                                <span className="font-medium">{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    className={`h-3 rounded-full ${progress >= 100 ? 'bg-success-600' :
                                                            progress >= 70 ? 'bg-primary-600' :
                                                                progress >= 40 ? 'bg-warning-600' : 'bg-danger-600'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">Current</p>
                                                <p className="font-bold text-lg">{goal.currentValue}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-600 dark:text-gray-400">Target</p>
                                                <p className="font-bold text-lg">{goal.targetValue}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEdit(goal)}
                                            className="flex-1"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(goal.id)}
                                            className="flex-1"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingId ? 'Edit Goal' : 'Add Goal'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Goal Type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="e.g., Target Weight, Weekly Gym Sessions, Daily Protein"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Current Value"
                            type="number"
                            step="0.1"
                            value={formData.currentValue}
                            onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                            required
                        />

                        <Input
                            label="Target Value"
                            type="number"
                            step="0.1"
                            value={formData.targetValue}
                            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Deadline (Optional)"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />

                    <Select
                        label="Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                    >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                    </Select>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingId ? 'Update' : 'Add'} Goal
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
