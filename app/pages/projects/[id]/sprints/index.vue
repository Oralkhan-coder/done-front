<template>
    <div class="sprints-page">
        <div class="page-header">
            <Button
                label="Create New"
                icon="carbon:add"
                size="small"
                class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                @click="openCreateModal"
            />
        </div>

        <div v-if="sprintStore.activeSprint" class="info-alert warning">
            <Icon name="carbon:warning" size="18" />
            <span>
                A sprint is already started for this project (Sprint #{{ sprintStore.activeSprint.number }}).
            </span>
        </div>

        <div v-if="sprintStore.error" class="info-alert error">
            <Icon name="carbon:warning-alt" size="18" />
            <span>{{ sprintStore.error }}</span>
        </div>

        <div v-if="sprintStore.isLoading && !sprintStore.sprints.length" class="state-box">
            <Icon name="carbon:renew" size="24" class="animate-spin" />
            <span>Loading sprints...</span>
        </div>

        <div v-else class="table-wrapper">
            <table class="sprints-table">
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                        <th class="narrow"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="sprint in sprintStore.sprints" :key="sprint.id">
                        <td class="mono">#{{ sprint.number }}</td>
                        <td>{{ sprint.description || 'No description' }}</td>
                        <td>
                            <span :class="['status-chip', `status-${sprint.status || 'planned'}`]">
                                {{ getStatusLabel(sprint.status) }}
                            </span>
                        </td>
                        <td>{{ formatDisplayDate(sprint.startDate) }}</td>
                        <td>{{ formatDisplayDate(sprint.endDate) }}</td>
                        <td>
                            <div class="inline-actions">
                                <Button
                                    label="Start"
                                    icon="carbon:play-filled"
                                    size="small"
                                    class="bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700"
                                    :loading="actionLoading.startId === sprint.id"
                                    :disabled="!canStartSprint(sprint)"
                                    @click="startSprint(sprint)"
                                />
                                <Button
                                    label="Complete"
                                    icon="carbon:checkmark-filled"
                                    size="small"
                                    class="bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700"
                                    :loading="actionLoading.completeId === sprint.id"
                                    :disabled="!canCompleteSprint(sprint)"
                                    @click="completeSprint(sprint)"
                                />
                            </div>
                        </td>
                        <td>
                            <div class="icon-actions">
                                <button
                                    class="icon-btn"
                                    type="button"
                                    title="Edit sprint"
                                    @click="openEditModal(sprint)"
                                >
                                    <Icon name="carbon:edit" size="18" />
                                </button>
                                <button
                                    class="icon-btn danger"
                                    type="button"
                                    title="Delete sprint"
                                    :disabled="actionLoading.deleteId === sprint.id"
                                    @click="removeSprint(sprint)"
                                >
                                    <Icon
                                        :name="actionLoading.deleteId === sprint.id ? 'carbon:renew' : 'carbon:trash-can'"
                                        size="18"
                                        :class="actionLoading.deleteId === sprint.id ? 'animate-spin' : ''"
                                    />
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!sprintStore.sprints.length">
                        <td colspan="7">
                            <div class="empty-state">
                                <Icon name="carbon:timer" size="24" class="text-slate-400" />
                                <span>No sprints yet. Create your first sprint.</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Dialog
            v-model:visible="isModalOpen"
            modal
            :header="isEditMode ? 'Edit Sprint' : 'Create Sprint'"
            :style="{ width: '560px', maxWidth: '95vw' }"
            :draggable="false"
        >
            <form class="form-grid" @submit.prevent="submitForm">
                <div class="form-group">
                    <label for="description" class="form-label">Description</label>
                    <Textarea
                        id="description"
                        v-model="form.description"
                        rows="4"
                        class="w-full"
                        placeholder="Add sprint description..."
                    />
                </div>

                <div class="form-group two-col">
                    <div>
                        <label for="start-date" class="form-label required">Start Date</label>
                        <input
                            id="start-date"
                            v-model="form.startDate"
                            type="date"
                            class="date-input"
                            required
                        />
                    </div>
                    <div>
                        <label for="end-date" class="form-label required">End Date</label>
                        <input
                            id="end-date"
                            v-model="form.endDate"
                            type="date"
                            class="date-input"
                            required
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label for="status" class="form-label">Status</label>
                    <Select
                        id="status"
                        v-model="form.status"
                        :options="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                </div>

                <div v-if="formError" class="form-error">
                    {{ formError }}
                </div>

                <div class="modal-actions">
                    <Button label="Cancel" severity="secondary" outlined type="button" @click="closeModal" />
                    <Button
                        :label="isEditMode ? 'Save Changes' : 'Create Sprint'"
                        icon="carbon:save"
                        type="submit"
                        :loading="isSubmitting"
                        class="bg-indigo-600 border-indigo-600"
                    />
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
const sprintStore = useSprintStore();

const projectId = computed(() => Number(route.params.id));

const isModalOpen = ref(false);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const formError = ref('');

const actionLoading = reactive({
    startId: null,
    completeId: null,
    deleteId: null,
});

const form = reactive({
    id: null,
    description: '',
    status: 'planned',
    startDate: '',
    endDate: '',
});

const statusOptions = [
    { label: 'Planned', value: 'planned' },
    { label: 'Started', value: 'active' },
    { label: 'Completed', value: 'closed' },
];

const toInputDate = (value) => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : '';
    }

    try {
        return new Date(value).toISOString().slice(0, 10);
    } catch (error) {
        return '';
    }
};

const toApiDateTime = (value) => {
    if (!value) {
        return null;
    }
    return `${value}T00:00:00Z`;
};

const formatDisplayDate = (value) => {
    const formatted = formatTime(value);
    return formatted || '-';
};

const getStatusLabel = (status) => {
    if (status === 'active') {
        return 'Started';
    }
    if (status === 'closed') {
        return 'Completed';
    }
    return 'Planned';
};

const hasAnotherActiveSprint = (excludeSprintId = null) => {
    return sprintStore.sprints.some((item) => item.status === 'active' && item.id !== excludeSprintId);
};

const buildUpdatePayload = (sprint, nextStatus) => {
    return {
        description: sprint.description || '',
        status: nextStatus,
        startDate: toApiDateTime(toInputDate(sprint.startDate)),
        endDate: toApiDateTime(toInputDate(sprint.endDate)),
    };
};

const canStartSprint = (sprint) => {
    if (!sprint || sprint.status === 'active') {
        return false;
    }
    return !hasAnotherActiveSprint(sprint.id);
};

const canCompleteSprint = (sprint) => {
    if (!sprint) {
        return false;
    }
    return sprint.status === 'active';
};

const resetForm = () => {
    Object.assign(form, {
        id: null,
        description: '',
        status: 'planned',
        startDate: '',
        endDate: '',
    });
    formError.value = '';
};

const openCreateModal = () => {
    isEditMode.value = false;
    resetForm();
    isModalOpen.value = true;
};

const openEditModal = (sprint) => {
    if (!sprint) {
        return;
    }

    isEditMode.value = true;
    formError.value = '';
    Object.assign(form, {
        id: sprint.id,
        description: sprint.description || '',
        status: sprint.status || 'planned',
        startDate: toInputDate(sprint.startDate),
        endDate: toInputDate(sprint.endDate),
    });
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
};

const validateForm = () => {
    formError.value = '';

    if (!form.startDate || !form.endDate) {
        formError.value = 'Start date and end date are required.';
        return false;
    }

    if (form.endDate < form.startDate) {
        formError.value = 'End date cannot be before start date.';
        return false;
    }

    if (form.status === 'active' && hasAnotherActiveSprint(form.id)) {
        formError.value = 'Another sprint is already active.';
        return false;
    }

    return true;
};

const submitForm = async () => {
    if (!validateForm()) {
        return;
    }

    isSubmitting.value = true;

    const payload = {
        description: form.description.trim(),
        status: form.status,
        startDate: toApiDateTime(form.startDate),
        endDate: toApiDateTime(form.endDate),
    };

    try {
        if (isEditMode.value && form.id) {
            await sprintStore.updateSprint(projectId.value, form.id, payload);
        } else {
            await sprintStore.createSprint(projectId.value, payload);
        }
        closeModal();
    } catch (error) {
        formError.value = sprintStore.error || 'Failed to save sprint.';
    } finally {
        isSubmitting.value = false;
    }
};

const startSprint = async (sprint) => {
    if (!canStartSprint(sprint)) {
        return;
    }

    actionLoading.startId = sprint.id;
    try {
        await sprintStore.updateSprint(projectId.value, sprint.id, buildUpdatePayload(sprint, 'active'));
    } catch (error) {
        // Error is already stored in sprintStore.error.
    } finally {
        actionLoading.startId = null;
    }
};

const completeSprint = async (sprint) => {
    if (!canCompleteSprint(sprint)) {
        return;
    }

    actionLoading.completeId = sprint.id;
    try {
        await sprintStore.updateSprint(projectId.value, sprint.id, buildUpdatePayload(sprint, 'closed'));
    } catch (error) {
        // Error is already stored in sprintStore.error.
    } finally {
        actionLoading.completeId = null;
    }
};

const removeSprint = async (sprint) => {
    if (!sprint) {
        return;
    }
    if (!confirm(`Delete sprint #${sprint.number}?`)) {
        return;
    }

    actionLoading.deleteId = sprint.id;
    try {
        await sprintStore.deleteSprint(projectId.value, sprint.id);
    } catch (error) {
        // Error is already stored in sprintStore.error.
    } finally {
        actionLoading.deleteId = null;
    }
};

const loadSprints = async (force = false) => {
    if (!projectId.value) {
        sprintStore.clearSprints();
        return;
    }

    try {
        await sprintStore.fetchProjectSprints(projectId.value, { force });
    } catch (error) {
        // Error is already stored in sprintStore.error.
    }
};

await loadSprints(true);

watch(projectId, async (nextProjectId, prevProjectId) => {
    if (!nextProjectId || nextProjectId === prevProjectId) {
        return;
    }
    await loadSprints(true);
});
</script>

<style scoped>
.sprints-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--surface-900);
}

.subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--surface-500);
}

.info-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 14px;
}

.info-alert.warning {
    color: #92400e;
    border: 1px solid #fde68a;
    background: #fffbeb;
}

.info-alert.error {
    color: #991b1b;
    border: 1px solid #fecaca;
    background: #fef2f2;
}

.state-box {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    padding: 32px;
    border: 1px dashed var(--surface-300);
    border-radius: 10px;
    color: var(--surface-500);
}

.table-wrapper {
    background: white;
    border: 1px solid var(--surface-200);
    border-radius: 12px;
    overflow: hidden;
}

.sprints-table {
    width: 100%;
    border-collapse: collapse;
}

.sprints-table th,
.sprints-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid var(--surface-200);
    vertical-align: middle;
    font-size: 14px;
}

.sprints-table th {
    font-size: 13px;
    font-weight: 700;
    color: var(--surface-700);
    background: var(--surface-50);
}

.sprints-table tr:last-child td {
    border-bottom: none;
}

.sprints-table th.narrow,
.sprints-table td:last-child {
    width: 88px;
}

.mono {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--surface-800);
}

.status-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
}

.status-planned {
    color: #1e40af;
    background: #dbeafe;
}

.status-active {
    color: #166534;
    background: #dcfce7;
}

.status-closed {
    color: #9f1239;
    background: #ffe4e6;
}

.inline-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.icon-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    color: var(--surface-500);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.icon-btn:hover:not(:disabled) {
    color: var(--surface-900);
    background: var(--surface-100);
}

.icon-btn.danger:hover:not(:disabled) {
    color: #dc2626;
    background: #fee2e2;
}

.icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 28px;
    color: var(--surface-500);
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 6px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--surface-700);
}

.form-label.required::after {
    content: ' *';
    color: #ef4444;
}

.date-input {
    width: 100%;
    border: 1px solid var(--surface-300);
    border-radius: 8px;
    padding: 9px 10px;
    font-size: 14px;
    color: var(--surface-800);
    background: white;
    transition: border-color 0.2s ease;
}

.date-input:focus {
    outline: none;
    border-color: var(--primary-400);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.form-error {
    color: #b91c1c;
    font-size: 13px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 9px 10px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
}

@media (max-width: 960px) {
    .table-wrapper {
        overflow-x: auto;
    }

    .sprints-table {
        min-width: 920px;
    }
}

@media (max-width: 640px) {
    .form-group.two-col {
        grid-template-columns: 1fr;
    }
}
</style>
