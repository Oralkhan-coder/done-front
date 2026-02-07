export const useBoardStore = defineStore('board', () => {
    const board = ref([]);
    const selectedTask = ref(null);
    const isCreateModalOpen = ref(false);
    const isDetailModalOpen = ref(false);
    const isUpdateModalOpen = ref(false);
    const selectedStatusId = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const findColumnByStatusId = (statusId) => {
        return board.value.find((column) => Number(column.statusId) === Number(statusId));
    };

    const removeTaskFromColumn = (statusId, taskId) => {
        const column = findColumnByStatusId(statusId);
        if (!column?.tasks) return null;

        const taskIndex = column.tasks.findIndex((task) => Number(task.id) === Number(taskId));
        if (taskIndex === -1) return null;

        const [task] = column.tasks.splice(taskIndex, 1);
        return { task, taskIndex };
    };

    const insertTaskToColumn = (statusId, task, targetIndex = null) => {
        const column = findColumnByStatusId(statusId);
        if (!column) return;

        if (!Array.isArray(column.tasks)) {
            column.tasks = [];
        }

        const safeIndex =
            Number.isFinite(Number(targetIndex)) && Number(targetIndex) >= 0
                ? Math.min(Number(targetIndex), column.tasks.length)
                : column.tasks.length;

        column.tasks.splice(safeIndex, 0, task);
    };

    const syncStatusesFromBoard = () => {
        const statusStore = useStatusStore();
        statusStore.setFromBoard(board.value);
    };

    const getBoard = async (route) => {
        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const data = await $api(`/projects/${route.params.id}/board`);
            board.value = data || [];
            syncStatusesFromBoard();
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to load board data';
        } finally {
            isLoading.value = false;
        }
    };

    const createTask = async (projectId, statusId, taskData) => {
        error.value = null;

        try {
            const taskStore = useTaskStore();
            const createdTask = await taskStore.createTask(projectId, {
                ...taskData,
                statusId,
            });

            insertTaskToColumn(statusId, {
                ...createdTask,
                statusId: Number(createdTask?.statusId ?? statusId),
            }, 0);

            return createdTask;
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to create task';
            throw err;
        }
    };

    const updateTask = async (_projectId, taskId, updates) => {
        error.value = null;

        try {
            const taskStore = useTaskStore();
            const updated = await taskStore.updateTask(taskId, updates);

            const nextStatusId = Number(updates?.statusId ?? updated?.statusId);
            let sourceStatusId = null;
            let sourceTask = null;

            for (const column of board.value) {
                if (!Array.isArray(column.tasks)) continue;
                const taskIndex = column.tasks.findIndex((task) => Number(task.id) === Number(taskId));
                if (taskIndex === -1) continue;

                sourceStatusId = Number(column.statusId);
                sourceTask = column.tasks[taskIndex];

                if (Number.isFinite(nextStatusId) && nextStatusId !== sourceStatusId) {
                    column.tasks.splice(taskIndex, 1);
                    insertTaskToColumn(nextStatusId, {
                        ...sourceTask,
                        ...updates,
                        ...updated,
                        statusId: nextStatusId,
                    }, 0);
                } else {
                    column.tasks[taskIndex] = {
                        ...sourceTask,
                        ...updates,
                        ...updated,
                    };
                }

                break;
            }

            return updated;
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to update task';
            throw err;
        }
    };

    const deleteTask = async (_projectId, taskId) => {
        error.value = null;

        try {
            const taskStore = useTaskStore();
            await taskStore.deleteTask(taskId);

            board.value.forEach((column) => {
                if (!Array.isArray(column.tasks)) return;
                column.tasks = column.tasks.filter((task) => Number(task.id) !== Number(taskId));
            });
        } catch (err) {
            error.value = err?.response?._data?.message || err?.message || 'Failed to delete task';
            throw err;
        }
    };

    const reorderTaskLocally = (statusId, taskId, toIndex = null) => {
        const moved = removeTaskFromColumn(statusId, taskId);
        if (!moved?.task) return;

        let nextIndex = toIndex;
        if (Number.isFinite(Number(toIndex)) && Number(toIndex) > moved.taskIndex) {
            nextIndex = Number(toIndex) - 1;
        }

        insertTaskToColumn(statusId, moved.task, nextIndex);
    };

    const moveTask = async (_projectId, taskId, fromStatusId, toStatusId, toIndex = null) => {
        error.value = null;

        const fromColumn = findColumnByStatusId(fromStatusId);
        const toColumn = findColumnByStatusId(toStatusId);

        if (!fromColumn || !toColumn) return;

        if (Number(fromStatusId) === Number(toStatusId)) {
            reorderTaskLocally(fromStatusId, taskId, toIndex);
            return;
        }

        const removed = removeTaskFromColumn(fromStatusId, taskId);
        if (!removed?.task) return;

        const optimisticTask = { ...removed.task, statusId: Number(toStatusId) };
        insertTaskToColumn(toStatusId, optimisticTask, toIndex);

        try {
            const taskStore = useTaskStore();
            await taskStore.moveTask(taskId, Number(toStatusId));
        } catch (err) {
            const rolledBack = removeTaskFromColumn(toStatusId, taskId);
            if (rolledBack?.task) {
                insertTaskToColumn(fromStatusId, { ...rolledBack.task, statusId: Number(fromStatusId) }, removed.taskIndex);
            }

            error.value = err?.response?._data?.message || err?.message || 'Failed to move task';
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
        reorderTaskLocally,
        moveTask,
        openCreateModal,
        openDetailModal,
        openUpdateModal,
        closeModals,
    };
});
