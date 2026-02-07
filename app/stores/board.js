export const useBoardStore = defineStore('board', () => {
    const board = ref([]);
    const selectedTask = ref(null);
    const isCreateModalOpen = ref(false);
    const isDetailModalOpen = ref(false);
    const isUpdateModalOpen = ref(false);
    const selectedStatusId = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const getBoard = async (route) => {
        isLoading.value = true;
        error.value = null;
        try {
            const res = await useApi(`projects/${route.params.id}/board`);
            board.value = res.data.value || [];
        } catch (err) {
            error.value = 'Failed to load board data';
            console.error('Board fetch error:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const createTask = async (projectId, statusId, taskData) => {
        try {
            const { $api } = useNuxtApp();
            const res = await $api(`projects/${projectId}/tasks`, {
                method: 'POST',
                body: {
                    ...taskData,
                    statusId,
                },
            });
            const column = board.value.find((col) => col.statusId === statusId);
            if (column && res) {
                if (!column.tasks) column.tasks = [];
                column.tasks.push(res);
            }
            return res;
        } catch (err) {
            error.value = 'Failed to create task';
            console.error('Task creation error:', err);
            throw err;
        }
    };
    const updateTask = async (projectId, taskId, updates) => {
        try {
            const { $api } = useNuxtApp();
            const res = await $api(`projects/${projectId}/tasks/${taskId}`, {
                method: 'PUT',
                body: updates,
            });
            board.value.forEach((column) => {
                if (column.tasks) {
                    const taskIndex = column.tasks.findIndex((t) => t.id === taskId);
                    if (taskIndex !== -1) {
                        column.tasks[taskIndex] = { ...column.tasks[taskIndex], ...updates };
                    }
                }
            });
            return res;
        } catch (err) {
            error.value = 'Failed to update task';
            console.error('Task update error:', err);
            throw err;
        }
    };
    const deleteTask = async (projectId, taskId) => {
        try {
            const { $api } = useNuxtApp();
            await $api(`projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            board.value.forEach((column) => {
                if (column.tasks) {
                    column.tasks = column.tasks.filter((t) => t.id !== taskId);
                }
            });
        } catch (err) {
            error.value = 'Failed to delete task';
            console.error('Task deletion error:', err);
            throw err;
        }
    };
    const moveTask = async (projectId, taskId, fromStatusId, toStatusId) => {
        if (fromStatusId === toStatusId) return;
        try {
            const fromColumn = board.value.find((col) => col.statusId === fromStatusId);
            const toColumn = board.value.find((col) => col.statusId === toStatusId);
            console.log(projectId);
            if (!fromColumn || !toColumn) return;
            const taskIndex = fromColumn.tasks?.findIndex((t) => t.id === taskId);
            if (taskIndex === -1 || taskIndex === undefined) return;
            const task = fromColumn.tasks[taskIndex];
            fromColumn.tasks.splice(taskIndex, 1);
            if (!toColumn.tasks) toColumn.tasks = [];
            toColumn.tasks.push({ ...task, statusId: toStatusId });
            const { $api } = useNuxtApp();
            await $api(`/tasks/${taskId}/move`, {
                method: 'PATCH',
                body: { statusId: toStatusId },
            });
        } catch (err) {
            error.value = 'Failed to move task';
            console.error('Task move error:', err);
            throw err;
        }
    };
    const openCreateModal = (statusId) => {
        selectedStatusId.value = statusId;
        isCreateModalOpen.value = true;
    };
    const openDetailModal = (task) => {
        selectedTask.value = task;
        isDetailModalOpen.value = true;
    };
    const openUpdateModal = (task) => {
        selectedTask.value = task;
        isUpdateModalOpen.value = true;
    };
    const closeModals = () => {
        isCreateModalOpen.value = false;
        isDetailModalOpen.value = false;
        isUpdateModalOpen.value = false;
        selectedTask.value = null;
        selectedStatusId.value = null;
    };
    return {
        board,
        selectedTask,
        isCreateModalOpen,
        isDetailModalOpen,
        isUpdateModalOpen,
        selectedStatusId,
        isLoading,
        error,
        getBoard,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        openCreateModal,
        openDetailModal,
        openUpdateModal,
        closeModals,
    };
});
