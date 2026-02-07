<template>
    <Toast position="top-right" />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup>
const uiStore = useUiStore();
const toast = useToast();
const onApiError = (event) => {
    const message = event?.detail?.message || 'Request failed';
    toast.add({
        severity: 'error',
        summary: 'API Error',
        detail: message,
        life: 3500,
    });
};

useHead({
    script: [
        {
            key: 'theme-init',
            children: `(function(){try{var t=localStorage.getItem('app-theme')||'system';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=t==='dark'||(t==='system'&&d);document.documentElement.classList.toggle('dark',isDark);document.documentElement.style.colorScheme=isDark?'dark':'light';}catch(e){}})();`,
        },
    ],
});

onMounted(() => {
    uiStore.initTheme();
    window.addEventListener('app:api-error', onApiError);
});

onBeforeUnmount(() => {
    window.removeEventListener('app:api-error', onApiError);
});
</script>
