import { createContext, useContext, useState, useEffect } from 'react';
import { dbHelpers } from '../db/database';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [checkIns, setCheckIns] = useState([]);
    const [meals, setMeals] = useState([]);
    const [gymSessions, setGymSessions] = useState([]);
    const [habits, setHabits] = useState([]);
    const [goals, setGoals] = useState([]);
    const [prs, setPrs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [
                checkInsData,
                mealsData,
                gymSessionsData,
                habitsData,
                goalsData,
                prsData
            ] = await Promise.all([
                dbHelpers.getCheckIns(),
                dbHelpers.getMeals(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                dbHelpers.getGymSessions(),
                dbHelpers.getHabitByDate(new Date()),
                dbHelpers.getGoals(),
                dbHelpers.getPRs()
            ]);

            setCheckIns(checkInsData);
            setMeals(mealsData);
            setGymSessions(gymSessionsData);
            setHabits(habitsData ? [habitsData] : []);
            setGoals(goalsData);
            setPrs(prsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshCheckIns = async () => {
        const data = await dbHelpers.getCheckIns();
        setCheckIns(data);
    };

    const refreshMeals = async () => {
        const data = await dbHelpers.getMeals(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            new Date()
        );
        setMeals(data);
    };

    const refreshGymSessions = async () => {
        const data = await dbHelpers.getGymSessions();
        setGymSessions(data);
    };

    const refreshHabits = async () => {
        const data = await dbHelpers.getHabitByDate(new Date());
        setHabits(data ? [data] : []);
    };

    const refreshGoals = async () => {
        const data = await dbHelpers.getGoals();
        setGoals(data);
    };

    const refreshPRs = async () => {
        const data = await dbHelpers.getPRs();
        setPrs(data);
    };

    const value = {
        checkIns,
        meals,
        gymSessions,
        habits,
        goals,
        prs,
        loading,
        refreshCheckIns,
        refreshMeals,
        refreshGymSessions,
        refreshHabits,
        refreshGoals,
        refreshPRs,
        refreshAll: loadAllData
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
