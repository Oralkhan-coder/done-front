export const useUiStore = defineStore('ui', () => {
    const theme = ref('system'); // 'light' | 'dark' | 'system'

    const resolvedTheme = computed(() => {
        if (theme.value === 'system') {
            if (!import.meta.client) return 'light';
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        return theme.value;
    });

    const applyTheme = (targetTheme = theme.value) => {
        if (!import.meta.client) return;

        const html = document.documentElement;
        const isDark =
            targetTheme === 'dark' ||
            (targetTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        html.classList.toggle('dark', isDark);
        html.style.colorScheme = isDark ? 'dark' : 'light';
    };

    const initTheme = () => {
        if (!import.meta.client) return;

        const saved = localStorage.getItem('app-theme');
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
            theme.value = saved;
        }

        applyTheme(theme.value);
    };

    const setTheme = (value) => {
        theme.value = value;

        if (import.meta.client) {
            localStorage.setItem('app-theme', value);
        }

        applyTheme(value);
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark');
    };

    return {
        theme,
        resolvedTheme,
        initTheme,
        applyTheme,
        setTheme,
        toggleTheme,
    };
});
