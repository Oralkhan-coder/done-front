<template>
    <div class="task-card create-card">
        <div class="priority-indicator priority-medium"></div>
        <div class="task-card-content">
            <input ref="titleInput" v-model="formData.title" type="text" class="task-title-input"
                placeholder="Enter task title..." @keydown.enter="handleSubmit" @keydown.escape="handleCancel" />
            <div class="task-footer">
                <div class="flex items-center gap-2">
                    <!-- Assignee Dropdown -->
                    <div ref="assigneeButton" class="assignee-avatar clickable"
                        :class="{ unassigned: !selectedAssignee }" :title="selectedAssignee?.label || 'Select assignee'"
                        @click="toggleAssigneeDropdown">
                        <span v-if="!selectedAssignee">
                            <Icon name="carbon:user" size="14" />
                        </span>
                        <span v-else>
                            {{ getInitials(selectedAssignee.label) }}
                        </span>
                    </div>

                    <!-- Priority Dropdown -->
                    <span ref="priorityButton" :class="['priority-badge', 'clickable', `priority-${formData.priority}`]"
                        @click="togglePriorityDropdown">
                        {{ getPriorityLabel(formData.priority) }}
                    </span>
                </div>
                <div class="action-buttons">
                    <button type="button" class="cancel-btn" @click="handleCancel" title="Cancel">
                        <Icon name="carbon:close" size="16" />
                    </button>
                    <button type="button" class="submit-btn" @click="handleSubmit"
                        :disabled="!formData.title.trim() || isSubmitting" title="Create task">
                        <Icon name="carbon:checkmark" size="16" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Assignee Dropdown -->
        <OverlayPanel ref="assigneePanel" :style="{ width: '200px' }">
            <div class="dropdown-content">
                <div v-if="projectMembers.length === 0 && !loadingMembers" class="dropdown-loading">
                    No members found
                </div>
                <div v-for="member in projectMembers" :key="member.value || 'none'" class="dropdown-item"
                    @click="selectAssignee(member)">
                    <div class="assignee-avatar-small" :class="{ unassigned: member.value === null }">
                        <span v-if="member.value === null">
                            <Icon name="carbon:user" size="12" />
                        </span>
                        <span v-else>
                            {{ getInitials(member.label) }}
                        </span>
                    </div>
                    <span>{{ member.label }}</span>
                </div>
                <div v-if="loadingMembers" class="dropdown-loading">Loading...</div>
            </div>
        </OverlayPanel>

        <!-- Priority Dropdown -->
        <OverlayPanel ref="priorityPanel" :style="{ width: '150px' }">
            <div class="dropdown-content">
                <div v-for="priority in priorities" :key="priority.value" class="dropdown-item"
                    @click="selectPriority(priority.value)">
                    <span :class="['priority-indicator-small', `priority-${priority.value}`]"></span>
                    <span>{{ priority.label }}</span>
                </div>
            </div>
        </OverlayPanel>
    </div>
</template>

<script setup>
const props = defineProps({
    statusId: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(['submit', 'cancel']);

const route = useRoute();
const boardStore = useBoardStore();
const projectUsersStore = useProjectUsersStore();

const titleInput = ref(null);
const assigneePanel = ref(null);
const priorityPanel = ref(null);
const assigneeButton = ref(null);
const priorityButton = ref(null);

const formData = reactive({
    title: '',
    priority: 'medium',
    assigneeId: null,
});

const isSubmitting = ref(false);
const selectedAssignee = ref(null);

const priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

const projectMembers = computed(() => {
    return projectUsersStore.getUsersForDropdown(true);
});

const loadingMembers = computed(() => {
    return projectUsersStore.isLoading;
});

const getPriorityLabel = (priority) => {
    const labels = {
        low: 'Low',
        medium: 'Med',
        high: 'High',
        critical: 'Critical',
    };
    return labels[priority] || labels.medium;
};

const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const toggleAssigneeDropdown = (event) => {
    event.stopPropagation();
    assigneePanel.value.toggle(event);
};

const togglePriorityDropdown = (event) => {
    event.stopPropagation();
    priorityPanel.value.toggle(event);
};

const selectAssignee = (member) => {
    selectedAssignee.value = member.value ? member : null;
    formData.assigneeId = member.value;
    assigneePanel.value.hide();
};

const selectPriority = (priority) => {
    formData.priority = priority;
    priorityPanel.value.hide();
};

const handleSubmit = async () => {
    if (!formData.title.trim() || isSubmitting.value) return;

    isSubmitting.value = true;
    try {
        const taskData = {
            title: formData.title,
            priority: formData.priority,
        };

        if (formData.assigneeId) {
            taskData.assigneeId = formData.assigneeId;
        }

        await boardStore.createTask(route.params.id, props.statusId, taskData);
        emit('submit');
    } catch (error) {
        console.error('Failed to create task:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const handleCancel = () => {
    emit('cancel');
};

onMounted(() => {
    if (route.params.id) {
        projectUsersStore.fetchProjectUsers(route.params.id);
    }
    nextTick(() => {
        titleInput.value?.focus();
    });
});
</script>

<style scoped>
.task-card {
    position: relative;
    background: white;
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    overflow: hidden;
}

.create-card {
    border-color: var(--primary-300);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.priority-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
}

.priority-indicator.priority-low {
    background: #22c55e;
}

.priority-indicator.priority-medium {
    background: #f59e0b;
}

.priority-indicator.priority-high {
    background: #ef4444;
}

.priority-indicator.priority-critical {
    background: #dc2626;
}

.task-card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.task-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.task-id {
    font-size: 11px;
    font-weight: 600;
    color: var(--surface-500);
    font-family: 'Courier New', monospace;
}

.task-type-icon {
    flex-shrink: 0;
    color: var(--primary-600);
}

.task-title-input {
    font-size: 14px;
    font-weight: 600;
    color: var(--surface-900);
    line-height: 1.4;
    margin: 0;
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    padding: 0;
}

.task-title-input::placeholder {
    color: var(--surface-400);
    font-weight: 500;
}

.task-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
}

.assignee-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-100);
    color: var(--primary-700);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
    border: 2px solid white;
    transition: all 0.2s ease;
}

.assignee-avatar.clickable {
    cursor: pointer;
}

.assignee-avatar.clickable:hover {
    transform: scale(1.1);
    border-color: var(--primary-300);
}

.assignee-avatar.unassigned {
    background: var(--surface-100);
    color: var(--surface-400);
}

.priority-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;
}

.priority-badge.clickable {
    cursor: pointer;
}

.priority-badge.clickable:hover {
    transform: scale(1.05);
    opacity: 0.8;
}

.priority-badge.priority-low {
    background: #dcfce7;
    color: #166534;
}

.priority-badge.priority-medium {
    background: #fef3c7;
    color: #92400e;
}

.priority-badge.priority-high {
    background: #fee2e2;
    color: #991b1b;
}

.priority-badge.priority-critical {
    background: #fecaca;
    color: #7f1d1d;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.cancel-btn,
.submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-btn {
    background: var(--surface-100);
    color: var(--surface-600);
}

.cancel-btn:hover {
    background: var(--surface-200);
    color: var(--surface-900);
}

.submit-btn {
    background: var(--primary-600);
    color: white;
}

.submit-btn:hover:not(:disabled) {
    background: var(--primary-700);
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Dropdown Styles */
.dropdown-content {
    max-height: 250px;
    overflow-y: auto;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 13px;
}

.dropdown-item:hover {
    background: var(--surface-100);
}

.assignee-avatar-small {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-100);
    color: var(--primary-700);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 600;
    flex-shrink: 0;
}

.assignee-avatar-small.unassigned {
    background: var(--surface-100);
    color: var(--surface-400);
}

.priority-indicator-small {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 0;
}

.priority-indicator-small.priority-low {
    background: #22c55e;
}

.priority-indicator-small.priority-medium {
    background: #f59e0b;
}

.priority-indicator-small.priority-high {
    background: #ef4444;
}

.priority-indicator-small.priority-critical {
    background: #dc2626;
}

.dropdown-loading {
    padding: 12px;
    text-align: center;
    color: var(--surface-500);
    font-size: 13px;
}
</style>
