export const useProjectStore = defineStore('project', () => {
    const project = reactive({
        title: '',
        description: '',
        code: '',
    });
    const projects = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const normalizeProjectsList = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.items)) return payload.items;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
    };

    const getProjects = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            const response = await $api('/projects');
            projects.value = normalizeProjectsList(response);
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to load projects';
            projects.value = [];
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const getProject = async (route) => {
        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            const data = await $api(`/projects/${route.params.id}`);
            Object.assign(project, data || {});
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to load project';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createProject = async (newProject) => {
        isLoading.value = true;
        error.value = null;
        const { $api } = useNuxtApp();
        try {
            await $api('/projects', {
                method: 'POST',
                body: newProject,
            });

            Object.assign(newProject, {
                title: '',
                code: '',
                description: '',
            });

            return navigateTo('/projects');
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to create project';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteProject = async (project) => {
        isLoading.value = true;
        error.value = null;
        const { $api } = useNuxtApp();
        try {
            await $api(`/projects/${project.id}`, {
                method: 'DELETE',
            });

            projects.value = projects.value.filter((item) => item !== project);
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to delete project';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateProject = async (updatedData) => {
        isLoading.value = true;
        error.value = null;
        const { $api } = useNuxtApp();
        try {
            await $api(`/projects/${updatedData.id}`, {
                method: 'PUT',
                body: updatedData,
            });

            projects.value = projects.value.map((item) => {
                if (item.id === updatedData.id) {
                    return { ...item, ...updatedData };
                }
                return item;
            });
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to update project';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        project,
        projects,
        isLoading,
        error,
        getProject,
        getProjects,
        createProject,
        deleteProject,
        updateProject,
    };
});
