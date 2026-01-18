export const useApi = (url, options = {}) => {
    return useFetch(url, {
        ...options,
        $fetch: useNuxtApp().$api,
    });
};
