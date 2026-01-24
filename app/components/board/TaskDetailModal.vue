<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen && task" class="modal-overlay" @click.self="handleClose">
                <div class="modal-container detail-modal">
                    <!-- Header -->
                    <div class="modal-header">
                        <div class="header-left">
                            <Icon :name="getTaskTypeIcon(task.type)" :class="['type-icon', `type-${task.type}`]"
                                size="24" />
                            <span class="task-code">{{ task.code || `#${task.id}` }}</span>
                        </div>
                        <div class="header-actions">
                            <button class="action-btn delete-btn" @click="handleDelete" title="Delete task">
                                <Icon name="carbon:trash-can" size="20" />
                            </button>
                            <button class="close-btn" @click="handleClose">
                                <Icon name="carbon:close" size="24" />
                            </button>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="modal-body">
                        <!-- Title -->
                        <div class="section">
                            <input v-if="isEditing" v-model="editData.title" class="title-input"
                                placeholder="Task title" />
                            <h2 v-else class="task-title" @click="isEditing = true">
                                {{ task.title }}
                            </h2>
                        </div>

                        <!-- Description -->
                        <div class="section">
                            <label class="section-label">Description</label>
                            <Textarea v-if="isEditing" v-model="editData.description" rows="6" class="w-full"
                                placeholder="Add a description..." />
                            <p v-else-if="task.description" class="description-text" @click="isEditing = true">
                                {{ task.description }}
                            </p>
                            <p v-else class="empty-description" @click="isEditing = true">
                                Click to add a description...
                            </p>
                        </div>

                        <!-- Details Grid -->
                        <div class="details-grid">
                            <!-- Type -->
                            <div class="detail-item">
                                <label class="detail-label">Type</label>
                                <Select v-if="isEditing" v-model="editData.type" :options="taskTypes"
                                    optionLabel="label" optionValue="value" class="w-full" />
                                <div v-else class="detail-value">
                                    <Icon :name="getTaskTypeIcon(task.type)"
                                        :class="['type-icon-sm', `type-${task.type}`]" size="16" />
                                    <span>{{ getTaskTypeLabel(task.type) }}</span>
                                </div>
                            </div>

                            <!-- Priority -->
                            <div class="detail-item">
                                <label class="detail-label">Priority</label>
                                <Select v-if="isEditing" v-model="editData.priority" :options="priorities"
                                    optionLabel="label" optionValue="value" class="w-full" />
                                <span v-else :class="['priority-badge-lg', `priority-${task.priority}`]">
                                    {{ getPriorityLabel(task.priority) }}
                                </span>
                            </div>

                            <!-- Assignee -->
                            <div class="detail-item">
                                <label class="detail-label">Assignee</label>
                                <InputText v-if="isEditing" v-model="editData.assigneeName" placeholder="Assignee name"
                                    class="w-full" />
                                <div v-else class="assignee-display">
                                    <div class="assignee-avatar-lg">
                                        <span v-if="!task.assignee?.avatar">
                                            {{ getInitials(task.assignee?.name || 'Unassigned') }}
                                        </span>
                                        <img v-else :src="task.assignee.avatar" :alt="task.assignee.name" />
                                    </div>
                                    <span>{{ task.assignee?.name || 'Unassigned' }}</span>
                                </div>
                            </div>

                            <!-- Due Date -->
                            <div class="detail-item">
                                <label class="detail-label">Due Date</label>
                                <Calendar v-if="isEditing" v-model="editData.dueDate" dateFormat="yy-mm-dd"
                                    placeholder="Select date" class="w-full" showIcon />
                                <div v-else :class="['due-date-display', { 'overdue': isOverdue(task.dueDate) }]">
                                    <Icon name="carbon:calendar" size="16" />
                                    <span>{{ task.dueDate ? formatDate(task.dueDate) : 'No due date' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Metadata -->
                        <div class="metadata">
                            <div class="metadata-item">
                                <Icon name="carbon:time" size="14" />
                                <span>Created {{ formatRelativeTime(task.createdAt) }}</span>
                            </div>
                            <div v-if="task.updatedAt" class="metadata-item">
                                <Icon name="carbon:edit" size="14" />
                                <span>Updated {{ formatRelativeTime(task.updatedAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div v-if="isEditing" class="modal-footer">
                        <Button label="Cancel" severity="secondary" outlined @click="cancelEdit" />
                        <Button label="Save Changes" icon="carbon:save" :loading="isSaving" @click="handleSave"
                            class="bg-indigo-600 border-indigo-600" />
                    </div>
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

const emit = defineEmits(['close', 'update', 'delete']);

const route = useRoute();
const boardStore = useBoardStore();

const isEditing = ref(false);
const isSaving = ref(false);
const editData = reactive({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    assigneeName: '',
    dueDate: null,
});

// Options
const taskTypes = [
    { label: 'Task', value: 'task' },
    { label: 'Bug', value: 'bug' },
    { label: 'Feature', value: 'feature' },
    { label: 'Story', value: 'story' },
];

const priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

// Utility functions
const getTaskTypeIcon = (type) => {
    const icons = {
        bug: 'carbon:debug',
        feature: 'carbon:star',
        story: 'carbon:book',
        task: 'carbon:checkbox',
    };
    return icons[type] || icons.task;
};

const getTaskTypeLabel = (type) => {
    const labels = {
        bug: 'Bug',
        feature: 'Feature',
        story: 'Story',
        task: 'Task',
    };
    return labels[type] || labels.task;
};

const getPriorityLabel = (priority) => {
    const labels = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
    };
    return labels[priority] || labels.medium;
};

const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
};

// Methods
const loadEditData = () => {
    if (props.task) {
        editData.title = props.task.title || '';
        editData.description = props.task.description || '';
        editData.type = props.task.type || 'task';
        editData.priority = props.task.priority || 'medium';
        editData.assigneeName = props.task.assignee?.name || '';
        editData.dueDate = props.task.dueDate ? new Date(props.task.dueDate) : null;
    }
};

const cancelEdit = () => {
    isEditing.value = false;
    loadEditData();
};

const handleClose = () => {
    isEditing.value = false;
    boardStore.closeModals();
};

const handleSave = async () => {
    isSaving.value = true;

    try {
        const updates = {
            title: editData.title,
            description: editData.description,
            type: editData.type,
            priority: editData.priority,
            dueDate: editData.dueDate ? editData.dueDate.toISOString().split('T')[0] : null,
        };

        if (editData.assigneeName.trim()) {
            updates.assignee = {
                name: editData.assigneeName,
            };
        }

        await boardStore.updateTask(route.params.id, props.task.id, updates);
        isEditing.value = false;
    } catch (error) {
        console.error('Failed to update task:', error);
    } finally {
        isSaving.value = false;
    }
};

const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await boardStore.deleteTask(route.params.id, props.task.id);
            boardStore.closeModals();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    }
};

// Watch for task changes
watch(() => props.task, (newTask) => {
    if (newTask) {
        loadEditData();
    }
}, { immediate: true });

watch(() => props.isOpen, (newVal) => {
    if (!newVal) {
        isEditing.value = false;
    }
});
</script>

<style scoped>
.detail-modal {
    max-width: 800px;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--surface-200);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.type-icon {
    flex-shrink: 0;
}

.type-icon.type-bug {
    color: #ef4444;
}

.type-icon.type-feature {
    color: #8b5cf6;
}

.type-icon.type-story {
    color: #06b6d4;
}

.type-icon.type-task {
    color: #64748b;
}

.task-code {
    font-size: 14px;
    font-weight: 600;
    color: var(--surface-500);
    font-family: 'Courier New', monospace;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.delete-btn {
    color: var(--surface-500);
}

.delete-btn:hover {
    background: #fee2e2;
    color: #dc2626;
}

.section {
    margin-bottom: 24px;
}

.section-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--surface-600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.title-input {
    width: 100%;
    font-size: 24px;
    font-weight: 700;
    color: var(--surface-900);
    border: 2px solid var(--primary-400);
    border-radius: 8px;
    padding: 12px;
    outline: none;
}

.task-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0;
    cursor: text;
    padding: 12px;
    border-radius: 8px;
    transition: background 0.2s ease;
}

.task-title:hover {
    background: var(--surface-50);
}

.description-text {
    color: var(--surface-700);
    line-height: 1.6;
    margin: 0;
    padding: 12px;
    border-radius: 8px;
    cursor: text;
    transition: background 0.2s ease;
}

.description-text:hover {
    background: var(--surface-50);
}

.empty-description {
    color: var(--surface-400);
    font-style: italic;
    margin: 0;
    padding: 12px;
    border-radius: 8px;
    cursor: text;
    transition: background 0.2s ease;
}

.empty-description:hover {
    background: var(--surface-50);
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 24px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--surface-600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-value {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--surface-700);
    font-weight: 500;
}

.type-icon-sm {
    flex-shrink: 0;
}

.type-icon-sm.type-bug {
    color: #ef4444;
}

.type-icon-sm.type-feature {
    color: #8b5cf6;
}

.type-icon-sm.type-story {
    color: #06b6d4;
}

.type-icon-sm.type-task {
    color: #64748b;
}

.priority-badge-lg {
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.priority-badge-lg.priority-low {
    background: #dcfce7;
    color: #166534;
}

.priority-badge-lg.priority-medium {
    background: #fef3c7;
    color: #92400e;
}

.priority-badge-lg.priority-high {
    background: #fee2e2;
    color: #991b1b;
}

.priority-badge-lg.priority-critical {
    background: #fecaca;
    color: #7f1d1d;
}

.assignee-display {
    display: flex;
    align-items: center;
    gap: 10px;
}

.assignee-avatar-lg {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary-100);
    color: var(--primary-700);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.assignee-avatar-lg img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.due-date-display {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--surface-700);
    font-weight: 500;
}

.due-date-display.overdue {
    color: #dc2626;
}

.metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--surface-200);
}

.metadata-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--surface-500);
}

.modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid var(--surface-200);
    background: var(--surface-50);
}

@media (max-width: 640px) {
    .details-grid {
        grid-template-columns: 1fr;
    }
}
</style>
