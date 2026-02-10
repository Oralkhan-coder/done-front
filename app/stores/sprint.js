const getErrorMessage = (error, fallback) => {
    return (
        error?.data?.error ||
        error?.response?._data?.error ||
        error?.statusMessage ||
        error?.message ||
        fallback
    );
};

const toFiniteNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const normalizeStatus = (status) => {
    const normalized = String(status || '').toLowerCase();

    if (normalized === 'started') {
        return 'active';
    }
    if (normalized === 'completed') {
        return 'closed';
    }
    if (normalized === 'planned' || normalized === 'active' || normalized === 'closed') {
        return normalized;
    }
    return 'planned';
};

const normalizeDateValue = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        return value;
    }

    try {
        return new Date(value).toISOString();
    } catch (error) {
        return null;
    }
};

const normalizeSprint = (sprint = {}) => {
    return {
        ...sprint,
        id: toFiniteNumber(sprint.id),
        projectId: toFiniteNumber(sprint.projectId),
        number: toFiniteNumber(sprint.number),
        description: sprint.description || '',
        status: normalizeStatus(sprint.status),
        startDate: normalizeDateValue(sprint.startDate),
        endDate: normalizeDateValue(sprint.endDate),
        createdAt: normalizeDateValue(sprint.createdAt),
        updatedAt: normalizeDateValue(sprint.updatedAt),
    };
};

const sortSprints = (items = []) => {
    return [...items].sort((left, right) => {
        if (left.number === right.number) {
            return right.id - left.id;
        }
        return right.number - left.number;
    });
};

const formatSprintOptionLabel = (sprint) => {
    const suffix = sprint.status === 'active' ? ' (Active)' : sprint.status === 'closed' ? ' (Completed)' : '';
    return `Sprint #${sprint.number}${suffix}`;
};

export const useSprintStore = defineStore('sprint', () => {
    const sprints = ref([]);
    const currentProjectId = ref(0);
    const isLoading = ref(false);
    const isSaving = ref(false);
    const error = ref('');

    const fetchProjectSprints = async (projectId, options = {}) => {
        const normalizedProjectId = toFiniteNumber(projectId);
        const force = Boolean(options.force);

        if (!normalizedProjectId) {
            sprints.value = [];
            currentProjectId.value = 0;
            return sprints.value;
        }

        if (!force && currentProjectId.value === normalizedProjectId && sprints.value.length > 0) {
            return sprints.value;
        }

        isLoading.value = true;
        error.value = '';

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/projects/${normalizedProjectId}/sprints`);
            const normalized = Array.isArray(response) ? response.map(normalizeSprint) : [];

            sprints.value = sortSprints(normalized);
            currentProjectId.value = normalizedProjectId;

            return sprints.value;
        } catch (err) {
            error.value = getErrorMessage(err, 'Failed to load sprints');
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createSprint = async (projectId, payload) => {
        const normalizedProjectId = toFiniteNumber(projectId);

        isSaving.value = true;
        error.value = '';

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/projects/${normalizedProjectId}/sprints`, {
                method: 'POST',
                body: payload,
            });

            await fetchProjectSprints(normalizedProjectId, { force: true });
            return response;
        } catch (err) {
            error.value = getErrorMessage(err, 'Failed to create sprint');
            throw err;
        } finally {
            isSaving.value = false;
        }
    };

    const updateSprint = async (projectId, sprintId, payload) => {
        const normalizedProjectId = toFiniteNumber(projectId);

        isSaving.value = true;
        error.value = '';

        try {
            const { $api } = useNuxtApp();
            await $api(`/sprints/${sprintId}`, {
                method: 'PUT',
                body: payload,
            });

            await fetchProjectSprints(normalizedProjectId, { force: true });
        } catch (err) {
            error.value = getErrorMessage(err, 'Failed to update sprint');
            throw err;
        } finally {
            isSaving.value = false;
        }
    };

    const deleteSprint = async (projectId, sprintId) => {
        const normalizedProjectId = toFiniteNumber(projectId);

        isSaving.value = true;
        error.value = '';

        try {
            const { $api } = useNuxtApp();
            await $api(`/sprints/${sprintId}`, {
                method: 'DELETE',
            });

            await fetchProjectSprints(normalizedProjectId, { force: true });
        } catch (err) {
            error.value = getErrorMessage(err, 'Failed to delete sprint');
            throw err;
        } finally {
            isSaving.value = false;
        }
    };

    const activeSprint = computed(() => {
        return sprints.value.find((sprint) => sprint.status === 'active') || null;
    });

    const sprintOptions = computed(() => {
        return sprints.value.map((sprint) => ({
            label: formatSprintOptionLabel(sprint),
            value: sprint.id,
            status: sprint.status,
        }));
    });

    const clearSprints = () => {
        sprints.value = [];
        currentProjectId.value = 0;
        error.value = '';
    };

    return {
        sprints,
        currentProjectId,
        isLoading,
        isSaving,
        error,
        activeSprint,
        sprintOptions,
        fetchProjectSprints,
        createSprint,
        updateSprint,
        deleteSprint,
        clearSprints,
    };
});
