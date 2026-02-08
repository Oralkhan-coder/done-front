export const useWikiStore = defineStore('wiki', () => {
    const pages = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const getProjectPages = async (projectId) => {
        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/projects/${projectId}/wiki`);
            pages.value = response || [];
        } catch (err) {
            error.value = 'Failed to load wiki pages';
            console.error('Wiki pages load error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const getPage = async (pageId) => {
        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/wiki/${pageId}`);
            return response;
        } catch (err) {
            error.value = 'Failed to load wiki page';
            console.error('Wiki page load error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createPage = async (projectId, payload) => {
        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            await $api(`/projects/${projectId}/wiki`, {
                method: 'POST',
                body: payload,
            });
        } catch (err) {
            error.value = 'Failed to create wiki page';
            console.error('Wiki page create error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updatePage = async (pageId, payload) => {
        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            await $api(`/wiki/${pageId}`, {
                method: 'PUT',
                body: payload,
            });
        } catch (err) {
            error.value = 'Failed to update wiki page';
            console.error('Wiki page update error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deletePage = async (pageId) => {
        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            await $api(`/wiki/${pageId}`, {
                method: 'DELETE',
            });
            pages.value = pages.value.filter((page) => page.id !== pageId);
        } catch (err) {
            error.value = 'Failed to delete wiki page';
            console.error('Wiki page delete error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        pages,
        isLoading,
        error,
        getProjectPages,
        getPage,
        createPage,
        updatePage,
        deletePage,
    };
});
