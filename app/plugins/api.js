export default defineNuxtPlugin(() => {
    const authStore = useAuthStore();

    const api = $fetch.create({
        baseURL: 'http://localhost:3000',
        onRequest({ options }) {
            if (authStore.accessToken) {
                options.headers = options.headers || {};
                options.headers.set('Authorization', `Bearer ${authStore.accessToken}`);
            }
        },
        onResponseError({ response }) {
            if (response.status === 401) {
                authStore.logout();
            }
        },
    });

    return {
        provide: { api },
    };
});
