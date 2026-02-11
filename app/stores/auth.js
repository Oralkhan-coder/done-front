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
    const currentUser = useState('current_user', () => null);
    const userLoading = ref(false);
    const userError = ref('');
    const isAuthenticated = computed(() => !!accessToken.value);

    const decodeJwtPayload = (token) => {
        try {
            if (!token || typeof token !== 'string') return null;
            const payload = token.split('.')[1];
            if (!payload) return null;

            const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

            let decoded = '';
            if (typeof atob === 'function') {
                decoded = atob(padded);
            } else if (typeof Buffer !== 'undefined') {
                decoded = Buffer.from(padded, 'base64').toString('utf8');
            } else {
                return null;
            }

            return JSON.parse(decoded);
        } catch {
            return null;
        }
    };

    const normalizeUser = (payload) => {
        if (!payload || typeof payload !== 'object') return null;

        const root =
            payload.user ||
            payload.data?.user ||
            payload.data ||
            payload.result?.user ||
            payload.result ||
            payload;

        const fullName =
            root.fullName ||
            root.name ||
            root.username ||
            root.userName ||
            root.firstName ||
            root.displayName ||
            '';

        return {
            userId: root.userId || root.id || root.sub || null,
            fullName,
            email: root.email || '',
            avatar: root.avatar || root.avatarUrl || root.image || '',
            plan: root.plan || root.subscription || root.role || 'Member',
        };
    };

    const setUserFromToken = () => {
        const decoded = decodeJwtPayload(accessToken.value);
        if (!decoded) return null;

        const tokenUser = normalizeUser(decoded);
        if (!tokenUser) return null;

        currentUser.value = tokenUser;
        return tokenUser;
    };

    const fetchCurrentUser = async (force = false) => {
        if (!isAuthenticated.value) {
            currentUser.value = null;
            return null;
        }

        if (!force && currentUser.value) {
            return currentUser.value;
        }

        userLoading.value = true;
        userError.value = '';
        const { $api } = useNuxtApp();
        const endpoints = ['/users/me', '/auth/me', '/me', '/profile'];

        for (const endpoint of endpoints) {
            try {
                const response = await $api(endpoint);
                const normalizedUser = normalizeUser(response);
                if (normalizedUser) {
                    currentUser.value = normalizedUser;
                    userLoading.value = false;
                    return normalizedUser;
                }
            } catch {
                // try the next endpoint
            }
        }

        const tokenUser = setUserFromToken();
        if (tokenUser) {
            userLoading.value = false;
            return tokenUser;
        }

        userError.value = 'Failed to load user profile';
        userLoading.value = false;
        return null;
    };

    const login = async (credentials) => {
        const data = await $fetch('http://localhost:8080/login', {
            method: 'POST',
            body: credentials,
        });
        accessToken.value = data.accessToken;
        await fetchCurrentUser(true);
        return navigateTo('/');
    };
    const logout = () => {
        accessToken.value = null;
        currentUser.value = null;
        userError.value = '';
        return navigateTo('/login');
    };
    const register = async (registrationData) => {
        try {
            const response = await $fetch('http://localhost:8080/signup', {
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

    const googleLogin = async (token) => {
        try {
            const response = await $fetch('http://localhost:8080/google/auth', {
                method: 'POST',
                body: { token },
            });
            accessToken.value = response.accessToken;
            return navigateTo('/');
        } catch (error) {
            throw new Error(error.response?._data?.message || 'Google login failed');
        }
    };
    const verifyOtp = async (code, inviteToken = null) => {
        try {
            const query = {};
            if (inviteToken) {
                query.inviteToken = inviteToken;
            }
            const response = await $fetch('http://localhost:8080/otp/check', {
                method: 'POST',
                body: {
                    email: registrationEmail.value,
                    code: code,
                },
                query: query,
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
            const response = await $fetch('http://localhost:8080/otp/generate', {
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
        currentUser,
        userLoading,
        userError,
        isAuthenticated,
        fetchCurrentUser,
        login,
        logout,
        register,
        verifyOtp,
        resendOtp,
        clearRegistrationEmail,
        googleLogin,
    };
});
