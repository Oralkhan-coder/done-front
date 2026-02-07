export const useStatusStore = defineStore('status', () => {
    const statuses = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const currentProjectId = ref(null);

    const fetchStatuses = async (projectId) => {
        if (currentProjectId.value === projectId && statuses.value.length > 0) {
            return statuses.value;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/projects/${projectId}/status`);

            statuses.value = response.map((status) => ({
                id: status.id,
                title: status.title,
            }));

            currentProjectId.value = projectId;

            return statuses.value;
        } catch (err) {
            error.value = 'Failed to fetch statuses';
            console.error('Status fetch error:', err);
            statuses.value = [];
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const getStatusesForDropdown = () => {
        return statuses.value.map((status) => ({
            label: status.title,
            value: status.id,
        }));
    };

    const getStatusById = (statusId) => {
        return statuses.value.find((status) => status.id === statusId);
    };

    const clearStatuses = () => {
        statuses.value = [];
        currentProjectId.value = null;
        error.value = null;
    };

    const refreshStatuses = async () => {
        if (!currentProjectId.value) {
            console.warn('No project ID set, cannot refresh statuses');
            return;
        }

        statuses.value = [];
        return await fetchStatuses(currentProjectId.value);
    };

    return {
        statuses,
        isLoading,
        error,
        currentProjectId,
        fetchStatuses,
        getStatusesForDropdown,
        getStatusById,
        clearStatuses,
        refreshStatuses,
    };
});
