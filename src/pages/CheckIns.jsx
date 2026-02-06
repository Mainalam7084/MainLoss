import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input, Textarea, Modal, Badge, Spinner } from '../components/ui';
import { dbHelpers } from '../db/database';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CheckIns = () => {
    const { checkIns, refreshCheckIns, loading } = useData();
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        heightCm: '',
        weightKg: '',
        waistCm: '',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = {
                date: formData.date,
                heightCm: parseFloat(formData.heightCm),
                weightKg: parseFloat(formData.weightKg),
                waistCm: formData.waistCm ? parseFloat(formData.waistCm) : null,
                notes: formData.notes
            };

            if (editingId) {
                await dbHelpers.updateCheckIn(editingId, data);
                success('Check-in updated successfully');
            } else {
                await dbHelpers.addCheckIn(data);
                success('Check-in added successfully');
            }

            await refreshCheckIns();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            error('Failed to save check-in');
            console.error(err);
        }
    };

    const handleEdit = (checkIn) => {
        setEditingId(checkIn.id);
        setFormData({
            date: checkIn.date,
            heightCm: checkIn.heightCm.toString(),
            weightKg: checkIn.weightKg.toString(),
            waistCm: checkIn.waistCm ? checkIn.waistCm.toString() : '',
            notes: checkIn.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this check-in?')) return;

        try {
            await dbHelpers.deleteCheckIn(id);
            success('Check-in deleted successfully');
            await refreshCheckIns();
        } catch (err) {
            error('Failed to delete check-in');
            console.error(err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            heightCm: '',
            weightKg: '',
            waistCm: '',
            notes: ''
        });
    };

    const chartData = checkIns.slice().reverse().map(checkIn => ({
        date: format(new Date(checkIn.date), 'MMM d'),
        weight: checkIn.weightKg,
        bmi: parseFloat(checkIn.bmi)
    }));

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
                <h1 className="text-3xl font-bold">Monthly Check-ins</h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    + Add Check-in
                </Button>
            </div>

            {checkIns.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold mb-4">Weight Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                dot={{ fill: '#0ea5e9', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checkIns.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No check-ins yet</p>
                        <Button onClick={() => setIsModalOpen(true)}>Add your first check-in</Button>
                    </Card>
                ) : (
                    checkIns.map((checkIn) => (
                        <motion.div
                            key={checkIn.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {format(new Date(checkIn.date), 'MMM d, yyyy')}
                                        </p>
                                        <p className="text-2xl font-bold mt-1">{checkIn.weightKg} kg</p>
                                    </div>
                                    <Badge variant={
                                        checkIn.bmiCategory === 'Normal' ? 'success' :
                                            checkIn.bmiCategory === 'Overweight' ? 'warning' : 'danger'
                                    }>
                                        {checkIn.bmiCategory}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Height:</span>
                                        <span className="font-medium">{checkIn.heightCm} cm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">BMI:</span>
                                        <span className="font-medium">{checkIn.bmi}</span>
                                    </div>
                                    {checkIn.waistCm && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Waist:</span>
                                            <span className="font-medium">{checkIn.waistCm} cm</span>
                                        </div>
                                    )}
                                    {checkIn.notes && (
                                        <p className="text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t">
                                            {checkIn.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEdit(checkIn)}
                                        className="flex-1"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(checkIn.id)}
                                        className="flex-1"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingId ? 'Edit Check-in' : 'Add Check-in'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Height (cm)"
                            type="number"
                            step="0.1"
                            value={formData.heightCm}
                            onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                            required
                        />

                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.1"
                            value={formData.weightKg}
                            onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Waist (cm) - Optional"
                        type="number"
                        step="0.1"
                        value={formData.waistCm}
                        onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
                    />

                    <Textarea
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any observations or notes..."
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
                            {editingId ? 'Update' : 'Add'} Check-in
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
