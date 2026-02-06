import { motion } from 'framer-motion';

/**
 * Reusable Icon wrapper component for Lucide icons
 * 
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.size - Icon size: 'sm' (16px), 'md' (20px), 'lg' (24px), 'xl' (32px)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animate - Enable hover animation (default: false)
 * @param {string} props.ariaLabel - Accessibility label
 */
export const Icon = ({
    icon: IconComponent,
    size = 'md',
    className = '',
    animate = false,
    ariaLabel,
    ...props
}) => {
    const sizeMap = {
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32
    };

    const iconSize = sizeMap[size] || sizeMap.md;

    const iconElement = (
        <IconComponent
            size={iconSize}
            className={className}
            aria-label={ariaLabel}
            aria-hidden={!ariaLabel}
            {...props}
        />
    );

    if (animate) {
        return (
            <motion.span
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'inline-flex', alignItems: 'center' }}
            >
                {iconElement}
            </motion.span>
        );
    }

    return iconElement;
};
