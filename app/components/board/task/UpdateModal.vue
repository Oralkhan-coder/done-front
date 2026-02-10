<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen && task" class="modal-overlay" @click.self="handleClose">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">{{ formData.taskCode || 'Update Task' }}</h2>
                        <button class="close-btn" @click="handleClose">
                            <Icon name="carbon:close" size="24" />
                        </button>
                    </div>
                    <form @submit.prevent="handleSubmit" class="modal-body">
                        <div v-if="isLoadingTask" class="loading-container">
                            <Icon name="carbon:renew" size="32" class="spinning" />
                            <p>Loading task details...</p>
                        </div>
                        <template v-else>
                            <div class="form-group">
                                <label for="task-title" class="form-label required">Title</label>
                                <InputText id="task-title" v-model="formData.title" placeholder="Enter task title"
                                    class="w-full" :class="{ 'p-invalid': errors.title }" />
                                <small v-if="errors.title" class="error-message">{{ errors.title }}</small>
                            </div>
                            <div class="form-group">
                                <label for="task-description" class="form-label">Description</label>
                                <Textarea id="task-description" v-model="formData.description"
                                    placeholder="Add a description..." rows="4" class="w-full" />
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="task-status" class="form-label">Status</label>
                                    <Select id="task-status" v-model="formData.statusId" :options="statuses"
                                        optionLabel="label" optionValue="value" placeholder="Select status"
                                        class="w-full" :loading="loadingStatuses" />
                                </div>
                                <div class="form-group">
                                    <label for="task-priority" class="form-label">Priority</label>
                                    <Select id="task-priority" v-model="formData.priority" :options="priorities"
                                        optionLabel="label" optionValue="value" placeholder="Select priority"
                                        class="w-full" />
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="task-assignee" class="form-label">Assignee</label>
                                    <Select id="task-assignee" v-model="formData.assigneeId" :options="projectMembers"
                                        optionLabel="label" optionValue="value" placeholder="Select assignee"
                                        class="w-full" :loading="loadingMembers" />
                                </div>
                                <div class="form-group">
                                    <label for="task-sprint" class="form-label">Sprint</label>
                                    <Select id="task-sprint" v-model="formData.sprintId" :options="sprintOptions"
                                        optionLabel="label" optionValue="value" placeholder="Select sprint"
                                        class="w-full" :loading="loadingSprints" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="task-story-point" class="form-label">Story Points</label>
                                <InputNumber id="task-story-point" v-model="formData.storyPoint"
                                    placeholder="Enter story points" class="w-full" :min="0" />
                            </div>
                            <div class="task-activity-section">
                                <div class="task-tabs">
                                    <button
                                        type="button"
                                        class="task-tab-btn"
                                        :class="{ active: activeTab === 'comment' }"
                                        @click="activeTab = 'comment'"
                                    >
                                        Comment
                                    </button>
                                    <button
                                        type="button"
                                        class="task-tab-btn"
                                        :class="{ active: activeTab === 'history' }"
                                        @click="activeTab = 'history'"
                                    >
                                        History
                                    </button>
                                </div>
                                <div class="task-tab-panel">
                                    <TaskComments v-if="activeTab === 'comment'" :task-id="task.id" />
                                    <TaskHistory v-else :task-id="task.id" />
                                </div>
                            </div>
                            <div class="modal-actions">
                                <Button label="Cancel" severity="secondary" outlined @click="handleClose"
                                    type="button" />
                                <Button label="Update Task" icon="carbon:save" :loading="isSubmitting" type="submit"
                                    class="bg-indigo-600 border-indigo-600" />
                            </div>
                        </template>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<script setup>
import TaskComments from './TaskComments.vue';
import TaskHistory from './TaskHistory.vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    task: {
        type: Object,
        default: null,
    },
});
const emit = defineEmits(['close', 'submit']);
const route = useRoute();
const boardStore = useBoardStore();
const projectUsersStore = useProjectUsersStore();
const statusStore = useStatusStore();
const sprintStore = useSprintStore();
const taskStore = useTaskStore();

const formData = reactive({
    taskCode: '',
    title: '',
    description: '',
    statusId: null,
    priority: 'medium',
    assigneeId: null,
    storyPoint: null,
    sprintId: 0,
});

const errors = reactive({
    title: '',
});

const isSubmitting = ref(false);
const isLoadingTask = ref(false);
const activeTab = ref('comment');

const priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

const statuses = computed(() => {
    return statusStore.getStatusesForDropdown();
});

const loadingStatuses = computed(() => {
    return statusStore.isLoading;
});

const projectMembers = computed(() => {
    return projectUsersStore.getUsersForDropdown(true);
});

const loadingMembers = computed(() => {
    return projectUsersStore.isLoading;
});

const sprintOptions = computed(() => {
    return [{ label: 'Backlog (No Sprint)', value: 0 }, ...sprintStore.sprintOptions];
});

const loadingSprints = computed(() => {
    return sprintStore.isLoading;
});

const validateForm = () => {
    errors.title = '';
    if (!formData.title.trim()) {
        errors.title = 'Title is required';
        return false;
    }
    return true;
};

const loadFormData = async () => {
    if (props.task && props.task.id) {
        isLoadingTask.value = true;
        try {
            const taskDetails = await taskStore.getTaskById(props.task.id);

            formData.taskCode = taskDetails.code || '';
            formData.title = taskDetails.title || '';
            formData.description = taskDetails.description || '';
            formData.statusId = taskDetails.statusId || null;
            formData.priority = taskDetails.priority || 'medium';
            formData.assigneeId = taskDetails.assigneeId || null;
            formData.storyPoint = taskDetails.storyPoint || null;
            formData.sprintId = taskDetails.sprintId || 0;
        } catch (error) {
            console.error('Failed to load task details:', error);
            formData.taskCode = props.task.code || '';
            formData.title = props.task.title || '';
            formData.description = props.task.description || '';
            formData.statusId = props.task.statusId || null;
            formData.priority = props.task.priority || 'medium';
            formData.assigneeId = props.task.assignee?.userId || props.task.assigneeId || null;
            formData.storyPoint = props.task.storyPoint || null;
            formData.sprintId = props.task.sprintId || 0;
        } finally {
            isLoadingTask.value = false;
        }
    }
};

const resetForm = () => {
    formData.taskCode = '';
    formData.title = '';
    formData.description = '';
    formData.statusId = null;
    formData.priority = 'medium';
    formData.assigneeId = null;
    formData.storyPoint = null;
    formData.sprintId = 0;
    errors.title = '';
};

const handleClose = () => {
    activeTab.value = 'comment';
    resetForm();
    boardStore.closeModals();
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;
    try {
        const normalizedSprintId = Number(formData.sprintId) > 0 ? Number(formData.sprintId) : 0;
        const requestBody = {
            title: formData.title,
            description: formData.description || '',
            statusId: formData.statusId,
            priority: formData.priority,
            sprintId: normalizedSprintId,
        };

        if (formData.assigneeId !== null && formData.assigneeId !== undefined) {
            requestBody.assigneeId = formData.assigneeId;
        }
        if (formData.storyPoint !== null && formData.storyPoint !== undefined) {
            requestBody.storyPoint = formData.storyPoint;
        }

        await taskStore.updateTask(props.task.id, requestBody);

        const oldStatusId = props.task.statusId;
        const newStatusId = formData.statusId;


        if (oldStatusId !== newStatusId) {
            const fromColumn = boardStore.board.find((col) => col.statusId === oldStatusId);
            const toColumn = boardStore.board.find((col) => col.statusId === newStatusId);

            if (fromColumn && toColumn) {
                const taskIndex = fromColumn.tasks?.findIndex((t) => t.id === props.task.id);
                if (taskIndex !== -1 && taskIndex !== undefined) {
                    const task = fromColumn.tasks[taskIndex];
                    fromColumn.tasks.splice(taskIndex, 1);

                    if (!toColumn.tasks) toColumn.tasks = [];
                    toColumn.tasks.push({
                        ...task,
                        ...requestBody,
                        sprintId: normalizedSprintId || null,
                        assignee: formData.assigneeId
                            ? projectUsersStore.getUserById(formData.assigneeId)
                            : null,
                    });
                }
            }
        } else {
            boardStore.board.forEach((column) => {
                if (column.tasks) {
                    const taskIndex = column.tasks.findIndex((t) => t.id === props.task.id);
                    if (taskIndex !== -1) {
                        column.tasks[taskIndex] = {
                            ...column.tasks[taskIndex],
                            ...requestBody,
                            sprintId: normalizedSprintId || null,
                            assignee: formData.assigneeId
                                ? projectUsersStore.getUserById(formData.assigneeId)
                                : null,
                        };
                    }
                }
            });
        }

        resetForm();
        boardStore.closeModals();
    } catch (error) {
        console.error('Failed to update task:', error);
    } finally {
        isSubmitting.value = false;
    }
};

watch(
    [() => props.isOpen, () => props.task],
    async ([newIsOpen, newTask], [oldIsOpen, oldTask]) => {
        if (newIsOpen) {

            const isJustOpened = !oldIsOpen;
            const isTaskChanged = newTask?.id !== oldTask?.id;

            if (isJustOpened && route.params.id) {
                try {
                    await Promise.all([
                        projectUsersStore.fetchProjectUsers(route.params.id),
                        statusStore.fetchStatuses(route.params.id),
                        sprintStore.fetchProjectSprints(route.params.id),
                    ]);
                } catch (error) {
                    // Keep modal usable even if some side data fails to load.
                }
            }

            if (isJustOpened || isTaskChanged) {
                activeTab.value = 'comment';
                await loadFormData();
            }
        } else {
            if (oldIsOpen) {
                activeTab.value = 'comment';
                resetForm();
            }
        }
    },
    { immediate: true },
);
</script>
<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
}

.modal-container {
    background: white;
    border-radius: 16px;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid var(--surface-200);
}

.modal-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0;
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--surface-500);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: var(--surface-100);
    color: var(--surface-900);
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--surface-700);
    margin-bottom: 8px;
}

.form-label.required::after {
    content: ' *';
    color: #ef4444;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.error-message {
    display: block;
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
}

.modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--surface-200);
}

.task-activity-section {
    margin-top: 8px;
    border: 1px solid var(--surface-200);
    border-radius: 12px;
    background: var(--surface-0);
}

.task-tabs {
    display: inline-flex;
    align-items: center;
    border-bottom: 1px solid var(--surface-200);
    width: 100%;
    padding: 10px 12px 0 12px;
    gap: 8px;
}

.task-tab-btn {
    border: 1px solid #2563eb;
    border-bottom: none;
    background: white;
    color: #2563eb;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.task-tab-btn:hover {
    background: #eff6ff;
}

.task-tab-btn.active {
    background: #2563eb;
    color: white;
    box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.45);
}

.task-tab-panel {
    padding: 14px 12px 12px 12px;
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
    transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-container {
    transform: scale(0.95) translateY(-20px);
}

.modal-leave-to .modal-container {
    transform: scale(0.95) translateY(20px);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--surface-500);
}

.loading-container p {
    margin-top: 16px;
    font-size: 14px;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 640px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>
