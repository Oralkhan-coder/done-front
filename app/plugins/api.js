const BUGGY_BACKEND_FALLBACK_PATTERNS = [
    /^\/projects\/[^/]+\/board$/,
    /^\/projects\/[^/]+\/status\/[^/]+\/rank$/,
];

const normalizeApiPath = (request) => {
    if (typeof request !== 'string') return request;
    if (/^https?:\/\//.test(request)) return request;
    return request.startsWith('/') ? request : `/${request}`;
};

const shouldFallbackWithoutLeadingSlash = (path) => {
    return BUGGY_BACKEND_FALLBACK_PATTERNS.some((pattern) => pattern.test(path));
};

const extractErrorMessage = (error) => {
    return (
        error?.response?._data?.message ||
        error?.response?._data?.error ||
        error?.data?.message ||
        error?.message ||
        'Request failed'
    );
};

const isAuthorizationError = (error) => {
    const status = error?.response?.status;
    if (status === 401) return true;

    const message = String(extractErrorMessage(error) || '').toLowerCase();
    return (
        message.includes('authorization header is required') ||
        message.includes('missing authorization') ||
        message.includes('unauthorized')
    );
};

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig();
    const accessToken = useCookie('access_token');

    const rawApi = $fetch.create({
        baseURL: runtimeConfig.public.apiBase || 'http://localhost:3000',
        onRequest({ options }) {
            options.headers = options.headers || {};

            if (accessToken.value) {
                const tokenValue = `Bearer ${accessToken.value}`;

                if (options.headers instanceof Headers) {
                    options.headers.set('Authorization', tokenValue);
                } else if (Array.isArray(options.headers)) {
                    const existingIndex = options.headers.findIndex(
                        ([headerName]) => String(headerName).toLowerCase() === 'authorization',
                    );

                    if (existingIndex >= 0) {
                        options.headers[existingIndex] = ['Authorization', tokenValue];
                    } else {
                        options.headers.push(['Authorization', tokenValue]);
                    }
                } else {
                    options.headers.Authorization = tokenValue;
                }
            }
        },
    });

    const notifyApiError = (message) => {
        if (!import.meta.client) return;

        window.dispatchEvent(
            new CustomEvent('app:api-error', {
                detail: { message },
            }),
        );
    };

    const api = async (request, options = {}) => {
        const normalizedRequest = normalizeApiPath(request);

        try {
            return await rawApi(normalizedRequest, options);
        } catch (error) {
            let responseStatus = error?.response?.status;

            if (
                responseStatus === 404 &&
                typeof normalizedRequest === 'string' &&
                normalizedRequest.startsWith('/') &&
                shouldFallbackWithoutLeadingSlash(normalizedRequest)
            ) {
                const fallbackRequest = normalizedRequest.slice(1);
                try {
                    return await rawApi(fallbackRequest, options);
                } catch (fallbackError) {
                    error = fallbackError;
                    responseStatus = error?.response?.status;
                    // continue to common error handling below
                }
            }

            if (isAuthorizationError(error)) {
                accessToken.value = null;
                if (import.meta.client) {
                    notifyApiError('Сессия истекла. Войдите снова.');
                    await navigateTo('/login');
                }
                throw error;
            }

            console.error('API request failed:', {
                request: normalizedRequest,
                status: responseStatus,
                data: error?.response?._data,
            });

            notifyApiError(extractErrorMessage(error));
            throw error;
        }
    };

    return {
        provide: {
            api,
        },
    };
});
