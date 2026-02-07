import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
    css: ['~/assets/css/main.css'],

    devServer: {
        host: 'localhost',
        port: 4200,
    },

    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss', '@primevue/nuxt-module', '@nuxt/icon', '@pinia/nuxt'],

    primevue: {
        options: {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.dark',
                },
            },
        },
    },

    runtimeConfig: {
        public: {
            apiBase: 'http://localhost:3000',
        },
    },

    icon: {
        serverBundle: {
            collections: ['carbon'],
        },
    },
});
