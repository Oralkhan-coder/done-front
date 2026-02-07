export const useStatusStore = defineStore('status', () => {
    const statuses = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const currentProjectId = ref(null);

    const normalizeStatusesFromBoard = (boardColumns = []) => {
        return boardColumns
            .filter((column) => Number.isFinite(Number(column?.statusId)))
            .map((column) => ({
                id: Number(column.statusId),
                title: column.statusTitle || `Status ${column.statusId}`,
                rank: column.rank ?? null,
            }));
    };

    const setFromBoard = (boardColumns = []) => {
        statuses.value = normalizeStatusesFromBoard(boardColumns);
    };

    const fetchStatuses = async (projectId, options = {}) => {
        const { force = false } = options;

        if (!force && currentProjectId.value === projectId && statuses.value.length > 0) {
            return statuses.value;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const boardColumns = await $api(`/projects/${projectId}/board`);

            setFromBoard(boardColumns || []);
            currentProjectId.value = projectId;
            return statuses.value;
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to fetch statuses';
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

    return {
        statuses,
        isLoading,
        error,
        currentProjectId,
        setFromBoard,
        fetchStatuses,
        getStatusesForDropdown,
    };
});
