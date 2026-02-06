import { motion } from 'framer-motion';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    type = 'button',
    disabled = false,
    className = '',
    ariaLabel,
    ...props
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            aria-label={ariaLabel}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export const Input = ({
    label,
    error,
    id,
    required = false,
    className = '',
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="label">
                    {label}
                    {required && <span className="text-danger-600 ml-1" aria-label="required">*</span>}
                </label>
            )}
            <input
                id={inputId}
                className={`input ${error ? 'border-danger-600 focus:ring-danger-500' : ''}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...props}
            />
            {error && (
                <p id={`${inputId}-error`} className="text-danger-600 text-sm mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export const Select = ({
    label,
    error,
    id,
    required = false,
    children,
    className = '',
    ...props
}) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={selectId} className="label">
                    {label}
                    {required && <span className="text-danger-600 ml-1" aria-label="required">*</span>}
                </label>
            )}
            <select
                id={selectId}
                className={`input ${error ? 'border-danger-600 focus:ring-danger-500' : ''}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${selectId}-error` : undefined}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p id={`${selectId}-error`} className="text-danger-600 text-sm mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export const Textarea = ({
    label,
    error,
    id,
    required = false,
    className = '',
    ...props
}) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={textareaId} className="label">
                    {label}
                    {required && <span className="text-danger-600 ml-1" aria-label="required">*</span>}
                </label>
            )}
            <textarea
                id={textareaId}
                className={`input ${error ? 'border-danger-600 focus:ring-danger-500' : ''}`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${textareaId}-error` : undefined}
                rows={3}
                {...props}
            />
            {error && (
                <p id={`${textareaId}-error`} className="text-danger-600 text-sm mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export const Card = ({ children, className = '', ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className={`card w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 id="modal-title" className="text-2xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
};

export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`${sizes[size]} ${className}`} role="status" aria-label="Loading">
            <svg className="animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        danger: 'bg-danger-100 text-danger-800',
        gray: 'bg-gray-100 text-gray-800',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
