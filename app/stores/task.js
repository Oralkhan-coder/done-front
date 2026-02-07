export const useTaskStore = defineStore('task', () => {
    const isLoading = ref(false);
    const error = ref(null);

    const getTaskById = async (taskId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/tasks/${taskId}`);

            return response;
        } catch (err) {
            error.value = 'Failed to fetch task';
            console.error('Task fetch error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateTask = async (taskId, updates) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/tasks/${taskId}`, {
                method: 'PUT',
                body: updates,
            });

            return response;
        } catch (err) {
            error.value = 'Failed to update task';
            console.error('Task update error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createTask = async (projectId, taskData) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/projects/${projectId}/tasks`, {
                method: 'POST',
                body: taskData,
            });

            return response;
        } catch (err) {
            error.value = 'Failed to create task';
            console.error('Task creation error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteTask = async (taskId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            await $api(`/tasks/${taskId}`, {
                method: 'DELETE',
            });
        } catch (err) {
            error.value = 'Failed to delete task';
            console.error('Task deletion error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const moveTask = async (taskId, statusId) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/tasks/${taskId}/move`, {
                method: 'PATCH',
                body: { statusId },
            });

            return response;
        } catch (err) {
            error.value = 'Failed to move task';
            console.error('Task move error:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        isLoading,
        error,
        getTaskById,
        updateTask,
        createTask,
        deleteTask,
        moveTask,
    };
});
