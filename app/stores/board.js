export const useBoardStore = defineStore('board', () => {
    const board = ref([]);
    const selectedTask = ref(null);
    const isCreateModalOpen = ref(false);
    const isDetailModalOpen = ref(false);
    const isUpdateModalOpen = ref(false);
    const selectedStatusId = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const resolveProjectId = (routeOrProjectId) => {
        if (routeOrProjectId && typeof routeOrProjectId === 'object') {
            return routeOrProjectId.params?.id;
        }

        return routeOrProjectId;
    };

    const sortTasksByRank = (tasks = []) => {
        return [...tasks].sort((a, b) => {
            const aRank = a?.rank;
            const bRank = b?.rank;

            if (!aRank && !bRank) {
                return (a?.id || 0) - (b?.id || 0);
            }
            if (!aRank) return 1;
            if (!bRank) return -1;

            if (aRank === bRank) {
                return (a?.id || 0) - (b?.id || 0);
            }

            return aRank.localeCompare(bRank);
        });
    };

    const normalizeBoard = (columns = []) => {
        return columns.map((column) => ({
            ...column,
            tasks: sortTasksByRank(column.tasks || []),
        }));
    };

    const resolveTaskRank = async (task) => {
        if (!task?.id) return '';
        if (task.rank) return task.rank;

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/tasks/${task.id}`);
            const rank = response?.rank || '';
            if (rank) {
                task.rank = rank;
            }
            return rank;
        } catch (error) {
            return '';
        }
    };

    const getBoard = async (routeOrProjectId) => {
        const projectId = resolveProjectId(routeOrProjectId);
        if (!projectId) {
            board.value = [];
            return;
        }

        isLoading.value = true;
        error.value = null;
        try {
            const { $api } = useNuxtApp();
            const res = await $api(`/projects/${projectId}/board`);
            board.value = normalizeBoard(res || []);
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
            const res = await $api(`/projects/${projectId}/tasks`, {
                method: 'POST',
                body: {
                    ...taskData,
                    statusId,
                },
            });

            await getBoard(projectId);
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
            const res = await $api(`/tasks/${taskId}`, {
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
            await $api(`/tasks/${taskId}`, {
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

    const moveTask = async (projectId, taskId, fromStatusId, toStatusId, dropIndex) => {
        const fromColumn = board.value.find((col) => col.statusId === fromStatusId);
        const toColumn = board.value.find((col) => col.statusId === toStatusId);
        if (!fromColumn || !toColumn) return;

        const fromTasks = [...(fromColumn.tasks || [])];
        const toTasks = [...(toColumn.tasks || [])];
        const fromIndex = fromTasks.findIndex((t) => t.id === taskId);
        if (fromIndex < 0) return;

        const movedTask = fromTasks[fromIndex];
        const isSameColumn = fromStatusId === toStatusId;
        const targetTasks = isSameColumn ? [...fromTasks] : [...toTasks];

        if (isSameColumn) {
            targetTasks.splice(fromIndex, 1);
        }

        let insertIndex = Number.isInteger(dropIndex) ? dropIndex : targetTasks.length;
        insertIndex = Math.max(0, Math.min(insertIndex, targetTasks.length));

        if (isSameColumn && fromIndex < insertIndex) {
            insertIndex -= 1;
        }

        if (isSameColumn && insertIndex === fromIndex) {
            return;
        }

        const leftTask = targetTasks[insertIndex - 1];
        const rightTask = targetTasks[insertIndex];
        const [leftTaskRank, rightTaskRank] = await Promise.all([
            resolveTaskRank(leftTask),
            resolveTaskRank(rightTask),
        ]);

        if (isSameColumn) {
            const updatedTasks = [...targetTasks];
            updatedTasks.splice(insertIndex, 0, movedTask);
            fromColumn.tasks = updatedTasks;
        } else {
            const updatedFromTasks = [...fromTasks];
            updatedFromTasks.splice(fromIndex, 1);
            fromColumn.tasks = updatedFromTasks;

            const updatedToTasks = [...toTasks];
            updatedToTasks.splice(insertIndex, 0, { ...movedTask, statusId: toStatusId });
            toColumn.tasks = updatedToTasks;
        }

        try {
            const { $api } = useNuxtApp();
            await $api(`/tasks/${taskId}/move`, {
                method: 'PATCH',
                body: {
                    statusId: toStatusId,
                    leftTaskRank,
                    rightTaskRank,
                },
            });

            await getBoard(projectId);
        } catch (err) {
            fromColumn.tasks = fromTasks;
            if (!isSameColumn) {
                toColumn.tasks = toTasks;
            }

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
