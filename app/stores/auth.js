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
            registrationEmail.value = registrationData.email;
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
    const verifyOtp = async (code) => {
        try {
            const response = await $fetch('http://localhost:3000/otp/check', {
                method: 'POST',
                body: {
                    email: registrationEmail.value,
                    code: code,
                },
            });
            registrationEmail.value = '';
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response._data?.message || 'Invalid verification code');
            }
            throw new Error('Network error. Please try again.');
        }
    };
    const resendOtp = async () => {
        try {
            const response = await $fetch('http://localhost:3000/otp/generate', {
                method: 'POST',
                body: {
                    email: registrationEmail.value,
                },
            });
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response._data?.message || 'Failed to resend code');
            }
            throw new Error('Network error. Please try again.');
        }
    };
    const clearRegistrationEmail = () => {
        registrationEmail.value = '';
    };
    return {
        credentials,
        accessToken,
        registrationEmail,
        isAuthenticated,
        login,
        logout,
        register,
        verifyOtp,
        resendOtp,
        clearRegistrationEmail,
    };
});
