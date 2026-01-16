import Aura from "@primeuix/themes/aura";

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    modules: ["@nuxtjs/tailwindcss", "@primevue/nuxt-module", "@nuxt/icon"],

    primevue: {
        options: {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: "none",
                },
            },
        },
    },

    icon: {
        serverBundle: {
            collections: ["carbon"],
        },
    },
});
