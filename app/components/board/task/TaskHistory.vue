<template>
    <div class="task-history">
        <div class="history-header">
            <h3>History</h3>
            <button type="button" class="history-refresh" @click="fetchHistory">
                <Icon name="carbon:renew" size="14" />
                <span>Refresh</span>
            </button>
        </div>

        <div v-if="loading" class="state">
            <Icon name="carbon:renew" size="18" class="spinning" />
            <span>Loading history...</span>
        </div>

        <div v-else-if="error" class="state error">
            <Icon name="carbon:warning" size="16" />
            <span>{{ error }}</span>
        </div>

        <div v-else-if="items.length === 0" class="state empty">
            No history yet.
        </div>

        <div v-else class="history-table-wrap">
            <table class="history-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Message</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(entry, index) in items" :key="getHistoryKey(entry, index)">
                        <td>{{ getActorName(entry) }}</td>
                        <td>{{ toMessage(entry, index) }}</td>
                        <td>{{ formatTime(getHistoryDate(entry)) || 'Unknown date' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import formatTime from '~/utils/formatTime';

const props = defineProps({
    taskId: {
        type: [Number, String],
        required: true,
    },
});

const route = useRoute();
const { $api } = useNuxtApp();
const projectUsersStore = useProjectUsersStore();
const statusStore = useStatusStore();
const sprintStore = useSprintStore();

const items = ref([]);
const loading = ref(false);
const error = ref('');

const toHistoryArray = (response) => {
    if (Array.isArray(response)) {
        return response;
    }
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response?.items)) {
        return response.items;
    }
    if (Array.isArray(response?.history)) {
        return response.history;
    }
    return [];
};

const ensureReferenceData = async () => {
    const projectId = Number(route.params.id);
    if (!projectId) {
        return;
    }

    const requests = [];

    if (Number(projectUsersStore.currentProjectId) !== projectId || projectUsersStore.projectUsers.length === 0) {
        requests.push(projectUsersStore.fetchProjectUsers(projectId));
    }

    if (Number(statusStore.currentProjectId) !== projectId || statusStore.statuses.length === 0) {
        requests.push(statusStore.fetchStatuses(projectId));
    }

    if (sprintStore.currentProjectId !== projectId || sprintStore.sprints.length === 0) {
        requests.push(sprintStore.fetchProjectSprints(projectId));
    }

    if (requests.length > 0) {
        await Promise.allSettled(requests);
    }
};

const fetchHistory = async () => {
    if (!props.taskId) {
        items.value = [];
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        await ensureReferenceData();
        const response = await $api(`/tasks/${props.taskId}/history`);
        items.value = toHistoryArray(response);
    } catch (err) {
        items.value = [];
        error.value = 'Failed to load history';
    } finally {
        loading.value = false;
    }
};

const getHistoryDate = (entry) => {
    return entry?.createdAt || entry?.timestamp || entry?.date || entry?.updatedAt || '';
};

const getHistoryKey = (entry, index) => {
    return entry?.id || entry?._id || entry?.historyId || `${getHistoryDate(entry)}-${index}`;
};

const getStatusTitle = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric <= 0) {
        return 'To Do';
    }

    const status = statusStore.getStatusById(numeric);
    if (status?.title) {
        return status.title;
    }

    return `Status #${numeric}`;
};

const getSprintTitle = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric <= 0) {
        return 'Backlog';
    }

    const sprint = sprintStore.sprints.find((item) => item.id === numeric);
    if (sprint?.number) {
        return `Sprint #${sprint.number}`;
    }

    return `Sprint #${numeric}`;
};

const getAssigneeTitle = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric <= 0) {
        return 'No assignee';
    }

    const user = projectUsersStore.getUserById(numeric);
    if (user?.name) {
        return user.name;
    }

    return `User #${numeric}`;
};

const formatHistoryValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
        return 'empty';
    }

    if (field === 'status_id' || field === 'statusId') {
        return getStatusTitle(value);
    }

    if (field === 'sprint_id' || field === 'sprintId') {
        return getSprintTitle(value);
    }

    if (field === 'assignee_id' || field === 'assigneeId' || field === 'assignee') {
        return getAssigneeTitle(value);
    }

    if (typeof value === 'object') {
        if (value.name) return value.name;
        if (value.title) return value.title;
        if (value.label) return value.label;
        if (value.id) return `#${value.id}`;
        try {
            return JSON.stringify(value);
        } catch (err) {
            return 'updated';
        }
    }

    return String(value);
};

const humanizeField = (field) => {
    if (!field) {
        return 'Field';
    }

    const map = {
        create: 'Task',
        delete: 'Task',
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

    if (map[field]) {
        return map[field];
    }

    return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^\w/, (char) => char.toUpperCase());
};

const getPreviousStatusValue = (index) => {
    for (let i = index - 1; i >= 0; i -= 1) {
        const previous = items.value[i];
        if (!previous) {
            continue;
        }
        if (previous.field === 'status_id' || previous.field === 'statusId') {
            const value = previous.newValue ?? previous.to ?? previous.statusId;
            if (value !== null && value !== undefined && value !== '') {
                return value;
            }
        }
    }
    return null;
};

const hasHistoryValue = (value) => value !== null && value !== undefined && value !== '';

const toMessage = (entry, index) => {
    if (!entry) {
        return 'Task updated';
    }

    if (entry.field === 'create') {
        return 'Task created';
    }

    if (entry.field === 'delete') {
        return 'Task deleted';
    }

    if (entry.field === 'comment') {
        const hasOld = hasHistoryValue(entry.oldValue);
        const hasNew = hasHistoryValue(entry.newValue);

        if (!hasOld && hasNew) {
            return 'Comment added';
        }

        if (hasOld && !hasNew) {
            return 'Comment deleted';
        }

        return 'Comment updated';
    }

    if (entry.field) {
        const fieldLabel = humanizeField(entry.field);
        const hasOld = hasHistoryValue(entry.oldValue);
        const hasNew = hasHistoryValue(entry.newValue);

        if (
            (entry.field === 'status_id' || entry.field === 'statusId') &&
            (!hasOld || entry.oldValue === '0') &&
            hasNew
        ) {
            const inferredOld = getPreviousStatusValue(index);
            if (inferredOld !== null) {
                return `${fieldLabel} changed from ${formatHistoryValue(entry.field, inferredOld)} to ${formatHistoryValue(
                    entry.field,
                    entry.newValue,
                )}`;
            }
        }

        if (!hasOld && hasNew) {
            return `${fieldLabel} set to ${formatHistoryValue(entry.field, entry.newValue)}`;
        }

        if (hasOld && !hasNew) {
            return `${fieldLabel} cleared`;
        }

        if (hasOld || hasNew) {
            return `${fieldLabel} changed from ${formatHistoryValue(
                entry.field,
                entry.oldValue,
            )} to ${formatHistoryValue(entry.field, entry.newValue)}`;
        }

        return `${fieldLabel} updated`;
    }

    if (entry.message) {
        return entry.message;
    }

    if (entry.description) {
        return entry.description;
    }

    if (entry.event) {
        return entry.event;
    }

    return 'Task updated';
};

const getActorName = (entry) => {
    if (entry?.actorId !== null && entry?.actorId !== undefined) {
        const actorId = Number(entry.actorId);
        const user = projectUsersStore.getUserById(Number.isNaN(actorId) ? entry.actorId : actorId);
        if (user?.name) {
            return user.name;
        }
        return `User #${entry.actorId}`;
    }

    return (
        entry?.user?.name ||
        entry?.actor?.name ||
        entry?.changedBy?.name ||
        entry?.author?.name ||
        entry?.by ||
        'Unknown'
    );
};

watch(
    () => props.taskId,
    () => {
        fetchHistory();
    },
    { immediate: true },
);
</script>

<style scoped>
.task-history {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.history-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--surface-900);
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

.history-table-wrap {
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    overflow: hidden;
    background: white;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
}

.history-table th,
.history-table td {
    text-align: left;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--surface-700);
    vertical-align: top;
}

.history-table th {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-200);
    color: var(--surface-600);
}

.history-table tbody tr + tr td {
    border-top: 1px solid var(--surface-100);
}

.history-table td:nth-child(1) {
    width: 30%;
    font-weight: 600;
}

.history-table td:nth-child(2) {
    width: 45%;
}

.history-table td:nth-child(3) {
    width: 25%;
    white-space: nowrap;
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
    .history-table th,
    .history-table td {
        padding: 10px;
        font-size: 12px;
    }

    .history-table td:nth-child(3) {
        white-space: normal;
    }
}
</style>
