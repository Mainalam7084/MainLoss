import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Icon } from '../components/ui/Icon';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message) => addToast(message, 'error'), [addToast]);
    const info = useCallback((message) => addToast(message, 'info'), [addToast]);
    const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ success, error, info, warning }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ id, message, type, onClose }) => {
    const colors = {
        success: 'bg-success-600',
        error: 'bg-danger-600',
        warning: 'bg-warning-600',
        info: 'bg-primary-600'
    };

    const iconComponents = {
        success: CheckCircle,
        error: X,
        warning: AlertTriangle,
        info: Info
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
            role="alert"
        >
            <Icon icon={iconComponents[type]} size="md" className="flex-shrink-0" />
            <p className="flex-1">{message}</p>
            <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                aria-label="Close notification"
            >
                <Icon icon={X} size="sm" />
            </button>
        </motion.div>
    );
};
