import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Card, Badge, Spinner } from '../components/ui';
import { dbHelpers } from '../db/database';
import { format } from 'date-fns';
import { Scale, Flame, Dumbbell, CheckCircle, AlertTriangle } from 'lucide-react';
import { Icon } from '../components/ui/Icon';

export const Dashboard = () => {
    const { checkIns, meals, gymSessions, habits, goals, loading } = useData();
    const [stats, setStats] = useState({
        currentWeight: null,
        weightChange: null,
        todayCalories: 0,
        weeklyGymCount: 0,
        gymStreak: 0,
        habitScore: 0,
        plateau: false
    });

    useEffect(() => {
        calculateStats();
    }, [checkIns, meals, gymSessions, habits]);

    const calculateStats = async () => {
        // Current weight and change
        let currentWeight = null;
        let weightChange = null;
        if (checkIns.length > 0) {
            currentWeight = checkIns[0].weightKg;
            if (checkIns.length > 1) {
                weightChange = currentWeight - checkIns[1].weightKg;
            }
        }

        // Today's calories
        const today = new Date();
        const todayTotals = await dbHelpers.getDailyTotals(today);

        // Weekly gym count
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weeklyGymCount = await dbHelpers.getWeeklyGymCount(weekStart);

        // Gym streak
        const gymStreak = await dbHelpers.getGymStreak();

        // Habit score
        const habitScore = habits.length > 0 ? habits[0].score : 0;

        // Plateau detection
        const plateau = await dbHelpers.detectPlateau();

        setStats({
            currentWeight,
            weightChange,
            todayCalories: todayTotals.calories,
            weeklyGymCount,
            gymStreak,
            habitScore,
            plateau
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    const StatCard = ({ title, value, subtitle, link, icon: IconComponent, trend }) => (
        <Link to={link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                        <p className="text-3xl font-bold mt-2">{value}</p>
                        {subtitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                        )}
                        {trend && (
                            <Badge variant={trend > 0 ? 'success' : 'danger'} className="mt-2">
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)} kg
                            </Badge>
                        )}
                    </div>
                    <Icon icon={IconComponent} size="xl" className="text-emerald-600 dark:text-emerald-400" animate />
                </div>
            </Card>
        </Link>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </p>
                </div>
            </motion.div>

            {stats.plateau && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-warning-50 border border-warning-200 rounded-lg p-4"
                    role="alert"
                >
                    <div className="flex items-center gap-2">
                        <Icon icon={AlertTriangle} size="lg" className="text-warning-600" />
                        <div>
                            <h3 className="font-semibold text-warning-900">Plateau Detected</h3>
                            <p className="text-sm text-warning-800">
                                Your weight has remained within ±0.3kg for the last 3-4 check-ins. Consider adjusting your plan.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Current Weight"
                    value={stats.currentWeight ? `${stats.currentWeight} kg` : 'N/A'}
                    subtitle={checkIns.length > 0 ? format(new Date(checkIns[0].date), 'MMM d') : ''}
                    link="/check-ins"
                    icon={Scale}
                    trend={stats.weightChange}
                />

                <StatCard
                    title="Today's Calories"
                    value={stats.todayCalories}
                    subtitle="kcal consumed"
                    link="/meals"
                    icon={Flame}
                />

                <StatCard
                    title="Weekly Workouts"
                    value={stats.weeklyGymCount}
                    subtitle={`${stats.gymStreak} day streak`}
                    link="/gym"
                    icon={Dumbbell}
                />

                <StatCard
                    title="Habit Score"
                    value={`${stats.habitScore}%`}
                    subtitle="Today's habits"
                    link="/habits"
                    icon={CheckCircle}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Recent Check-ins</h2>
                    {checkIns.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No check-ins yet</p>
                    ) : (
                        <div className="space-y-3">
                            {checkIns.slice(0, 5).map((checkIn) => (
                                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <p className="font-medium">{checkIn.weightKg} kg</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {format(new Date(checkIn.date), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        checkIn.bmiCategory === 'Normal' ? 'success' :
                                            checkIn.bmiCategory === 'Overweight' ? 'warning' : 'danger'
                                    }>
                                        BMI: {checkIn.bmi}
                                    </Badge>
                                </div>
                            ))}
                            <Link to="/check-ins" className="block text-center text-primary-600 hover:text-primary-700 font-medium">
                                View all →
                            </Link>
                        </div>
                    )}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4">Active Goals</h2>
                    {goals.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No goals set</p>
                    ) : (
                        <div className="space-y-3">
                            {goals.slice(0, 5).map((goal) => {
                                const progress = goal.targetValue > 0
                                    ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
                                    : 0;

                                return (
                                    <div key={goal.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{goal.type}</p>
                                            <Badge variant={
                                                progress >= 100 ? 'success' :
                                                    progress >= 70 ? 'primary' :
                                                        progress >= 40 ? 'warning' : 'danger'
                                            }>
                                                {progress.toFixed(0)}%
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="bg-primary-600 h-2 rounded-full"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            <Link to="/goals" className="block text-center text-primary-600 hover:text-primary-700 font-medium">
                                View all →
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
