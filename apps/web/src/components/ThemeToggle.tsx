'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 dark:border-white/10" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 w-9 h-9 sm:w-10 sm:h-10 text-gray-800 dark:text-white bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center relative overflow-hidden group ml-1 sm:ml-2"
            aria-label="Toggle theme"
        >
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 absolute transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90 group-hover:text-black" />
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 absolute transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0 group-hover:text-[#00FF88]" />
        </button>
    );
}
