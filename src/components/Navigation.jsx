import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    LayoutDashboard,
    Scale,
    Flame,
    Dumbbell,
    CheckCircle,
    Target,
    Trophy,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { Icon } from './ui/Icon';

export const Navigation = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/check-ins', label: 'Check-ins', icon: Scale },
        { to: '/meals', label: 'Meals', icon: Flame },
        { to: '/gym', label: 'Gym', icon: Dumbbell },
        { to: '/habits', label: 'Habits', icon: CheckCircle },
        { to: '/goals', label: 'Goals', icon: Target },
        { to: '/prs', label: 'PRs', icon: Trophy },
        { to: '/settings', label: 'Settings', icon: Settings }
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Icon icon={Dumbbell} size="lg" className="text-emerald-600 dark:text-emerald-400" />
                        <h1 className="text-xl font-bold hidden sm:block">MainLoss</h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`
                                }
                            >
                                <Icon icon={item.icon} size="sm" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        <Icon
                            icon={mobileMenuOpen ? X : Menu}
                            size="md"
                            ariaLabel={mobileMenuOpen ? "Close menu" : "Open menu"}
                        />
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden pb-4"
                    >
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${isActive
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`
                                }
                            >
                                <Icon icon={item.icon} size="sm" />
                                {item.label}
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </div>
        </nav>
    );
};

