import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input, Textarea, Modal, Badge, Spinner } from '../components/ui';
import { dbHelpers, db } from '../db/database';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Timer, Trophy } from 'lucide-react';
import { Icon } from '../components/ui/Icon';

export const SessionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [session, setSession] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formData, setFormData] = useState({
        exerciseName: '',
        sets: '',
        reps: '',
        weightKg: '',
        restSec: '',
        machinePhotoBlob: null
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const sessionData = await db.gymSessions.get(parseInt(id));
            const exercisesData = await dbHelpers.getExercisesBySession(parseInt(id));
            setSession(sessionData);
            setExercises(exercisesData);
        } catch (err) {
            error('Failed to load session');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            setFormData({ ...formData, machinePhotoBlob: blob });
            setPhotoPreview(URL.createObjectURL(blob));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = {
                sessionId: parseInt(id),
                exerciseName: formData.exerciseName,
                sets: parseInt(formData.sets),
                reps: parseInt(formData.reps),
                weightKg: parseFloat(formData.weightKg),
                restSec: formData.restSec ? parseInt(formData.restSec) : null,
                machinePhotoBlob: formData.machinePhotoBlob
            };

            if (editingId) {
                await dbHelpers.updateExercise(editingId, data);
                success('Exercise updated successfully');
            } else {
                await dbHelpers.addExercise(data);
                success('Exercise added successfully');

                // Check for PRs
                const isPR = await dbHelpers.checkAndAddPR(
                    data.exerciseName,
                    'max_weight',
                    data.weightKg
                );
                if (isPR) {
                    success(`New PR for ${data.exerciseName}!`, 'success');
                }
            }

            await loadData();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            error('Failed to save exercise');
            console.error(err);
        }
    };

    const handleEdit = (exercise) => {
        setEditingId(exercise.id);
        setFormData({
            exerciseName: exercise.exerciseName,
            sets: exercise.sets.toString(),
            reps: exercise.reps.toString(),
            weightKg: exercise.weightKg.toString(),
            restSec: exercise.restSec ? exercise.restSec.toString() : '',
            machinePhotoBlob: exercise.machinePhotoBlob
        });
        if (exercise.machinePhotoBlob) {
            setPhotoPreview(URL.createObjectURL(exercise.machinePhotoBlob));
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (exerciseId) => {
        if (!confirm('Are you sure you want to delete this exercise?')) return;

        try {
            await dbHelpers.deleteExercise(exerciseId);
            success('Exercise deleted successfully');
            await loadData();
        } catch (err) {
            error('Failed to delete exercise');
            console.error(err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            exerciseName: '',
            sets: '',
            reps: '',
            weightKg: '',
            restSec: '',
            machinePhotoBlob: null
        });
        setPhotoPreview(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <Card className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Session not found</p>
                    <Button onClick={() => navigate('/gym')}>Back to Gym</Button>
                </Card>
            </div>
        );
    }

    const totalVolume = exercises.reduce((sum, ex) => sum + (ex.volume || 0), 0);

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/gym')}>
                        ← Back
                    </Button>
                    <h1 className="text-3xl font-bold mt-2 capitalize">{session.workoutType} Workout</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {format(new Date(session.datetime), 'EEEE, MMMM d, yyyy - h:mm a')}
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    <Icon icon={Plus} size="sm" className="mr-1" />
                    Add Exercise
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="text-2xl font-bold">{session.durationMin} min</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Intensity</p>
                    <p className="text-2xl font-bold">{session.intensity}/10</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
                    <p className="text-2xl font-bold">{exercises.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                    <p className="text-2xl font-bold">{totalVolume.toFixed(0)} kg</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No exercises logged for this session</p>
                        <Button onClick={() => setIsModalOpen(true)}>Add your first exercise</Button>
                    </Card>
                ) : (
                    exercises.map((exercise) => (
                        <motion.div
                            key={exercise.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card>
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-bold">{exercise.exerciseName}</h3>
                                    <Badge variant="primary">{exercise.volume.toFixed(0)} kg</Badge>
                                </div>

                                {exercise.machinePhotoBlob && (
                                    <img
                                        src={URL.createObjectURL(exercise.machinePhotoBlob)}
                                        alt="Machine"
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}

                                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                    <div className="text-center p-2 bg-primary-50 dark:bg-primary-900/20 rounded">
                                        <p className="font-bold text-primary-700 dark:text-primary-400">{exercise.sets}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Sets</p>
                                    </div>
                                    <div className="text-center p-2 bg-success-50 dark:bg-success-900/20 rounded">
                                        <p className="font-bold text-success-700 dark:text-success-400">{exercise.reps}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Reps</p>
                                    </div>
                                    <div className="text-center p-2 bg-warning-50 dark:bg-warning-900/20 rounded">
                                        <p className="font-bold text-warning-700 dark:text-warning-400">{exercise.weightKg}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">kg</p>
                                    </div>
                                </div>

                                {exercise.restSec && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                        <Icon icon={Timer} size="sm" className="text-gray-500" />
                                        Rest: {exercise.restSec}s
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEdit(exercise)}
                                        className="flex-1 flex items-center justify-center gap-1"
                                    >
                                        <Icon icon={Pencil} size="sm" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(exercise.id)}
                                        className="flex-1 flex items-center justify-center gap-1"
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingId ? 'Edit Exercise' : 'Add Exercise'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Exercise Name"
                        value={formData.exerciseName}
                        onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
                        placeholder="e.g., Bench Press, Squats"
                        required
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Sets"
                            type="number"
                            value={formData.sets}
                            onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                            required
                        />

                        <Input
                            label="Reps"
                            type="number"
                            value={formData.reps}
                            onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                            required
                        />

                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.5"
                            value={formData.weightKg}
                            onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Rest Between Sets (seconds) - Optional"
                        type="number"
                        value={formData.restSec}
                        onChange={(e) => setFormData({ ...formData, restSec: e.target.value })}
                    />

                    <div>
                        <label className="label">Machine Photo - Optional</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="input"
                        />
                        {photoPreview && (
                            <img src={photoPreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                        )}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingId ? 'Update' : 'Add'} Exercise
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
