import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Card, Button } from '../components/ui';
import { dbHelpers } from '../db/database';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Icon } from '../components/ui/Icon';

export const Settings = () => {
    const { success, error } = useToast();
    const [importing, setImporting] = useState(false);

    const handleExport = async () => {
        try {
            const data = await dbHelpers.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `weight-loss-journey-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            success('Data exported successfully');
        } catch (err) {
            error('Failed to export data');
            console.error(err);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setImporting(true);
            const text = await file.text();
            const result = await dbHelpers.importData(text);

            if (result) {
                success('Data imported successfully. Refreshing page...');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                error('Failed to import data. Please check the file format.');
            }
        } catch (err) {
            error('Failed to import data');
            console.error(err);
        } finally {
            setImporting(false);
        }
    };

    const handleClearData = async () => {
        if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) return;
        if (!confirm('This will delete everything. Are you absolutely sure?')) return;

        try {
            await Promise.all([
                dbHelpers.db.checkIns.clear(),
                dbHelpers.db.meals.clear(),
                dbHelpers.db.gymSessions.clear(),
                dbHelpers.db.exercises.clear(),
                dbHelpers.db.habits.clear(),
                dbHelpers.db.goals.clear(),
                dbHelpers.db.prs.clear()
            ]);
            success('All data cleared. Refreshing page...');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            error('Failed to clear data');
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Card>
                <h2 className="text-xl font-bold mb-4">Data Management</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Export Data</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Download all your data as a JSON file for backup or transfer.
                        </p>
                        <Button onClick={handleExport} variant="primary" className="flex items-center gap-2">
                            <Icon icon={Download} size="sm" />
                            Export All Data
                        </Button>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Import Data</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Restore data from a previously exported JSON file. This will merge with existing data.
                        </p>
                        <label className="inline-block">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                                disabled={importing}
                            />
                            <Button as="span" variant="secondary" disabled={importing} className="flex items-center gap-2">
                                <Icon icon={Upload} size="sm" />
                                {importing ? 'Importing...' : 'Import Data'}
                            </Button>
                        </label>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2 text-danger-600">Danger Zone</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Permanently delete all data. This action cannot be undone!
                        </p>
                        <Button onClick={handleClearData} variant="danger" className="flex items-center gap-2">
                            <Icon icon={Trash2} size="sm" />
                            Clear All Data
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">About</h2>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>MainLoss</strong> - Version 1.0.0</p>
                    <p>A clean, modern, and minimal fitness tracking app that works completely offline.</p>
                    <p>All data is stored locally in your browser using IndexedDB.</p>
                    <p className="pt-4 border-t">
                        Built with React, Vite, TailwindCSS, Framer Motion, Lucide Icons, and Dexie.
                    </p>
                </div>
            </Card>
        </div>
    );
};
