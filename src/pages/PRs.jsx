import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Card, Badge, Spinner } from '../components/ui';
import { format } from 'date-fns';

export const PRs = () => {
    const { prs, loading } = useData();

    // Group PRs by exercise
    const groupedPRs = prs.reduce((acc, pr) => {
        if (!acc[pr.exerciseName]) {
            acc[pr.exerciseName] = [];
        }
        acc[pr.exerciseName].push(pr);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Personal Records</h1>

            {prs.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                        No PRs yet. Keep working out and they'll appear here automatically!
                    </p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedPRs).map(([exerciseName, exercisePRs]) => (
                        <Card key={exerciseName}>
                            <h2 className="text-xl font-bold mb-4">{exerciseName}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {exercisePRs.map((pr) => (
                                    <motion.div
                                        key={pr.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-gradient-to-br from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {pr.prType.replace('_', ' ')}
                                                </p>
                                                <p className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                                                    {pr.value}
                                                    {pr.prType.includes('weight') ? ' kg' :
                                                        pr.prType.includes('reps') ? ' reps' : ''}
                                                </p>
                                            </div>
                                            {pr.isNew && (
                                                <Badge variant="success" className="animate-pulse">
                                                    🎉 New!
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {format(new Date(pr.date), 'MMM d, yyyy')}
                                        </p>

                                        {pr.notes && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-primary-200 dark:border-primary-800">
                                                {pr.notes}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
