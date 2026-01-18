export const useAuthStore = defineStore("auth", () => {
    const credentials = useState("user", () => {
        return {
            email: '',
            password: ''
        };
    });
    const accessToken = useCookie("access_token", {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
    });
    const isAuthenticated = computed(() => !!accessToken.value);

    const login = async (credentials) => {
        const data = await $fetch("http://localhost:3000/login", {
            method: "POST",
            body: credentials,
        });

        accessToken.value = data.accessToken;
        return navigateTo("/");
    };

    const logout = () => {
        accessToken.value = null;
        return navigateTo("/login");
    };

    return { user, accessToken, isAuthenticated, login, logout };
});
