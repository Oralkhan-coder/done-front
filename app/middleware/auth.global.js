export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore();
    const publicRoutes = ['/login', '/register', '/invite/accept'];
    if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
        return navigateTo('/login');
    }
    if (authStore.isAuthenticated && publicRoutes.includes(to.path)) {
        return navigateTo('/');
    }
});
