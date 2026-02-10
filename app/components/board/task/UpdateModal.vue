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
                            <div class="history-section">
                                <div class="history-header">
                                    <label class="form-label">History</label>
                                    <button class="history-refresh" type="button" @click="refreshHistory">
                                        <Icon name="carbon:renew" size="14" />
                                        <span>Refresh</span>
                                    </button>
                                </div>
                                <div v-if="historyLoading" class="history-state">
                                    <Icon name="carbon:renew" size="18" class="spinning" />
                                    <span>Loading history...</span>
                                </div>
                                <div v-else-if="historyError" class="history-state error">
                                    <Icon name="carbon:warning" size="16" />
                                    <span>{{ historyError }}</span>
                                </div>
                                <div v-else-if="historyItems.length === 0" class="history-empty">
                                    No history yet.
                                </div>
                                <ul v-else class="history-list">
                                    <li v-for="(entry, index) in historyItems" :key="getHistoryKey(entry, index)"
                                        class="history-item">
                                        <div class="history-dot"></div>
                                        <div class="history-content">
                                            <div class="history-line">
                                                <span class="history-message">{{ getHistoryMessage(entry, index)
                                                    }}</span>
                                            </div>
                                            <div class="history-meta">
                                                <span v-if="getHistoryActor(entry)" class="history-actor">
                                                    {{ getHistoryActor(entry) }}
                                                </span>
                                                <span v-if="getHistoryDate(entry)">
                                                    {{ formatRelativeTime(getHistoryDate(entry)) }}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
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
const historyItems = ref([]);
const historyLoading = ref(false);
const historyError = ref('');

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

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
};

const formatHistoryValue = (value) => {
    if (value === null || value === undefined || value === '') return 'empty';
    if (typeof value === 'object') {
        if (value.name) return value.name;
        if (value.title) return value.title;
        if (value.label) return value.label;
        if (value.id) return `#${value.id}`;
        try {
            return JSON.stringify(value);
        } catch (error) {
            return 'updated';
        }
    }
    return String(value);
};
const formatHistoryValueForField = (field, value) => {
    if (field === 'status_id' || field === 'statusId') {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
            if (numeric === 0) return 'To Do';
            const status = statusStore.getStatusById(numeric);
            if (status?.title) return status.title;
            const map = {
                1: 'To Do',
                2: 'In Progress',
                3: 'Done',
            };
            if (map[numeric]) return map[numeric];
        }
        return value === null || value === undefined || value === '' || value === '0' ? 'empty' : String(value);
    }
    if (field === 'sprint_id' || field === 'sprintId') {
        const numeric = Number(value);
        if (Number.isNaN(numeric) || numeric <= 0) {
            return 'Backlog';
        }

        const sprint = sprintStore.sprints.find((item) => item.id === numeric);
        if (sprint?.number) {
            return `Sprint #${sprint.number}`;
        }

        return `Sprint #${numeric}`;
    }
    return formatHistoryValue(value);
};

const getHistoryActor = (entry) => {
    if (entry?.actorId) {
        const user = projectUsersStore.getUserById(entry.actorId);
        if (user?.name) return user.name;
        return `User #${entry.actorId}`;
    }
    return (
        entry?.user?.name ||
        entry?.actor?.name ||
        entry?.changedBy?.name ||
        entry?.author?.name ||
        entry?.by ||
        ''
    );
};

const getHistoryDate = (entry) => {
    return entry?.createdAt || entry?.timestamp || entry?.date || entry?.updatedAt || '';
};

const humanizeField = (field) => {
    if (!field) return '';
    const map = {
        create: 'Task created',
        delete: 'Task deleted',
        comment: 'Comment',
        title: 'Title',
        description: 'Description',
        type: 'Type',
        priority: 'Priority',
        assignee_id: 'Assignee',
        assigneeId: 'Assignee',
        assignee: 'Assignee',
        status_id: 'Status',
        statusId: 'Status',
        sprint_id: 'Sprint',
        sprintId: 'Sprint',
        dueDate: 'Due date',
        story_point: 'Story points',
        storyPoint: 'Story points',
    };
    if (map[field]) return map[field];
    return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
};

const getPreviousStatusValue = (index) => {
    for (let i = index - 1; i >= 0; i -= 1) {
        const prev = historyItems.value[i];
        if (!prev) continue;
        if (prev.field === 'status_id' || prev.field === 'statusId') {
            const val = prev.newValue ?? prev.to ?? prev.statusId;
            if (val !== null && val !== undefined && val !== '') {
                return val;
            }
        }
    }
    return null;
};
const getHistoryMessage = (entry, index) => {
    if (!entry) return 'Task updated';
    if (entry.field === 'create') return 'Task created';
    if (entry.field === 'delete') return 'Task deleted';
    if (entry.field === 'comment') return 'Comment updated';
    if (entry.field) {
        const fieldLabel = humanizeField(entry.field);
        const hasOld = entry.oldValue !== null && entry.oldValue !== undefined && entry.oldValue !== '';
        const hasNew = entry.newValue !== null && entry.newValue !== undefined && entry.newValue !== '';
        if (
            (entry.field === 'status_id' || entry.field === 'statusId') &&
            (!hasOld || entry.oldValue === '0') &&
            hasNew
        ) {
            const inferredOld = getPreviousStatusValue(index);
            if (inferredOld !== null) {
                return `${fieldLabel} changed from ${formatHistoryValueForField(
                    entry.field,
                    inferredOld,
                )} to ${formatHistoryValueForField(entry.field, entry.newValue)}`;
            }
        }
        if (!hasOld && hasNew) {
            return `${fieldLabel} set to ${formatHistoryValueForField(entry.field, entry.newValue)}`;
        }
        if (hasOld && !hasNew) {
            return `${fieldLabel} cleared`;
        }
        if (hasOld || hasNew) {
            return `${fieldLabel} changed from ${formatHistoryValueForField(
                entry.field,
                entry.oldValue,
            )} to ${formatHistoryValueForField(entry.field, entry.newValue)}`;
        }
        return `${fieldLabel} updated`;
    }
    if (entry.message) return entry.message;
    if (entry.description) return entry.description;
    if (entry.event) return entry.event;
    if (Array.isArray(entry.changes) && entry.changes.length > 0) {
        const parts = entry.changes.slice(0, 2).map((change) => {
            const field = humanizeField(change.field || change.key || change.name || '');
            if ('from' in change || 'to' in change) {
                return `${field} changed from ${formatHistoryValue(change.from)} to ${formatHistoryValue(
                    change.to,
                )}`;
            }
            return field ? `${field} updated` : 'Task updated';
        });
        return parts.join(' - ');
    }
    if (entry.field && ('from' in entry || 'to' in entry)) {
        return `${humanizeField(entry.field)} changed from ${formatHistoryValue(entry.from)} to ${formatHistoryValue(
            entry.to,
        )}`;
    }
    if (entry.action && entry.field) return `${humanizeField(entry.field)} ${entry.action}`;
    if (entry.action) return entry.action;
    return 'Task updated';
};

const getHistoryKey = (entry, index) => {
    return entry?.id || entry?._id || entry?.historyId || entry?.createdAt || entry?.timestamp || index;
};

const ensureStatusesLoaded = async () => {
    if (!route.params.id) return;
    if (statusStore.isLoading) return;
    if (statusStore.statuses.length > 0) return;
    try {
        await statusStore.fetchStatuses(route.params.id);
    } catch (error) {

    }
};

const ensureSprintsLoaded = async () => {
    if (!route.params.id) return;
    if (sprintStore.isLoading) return;

    const projectId = Number(route.params.id);
    if (sprintStore.currentProjectId === projectId && sprintStore.sprints.length > 0) return;

    try {
        await sprintStore.fetchProjectSprints(projectId);
    } catch (error) {
        // Sprint loading errors are surfaced through sprintStore.error on sprint screens.
    }
};

const fetchHistory = async () => {
    if (!props.task?.id) return;
    await Promise.all([ensureStatusesLoaded(), ensureSprintsLoaded()]);
    historyLoading.value = true;
    historyError.value = '';
    try {
        const response = await taskStore.getTaskHistory(props.task.id);
        const items = Array.isArray(response)
            ? response
            : response?.items || response?.data || response?.history || [];
        historyItems.value = Array.isArray(items) ? items : [];
    } catch (error) {
        historyError.value = taskStore.historyError || 'Failed to load history';
    } finally {
        historyLoading.value = false;
    }
};

const refreshHistory = async () => {
    await fetchHistory();
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

        const response = await taskStore.updateTask(props.task.id, requestBody);

        console.log('Task update response:', response);

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
                await Promise.all([loadFormData(), fetchHistory()]);
            }
        } else {
            if (oldIsOpen) {
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

.history-section {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--surface-200);
}

.history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.history-refresh {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--surface-600);
    border: 1px solid var(--surface-200);
    background: white;
    border-radius: 999px;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.history-refresh:hover {
    color: var(--surface-900);
    border-color: var(--surface-300);
    background: var(--surface-50);
}

.history-state {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--surface-500);
    padding: 12px;
    border: 1px dashed var(--surface-200);
    border-radius: 8px;
}

.history-state.error {
    color: #dc2626;
    border-color: #fecaca;
    background: #fef2f2;
}

.history-empty {
    font-size: 13px;
    color: var(--surface-400);
    padding: 12px;
    border: 1px dashed var(--surface-200);
    border-radius: 8px;
}

.history-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.history-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary-400);
    margin-top: 6px;
    flex-shrink: 0;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.history-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    background: white;
}

.history-message {
    font-size: 13px;
    color: var(--surface-800);
    font-weight: 600;
}

.history-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 11px;
    color: var(--surface-500);
}

.history-actor {
    font-weight: 600;
    color: var(--surface-700);
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
