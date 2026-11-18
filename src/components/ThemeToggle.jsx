import {useEffect, useState} from 'react';

function getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme
        ? savedTheme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function ThemeToggle() {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                type="button" aria-pressed={isDark}
                onClick={() => setIsDark((current) => !current)}>
            {isDark ? 'Light mode' : 'Dark mode'}
        </button>
    );
}

export default ThemeToggle;
