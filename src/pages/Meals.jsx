import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input, Select, Textarea, Modal, Badge, Spinner } from '../components/ui';
import { dbHelpers } from '../db/database';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Sunrise, Sandwich, UtensilsCrossed, Apple, Droplet, Plus, Pencil, Trash2 } from 'lucide-react';
import { Icon } from '../components/ui/Icon';

export const Meals = () => {
    const { refreshMeals, loading } = useData();
    const { success, error } = useToast();
    const [meals, setMeals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formData, setFormData] = useState({
        datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        mealType: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        waterMl: '',
        notes: '',
        photoBlob: null
    });

    useEffect(() => {
        loadMeals();
    }, [selectedDate]);

    const loadMeals = async () => {
        const date = new Date(selectedDate);
        const meals = await dbHelpers.getMeals(startOfDay(date), endOfDay(date));
        setMeals(meals);

        const totals = await dbHelpers.getDailyTotals(date);
        setDailyTotals(totals);
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            setFormData({ ...formData, photoBlob: blob });
            setPhotoPreview(URL.createObjectURL(blob));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = {
                datetime: new Date(formData.datetime),
                mealType: formData.mealType,
                calories: parseFloat(formData.calories) || 0,
                protein: parseFloat(formData.protein) || 0,
                carbs: parseFloat(formData.carbs) || 0,
                fat: parseFloat(formData.fat) || 0,
                waterMl: formData.waterMl ? parseFloat(formData.waterMl) : null,
                notes: formData.notes,
                photoBlob: formData.photoBlob
            };

            if (editingId) {
                await dbHelpers.updateMeal(editingId, data);
                success('Meal updated successfully');
            } else {
                await dbHelpers.addMeal(data);
                success('Meal added successfully');
            }

            await loadMeals();
            await refreshMeals();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            error('Failed to save meal');
            console.error(err);
        }
    };

    const handleEdit = (meal) => {
        setEditingId(meal.id);
        setFormData({
            datetime: format(new Date(meal.datetime), "yyyy-MM-dd'T'HH:mm"),
            mealType: meal.mealType,
            calories: meal.calories.toString(),
            protein: meal.protein.toString(),
            carbs: meal.carbs.toString(),
            fat: meal.fat.toString(),
            waterMl: meal.waterMl ? meal.waterMl.toString() : '',
            notes: meal.notes || '',
            photoBlob: meal.photoBlob
        });
        if (meal.photoBlob) {
            setPhotoPreview(URL.createObjectURL(meal.photoBlob));
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this meal?')) return;

        try {
            await dbHelpers.deleteMeal(id);
            success('Meal deleted successfully');
            await loadMeals();
            await refreshMeals();
        } catch (err) {
            error('Failed to delete meal');
            console.error(err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            mealType: 'breakfast',
            calories: '',
            protein: '',
            carbs: '',
            fat: '',
            waterMl: '',
            notes: '',
            photoBlob: null
        });
        setPhotoPreview(null);
    };

    const mealTypeIcons = {
        breakfast: Sunrise,
        lunch: Sandwich,
        dinner: UtensilsCrossed,
        snack: Apple
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
                <h1 className="text-3xl font-bold">Meals & Nutrition</h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    <Icon icon={Plus} size="sm" className="mr-1" />
                    Add Meal
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <Card>
                <h2 className="text-xl font-bold mb-4">Daily Totals - {format(new Date(selectedDate), 'MMM d, yyyy')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{dailyTotals.calories}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-success-600">{dailyTotals.protein}g</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-warning-600">{dailyTotals.carbs}g</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-danger-600">{dailyTotals.fat}g</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{dailyTotals.water}ml</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Water</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meals.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No meals logged for this day</p>
                        <Button onClick={() => setIsModalOpen(true)}>Add your first meal</Button>
                    </Card>
                ) : (
                    meals.map((meal) => (
                        <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Icon icon={mealTypeIcons[meal.mealType]} size="md" className="text-emerald-600 dark:text-emerald-400" />
                                            <div>
                                                <p className="font-semibold capitalize">{meal.mealType}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {format(new Date(meal.datetime), 'h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="primary">{meal.calories} kcal</Badge>
                                </div>

                                {meal.photoBlob && (
                                    <img
                                        src={URL.createObjectURL(meal.photoBlob)}
                                        alt="Meal"
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}

                                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                    <div className="text-center p-2 bg-success-50 dark:bg-success-900/20 rounded">
                                        <p className="font-bold text-success-700 dark:text-success-400">{meal.protein}g</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                                    </div>
                                    <div className="text-center p-2 bg-warning-50 dark:bg-warning-900/20 rounded">
                                        <p className="font-bold text-warning-700 dark:text-warning-400">{meal.carbs}g</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                                    </div>
                                    <div className="text-center p-2 bg-danger-50 dark:bg-danger-900/20 rounded">
                                        <p className="font-bold text-danger-700 dark:text-danger-400">{meal.fat}g</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
                                    </div>
                                </div>

                                {meal.waterMl && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                        <Icon icon={Droplet} size="sm" className="text-blue-500" />
                                        {meal.waterMl}ml water
                                    </p>
                                )}

                                {meal.notes && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 border-t pt-2">
                                        {meal.notes}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEdit(meal)}
                                        className="flex-1 flex items-center justify-center gap-1"
                                    >
                                        <Icon icon={Pencil} size="sm" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(meal.id)}
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
                title={editingId ? 'Edit Meal' : 'Add Meal'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Date & Time"
                            type="datetime-local"
                            value={formData.datetime}
                            onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                            required
                        />

                        <Select
                            label="Meal Type"
                            value={formData.mealType}
                            onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                            required
                        >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Calories"
                            type="number"
                            step="1"
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                            required
                        />

                        <Input
                            label="Protein (g)"
                            type="number"
                            step="0.1"
                            value={formData.protein}
                            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Carbs (g)"
                            type="number"
                            step="0.1"
                            value={formData.carbs}
                            onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                            required
                        />

                        <Input
                            label="Fat (g)"
                            type="number"
                            step="0.1"
                            value={formData.fat}
                            onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Water (ml) - Optional"
                        type="number"
                        step="1"
                        value={formData.waterMl}
                        onChange={(e) => setFormData({ ...formData, waterMl: e.target.value })}
                    />

                    <div>
                        <label className="label">Meal Photo - Optional</label>
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

                    <Textarea
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Meal description, restaurant, etc..."
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
                            {editingId ? 'Update' : 'Add'} Meal
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
