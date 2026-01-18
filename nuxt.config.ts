import Aura from '@primeuix/themes/aura';


export default defineNuxtConfig({
    css: ['~/assets/css/main.css'],

    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss', '@primevue/nuxt-module', '@nuxt/icon', '@pinia/nuxt'],

    primevue: {
        options: {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: 'none',
                },
            },
        },
    },

    icon: {
        serverBundle: {
            collections: ['carbon'],
        },
    },
});
