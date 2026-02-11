<template>
    <div class="backlog-page">
        <div class="backlog-header">
            <h2 class="backlog-title">Backlog Issues</h2>
            <button type="button" class="refresh-btn" :disabled="isLoading" @click="fetchBacklog">
                <Icon name="carbon:renew" size="14" :class="{ spinning: isLoading }" />
                <span>Refresh</span>
            </button>
        </div>

        <div v-if="isLoading" class="state">
            <Icon name="carbon:renew" size="18" class="spinning" />
            <span>Loading backlog...</span>
        </div>

        <div v-else-if="errorMessage" class="state error">
            <Icon name="carbon:warning" size="16" />
            <span>{{ errorMessage }}</span>
        </div>

        <div v-else class="table-wrap">
            <table class="backlog-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>StoryPoint</th>
                        <th>Labels</th>
                        <th>Parent</th>
                        <th>TypeId</th>
                        <th>CreateDate</th>
                        <th>Assignee</th>
                    </tr>
                </thead>
                <tbody v-if="rows.length > 0">
                    <tr v-for="task in rows" :key="task.id">
                        <td>{{ task.code || `TASK-${task.id}` }}</td>
                        <td>{{ task.title || '-' }}</td>
                        <td>{{ getStatusTitle(task.statusId) }}</td>
                        <td>{{ task.storyPoint > 0 ? task.storyPoint : '-' }}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>{{ resolveType(task) }}</td>
                        <td>{{ task.createdAt ? formatTime(task.createdAt) : '-' }}</td>
                        <td>{{ getAssigneeTitle(task) }}</td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr>
                        <td colspan="9" class="empty-cell">No backlog issues yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Dialog v-model:visible="showCreateModal" modal header="Create Backlog Issue" :style="{ width: '36rem' }">
            <form class="create-form" @submit.prevent="handleCreateTask">
                <div class="field">
                    <label for="title">Title</label>
                    <InputText id="title" v-model="form.title" placeholder="Issue title" class="w-full" />
                </div>

                <div class="field">
                    <label for="description">Description</label>
                    <Textarea id="description" v-model="form.description" rows="4" class="w-full" />
                </div>

                <div class="field-grid">
                    <div class="field">
                        <label for="status">Status</label>
                        <Select
                            id="status"
                            v-model="form.statusId"
                            :options="statusesForDropdown"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select status"
                            class="w-full"
                        />
                    </div>

                    <div class="field">
                        <label for="storyPoint">StoryPoint</label>
                        <InputNumber id="storyPoint" v-model="form.storyPoint" :min="0" class="w-full" />
                    </div>
                </div>

                <div class="field-grid">
                    <div class="field">
                        <label for="priority">Priority</label>
                        <Select
                            id="priority"
                            v-model="form.priority"
                            :options="priorityOptions"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                        />
                    </div>

                    <div class="field">
                        <label for="assignee">Assignee</label>
                        <Select
                            id="assignee"
                            v-model="form.assigneeId"
                            :options="assigneeOptions"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                        />
                    </div>
                </div>

                <p v-if="formError" class="form-error">{{ formError }}</p>

                <div class="actions">
                    <Button type="button" label="Cancel" severity="secondary" outlined @click="showCreateModal = false" />
                    <Button type="submit" :label="isSubmitting ? 'Creating...' : 'Create Issue'" :loading="isSubmitting" />
                </div>
            </form>
        </Dialog>
    </div>
</template>

<script setup>
import formatTime from '~/utils/formatTime';

definePageMeta({
    layout: 'projectheader',
});

const route = useRoute();
const { $api } = useNuxtApp();
const statusStore = useStatusStore();
const projectUsersStore = useProjectUsersStore();

const isLoading = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const formError = ref('');
const rows = ref([]);
const showCreateModal = ref(false);

const form = reactive({
    title: '',
    description: '',
    statusId: null,
    storyPoint: null,
    priority: 'medium',
    assigneeId: null,
});

const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

const statusesForDropdown = computed(() =>
    statusStore.statuses.map((status) => ({
        label: status.title,
        value: status.id,
    })),
);

const assigneeOptions = computed(() => projectUsersStore.getUsersForDropdown(true));

const getStatusTitle = (statusId) => {
    const status = statusStore.getStatusById(Number(statusId));
    return status?.title || `Status #${statusId}`;
};

const getAssigneeTitle = (task) => {
    const directName =
        task?.assigneeName ||
        task?.assignee?.name ||
        task?.assignee?.fullName ||
        task?.assignee?.email ||
        '';
    if (typeof directName === 'string' && directName.trim()) {
        return directName.trim();
    }

    const assigneeId = task?.assigneeId;
    if (!assigneeId) {
        return 'unassigned';
    }

    const user = projectUsersStore.getUserById(assigneeId);
    return user?.name || `User #${String(assigneeId)}`;
};

const resolveType = (task) => {
    if (typeof task?.type === 'string' && task.type.trim()) {
        return task.type.charAt(0).toUpperCase() + task.type.slice(1);
    }
    return 'Task';
};

const toTaskArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.tasks)) return response.tasks;
    return [];
};

const toHistoryArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.history)) return response.history;
    return [];
};

const parsePositiveInt = (value) => {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) {
        return null;
    }
    return numeric;
};

const resolveAssigneeIdFromHistory = async (taskId) => {
    try {
        const response = await $api(`/tasks/${taskId}/history`);
        const history = toHistoryArray(response);
        if (history.length === 0) {
            return null;
        }

        const sorted = [...history].sort((a, b) => {
            const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
            const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
            return bTime - aTime;
        });

        for (const entry of sorted) {
            const fieldName = entry?.field;
            if (fieldName !== 'assignee_id' && fieldName !== 'assigneeId' && fieldName !== 'assignee') {
                continue;
            }

            const fromNewValue = parsePositiveInt(entry?.newValue);
            if (fromNewValue) {
                return fromNewValue;
            }
        }
    } catch (error) {
        return null;
    }

    return null;
};

const normalizeTask = (task) => ({
    id: task?.id,
    code: task?.code || '',
    title: task?.title || '',
    statusId: task?.statusId || task?.statusID || 0,
    storyPoint: task?.storyPoint || 0,
    createdAt: task?.createdAt || '',
    assigneeId: task?.assigneeId || task?.assignee?.id || task?.assignee?.userId || null,
    assigneeName: task?.assignee?.name || task?.assigneeName || '',
    type: task?.type || '',
    sprintId: task?.sprintId || task?.sprintID || null,
});

const resetForm = () => {
    form.title = '';
    form.description = '';
    form.statusId = statusesForDropdown.value[0]?.value || null;
    form.storyPoint = null;
    form.priority = 'medium';
    form.assigneeId = null;
    formError.value = '';
};

const fetchBacklog = async () => {
    const projectId = Number(route.params.id);
    if (!projectId) {
        rows.value = [];
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const [tasksResult, statusesResult, usersResult] = await Promise.allSettled([
            $api(`/projects/${projectId}/tasks`),
            statusStore.fetchStatuses(projectId),
            projectUsersStore.fetchProjectUsers(projectId),
        ]);

        void statusesResult;
        void usersResult;

        if (tasksResult.status !== 'fulfilled') {
            throw tasksResult.reason;
        }

        const allTasks = toTaskArray(tasksResult.value).map(normalizeTask);
        const backlogTasks = allTasks.filter((task) => !task.sprintId || Number(task.sprintId) === 0);

        const missingAssigneeTasks = backlogTasks.filter((task) => !task.assigneeId && task.id);
        if (missingAssigneeTasks.length > 0) {
            const assigneeResults = await Promise.allSettled(
                missingAssigneeTasks.map(async (task) => ({
                    taskId: task.id,
                    assigneeId: await resolveAssigneeIdFromHistory(task.id),
                })),
            );

            const resolvedAssigneeMap = new Map();
            assigneeResults
                .filter((result) => result.status === 'fulfilled')
                .forEach((result) => {
                    if (result.value.assigneeId) {
                        resolvedAssigneeMap.set(result.value.taskId, result.value.assigneeId);
                    }
                });

            backlogTasks.forEach((task) => {
                if (!task.assigneeId && resolvedAssigneeMap.has(task.id)) {
                    task.assigneeId = resolvedAssigneeMap.get(task.id);
                }
            });
        }

        backlogTasks.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });

        rows.value = backlogTasks;

        if (!form.statusId) {
            form.statusId = statusesForDropdown.value[0]?.value || null;
        }
    } catch (error) {
        rows.value = [];
        errorMessage.value = error?.data?.message || error?.message || 'Failed to load backlog';
    } finally {
        isLoading.value = false;
    }
};

const openCreateModal = () => {
    resetForm();
    showCreateModal.value = true;
};

const handleCreateTask = async () => {
    const projectId = Number(route.params.id);
    formError.value = '';

    if (!form.title.trim()) {
        formError.value = 'Title is required.';
        return;
    }

    if (!form.statusId) {
        formError.value = 'Status is required.';
        return;
    }

    isSubmitting.value = true;
    try {
        const payload = {
            title: form.title.trim(),
            statusId: Number(form.statusId),
            priority: form.priority,
        };

        if (form.description.trim()) {
            payload.description = form.description.trim();
        }
        if (form.assigneeId) {
            payload.assigneeId = Number(form.assigneeId);
        }
        if (form.storyPoint !== null && form.storyPoint !== undefined) {
            payload.storyPoint = Number(form.storyPoint);
        }

        await $api(`/projects/${projectId}/tasks`, {
            method: 'POST',
            body: payload,
        });

        showCreateModal.value = false;
        await fetchBacklog();
    } catch (error) {
        formError.value = error?.data?.message || error?.message || 'Failed to create issue.';
    } finally {
        isSubmitting.value = false;
    }
};

await fetchBacklog();
</script>

<style scoped>
.backlog-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.backlog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.backlog-title {
    margin: 0;
    font-size: 44px;
    line-height: 1;
    color: #102a54;
    font-weight: 700;
}

.refresh-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #d8dee9;
    background: #ffffff;
    color: #243b63;
    border-radius: 12px;
    padding: 8px 14px;
    font-weight: 600;
    cursor: pointer;
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.table-wrap {
    border: 1px solid #dce3ef;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
}

.backlog-table {
    width: 100%;
    border-collapse: collapse;
}

.backlog-table th,
.backlog-table td {
    text-align: left;
    padding: 16px 18px;
    color: #2b4164;
}

.backlog-table thead th {
    background: #f2f5fa;
    border-bottom: 2px solid #2e3f59;
    font-size: 16px;
    font-weight: 700;
}

.backlog-table tbody td {
    font-size: 14px;
    border-top: 1px solid #e6ebf3;
}

.empty-cell {
    text-align: center;
    color: #6f7f99;
    font-size: 14px !important;
    padding: 24px !important;
}

.state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    border: 1px dashed var(--surface-300);
    border-radius: 8px;
    color: var(--surface-500);
    font-size: 14px;
}

.state.error {
    border-color: #fecaca;
    color: #dc2626;
    background: #fef2f2;
}

.create-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.field label {
    font-size: 13px;
    font-weight: 600;
    color: #334e7d;
}

.field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
}

.form-error {
    margin: 0;
    font-size: 13px;
    color: #dc2626;
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

@media (max-width: 1024px) {
    .backlog-title {
        font-size: 28px;
    }

    .table-wrap {
        overflow-x: auto;
    }

    .backlog-table thead th {
        font-size: 13px;
        white-space: nowrap;
    }

    .backlog-table tbody td {
        font-size: 13px;
        white-space: nowrap;
    }

}

@media (max-width: 640px) {
    .field-grid {
        grid-template-columns: 1fr;
    }
}
</style>
