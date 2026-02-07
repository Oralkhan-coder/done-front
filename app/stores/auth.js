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
    const registrationEmail = ref('');
    const isLoading = ref(false);
    const error = ref(null);
    const isAuthenticated = computed(() => !!accessToken.value);

    const login = async (credentials) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const data = await $api('/login', {
                method: 'POST',
                body: credentials,
            });

            accessToken.value = data.accessToken;
            return navigateTo('/');
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Login failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const logout = () => {
        accessToken.value = null;
        return navigateTo('/login');
    };

    const register = async (registrationData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api('/signup', {
                method: 'POST',
                body: {
                    email: registrationData.email,
                    password: registrationData.password,
                    fullName: registrationData.fullName,
                },
            });
            registrationEmail.value = registrationData.email;
            if (response.status === 201 || response) {
                return response;
            }
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Registration failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const verifyOtp = async (code) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api('/otp/check', {
                method: 'POST',
                body: {
                    email: registrationEmail.value,
                    code: code,
                },
            });
            registrationEmail.value = '';
            return response;
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Invalid verification code';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const resendOtp = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api('/otp/generate', {
                method: 'POST',
                body: {
                    email: registrationEmail.value,
                },
            });
            return response;
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to resend code';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const clearRegistrationEmail = () => {
        registrationEmail.value = '';
    };

    return {
        credentials,
        accessToken,
        registrationEmail,
        isLoading,
        error,
        isAuthenticated,
        login,
        logout,
        register,
        verifyOtp,
        resendOtp,
        clearRegistrationEmail,
    };
});
