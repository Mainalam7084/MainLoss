import Dexie from 'dexie';

export const db = new Dexie('WeightLossJourneyDB');

db.version(1).stores({
    // Monthly Check-ins
    checkIns: '++id, date, heightCm, weightKg, waistCm, bmi, bmiCategory, notes',

    // Meals & Nutrition
    meals: '++id, datetime, mealType, calories, protein, carbs, fat, waterMl, notes, photoBlob',

    // Gym Sessions
    gymSessions: '++id, datetime, workoutType, durationMin, cardioType, cardioMin, intensity, notes',

    // Exercises & Sets (linked to gym sessions)
    exercises: '++id, sessionId, exerciseName, sets, reps, weightKg, restSec, volume, machinePhotoBlob',

    // Habit Tracker
    habits: '++id, date, waterMl, steps, creatine, stretching, sleepHours, score',

    // Goals & Plan
    goals: '++id, type, targetValue, currentValue, deadline, status, createdAt',

    // PR Tracker
    prs: '++id, exerciseName, prType, value, date, notes, isNew',

    // Settings
    settings: 'key, value'
});

// Helper functions for common operations
export const dbHelpers = {
    // Check-ins
    async addCheckIn(data) {
        const bmi = (data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1);
        const bmiCategory = this.getBMICategory(bmi);
        return await db.checkIns.add({ ...data, bmi, bmiCategory });
    },

    async getCheckIns() {
        return await db.checkIns.orderBy('date').reverse().toArray();
    },

    async updateCheckIn(id, data) {
        if (data.weightKg && data.heightCm) {
            const bmi = (data.weightKg / ((data.heightCm / 100) ** 2)).toFixed(1);
            data.bmi = bmi;
            data.bmiCategory = this.getBMICategory(bmi);
        }
        return await db.checkIns.update(id, data);
    },

    async deleteCheckIn(id) {
        return await db.checkIns.delete(id);
    },

    getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    },

    async detectPlateau() {
        const recent = await db.checkIns.orderBy('date').reverse().limit(4).toArray();
        if (recent.length < 3) return false;

        const weights = recent.map(c => c.weightKg);
        const max = Math.max(...weights);
        const min = Math.min(...weights);

        return (max - min) <= 0.3;
    },

    // Meals
    async addMeal(data) {
        return await db.meals.add(data);
    },

    async getMeals(startDate, endDate) {
        return await db.meals
            .where('datetime')
            .between(startDate, endDate)
            .toArray();
    },

    async updateMeal(id, data) {
        return await db.meals.update(id, data);
    },

    async deleteMeal(id) {
        return await db.meals.delete(id);
    },

    async getDailyTotals(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const meals = await this.getMeals(startOfDay, endOfDay);

        return meals.reduce((totals, meal) => ({
            calories: totals.calories + (meal.calories || 0),
            protein: totals.protein + (meal.protein || 0),
            carbs: totals.carbs + (meal.carbs || 0),
            fat: totals.fat + (meal.fat || 0),
            water: totals.water + (meal.waterMl || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
    },

    // Gym Sessions
    async addGymSession(data) {
        return await db.gymSessions.add(data);
    },

    async getGymSessions() {
        return await db.gymSessions.orderBy('datetime').reverse().toArray();
    },

    async updateGymSession(id, data) {
        return await db.gymSessions.update(id, data);
    },

    async deleteGymSession(id) {
        // Also delete associated exercises
        const exercises = await db.exercises.where('sessionId').equals(id).toArray();
        await db.exercises.bulkDelete(exercises.map(e => e.id));
        return await db.gymSessions.delete(id);
    },

    async getWeeklyGymCount(weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const sessions = await db.gymSessions
            .where('datetime')
            .between(weekStart, weekEnd)
            .toArray();

        return sessions.length;
    },

    async getGymStreak() {
        const sessions = await db.gymSessions.orderBy('datetime').reverse().toArray();
        if (sessions.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const session of sessions) {
            const sessionDate = new Date(session.datetime);
            sessionDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 1) {
                streak++;
                currentDate = sessionDate;
            } else {
                break;
            }
        }

        return streak;
    },

    // Exercises
    async addExercise(data) {
        const volume = (data.sets || 0) * (data.reps || 0) * (data.weightKg || 0);
        return await db.exercises.add({ ...data, volume });
    },

    async getExercisesBySession(sessionId) {
        return await db.exercises.where('sessionId').equals(sessionId).toArray();
    },

    async getExerciseHistory(exerciseName) {
        return await db.exercises
            .where('exerciseName')
            .equals(exerciseName)
            .toArray();
    },

    async updateExercise(id, data) {
        if (data.sets || data.reps || data.weightKg) {
            const exercise = await db.exercises.get(id);
            const volume = (data.sets || exercise.sets || 0) *
                (data.reps || exercise.reps || 0) *
                (data.weightKg || exercise.weightKg || 0);
            data.volume = volume;
        }
        return await db.exercises.update(id, data);
    },

    async deleteExercise(id) {
        return await db.exercises.delete(id);
    },

    // Habits
    async addHabit(data) {
        const score = this.calculateHabitScore(data);
        return await db.habits.add({ ...data, score });
    },

    async getHabitByDate(date) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        return await db.habits.where('date').equals(dateStr).first();
    },

    async updateHabit(id, data) {
        const score = this.calculateHabitScore(data);
        return await db.habits.update(id, { ...data, score });
    },

    calculateHabitScore(habit) {
        let score = 0;
        let total = 0;

        if (habit.waterMl !== undefined) {
            total++;
            if (habit.waterMl >= 2000) score++;
        }
        if (habit.steps !== undefined) {
            total++;
            if (habit.steps >= 8000) score++;
        }
        if (habit.creatine !== undefined) {
            total++;
            if (habit.creatine) score++;
        }
        if (habit.stretching !== undefined) {
            total++;
            if (habit.stretching) score++;
        }
        if (habit.sleepHours !== undefined) {
            total++;
            if (habit.sleepHours >= 7) score++;
        }

        return total > 0 ? Math.round((score / total) * 100) : 0;
    },

    // Goals
    async addGoal(data) {
        return await db.goals.add({ ...data, createdAt: new Date() });
    },

    async getGoals() {
        return await db.goals.toArray();
    },

    async updateGoal(id, data) {
        return await db.goals.update(id, data);
    },

    async deleteGoal(id) {
        return await db.goals.delete(id);
    },

    // PRs
    async addPR(data) {
        return await db.prs.add({ ...data, isNew: true });
    },

    async getPRs() {
        return await db.prs.orderBy('date').reverse().toArray();
    },

    async getPRsByExercise(exerciseName) {
        return await db.prs.where('exerciseName').equals(exerciseName).toArray();
    },

    async checkAndAddPR(exerciseName, prType, value) {
        const existingPRs = await this.getPRsByExercise(exerciseName);
        const typePRs = existingPRs.filter(pr => pr.prType === prType);

        if (typePRs.length === 0 || value > Math.max(...typePRs.map(pr => pr.value))) {
            await this.addPR({
                exerciseName,
                prType,
                value,
                date: new Date(),
                notes: 'Auto-detected PR'
            });
            return true;
        }
        return false;
    },

    // Export/Import
    async exportData() {
        const data = {
            checkIns: await db.checkIns.toArray(),
            meals: await db.meals.toArray(),
            gymSessions: await db.gymSessions.toArray(),
            exercises: await db.exercises.toArray(),
            habits: await db.habits.toArray(),
            goals: await db.goals.toArray(),
            prs: await db.prs.toArray(),
            settings: await db.settings.toArray(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    async importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            await db.transaction('rw', [
                db.checkIns,
                db.meals,
                db.gymSessions,
                db.exercises,
                db.habits,
                db.goals,
                db.prs,
                db.settings
            ], async () => {
                if (data.checkIns) await db.checkIns.bulkPut(data.checkIns);
                if (data.meals) await db.meals.bulkPut(data.meals);
                if (data.gymSessions) await db.gymSessions.bulkPut(data.gymSessions);
                if (data.exercises) await db.exercises.bulkPut(data.exercises);
                if (data.habits) await db.habits.bulkPut(data.habits);
                if (data.goals) await db.goals.bulkPut(data.goals);
                if (data.prs) await db.prs.bulkPut(data.prs);
                if (data.settings) await db.settings.bulkPut(data.settings);
            });

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
};
