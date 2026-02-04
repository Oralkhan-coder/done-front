export const useAuthStore = defineStore('auth', () => {
    const credentials = useState('user', () => {
        return {
            email: '',
            password: '',
        };
    });
    const accessToken = useCookie('access_token', {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
    });
    const isAuthenticated = computed(() => !!accessToken.value);

    const login = async (credentials) => {
        const data = await $fetch('http://localhost:3000/login', {
            method: 'POST',
            body: credentials,
        });

        accessToken.value = data.accessToken;
        return navigateTo('/');
    };

    const logout = () => {
        accessToken.value = null;
        return navigateTo('/login');
    };

    const register = async (registrationData) => {
        try {
            const response = await $fetch('http://localhost:3000/signup', {
                method: 'POST',
                body: {
                    email: registrationData.email,
                    password: registrationData.password,
                    fullName: registrationData.fullName,
                },
            });

            if (response.status === 201 || response) {
                return response;
            }
        } catch (error) {
            if (error.response) {
                throw new Error(error.response._data?.message || 'Registration failed');
            }
            throw new Error('Network error. Please try again.');
        }
    };

    return { credentials, accessToken, isAuthenticated, login, logout, register };
});
