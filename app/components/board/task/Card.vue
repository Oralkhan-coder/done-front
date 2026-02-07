<template>
    <div class="task-card group" :data-task-id="task.id" :draggable="isDraggingEnabled" @dragstart="handleDragStart"
        @dragend="handleDragEnd" @click="handleClick">
        <div :class="['priority-indicator', getPriorityClass(task.priority)]"></div>
        <div class="task-card-content">
            <div class="task-header">
                <div class="flex items-center gap-2">
                    <span class="task-id">{{ task.code || `#${task.id}` }}</span>
                </div>
                <div class="task-header-actions">
                    <button class="drag-trigger" :title="'Drag task'" @mousedown.stop="enableDrag"
                        @mouseup.stop="disableDrag" @mouseleave="disableDrag">
                        <Icon name="carbon:draggable" size="16" class="text-slate-400" />
                    </button>
                    <div ref="menuButton" class="drag-handle opacity-0 group-hover:opacity-100 transition-opacity"
                        @click.stop="toggleMenu">
                        <Icon name="carbon:overflow-menu-horizontal" size="24" class="text-slate-400" />
                    </div>
                </div>
            </div>
            <h4 class="task-title">{{ task.title }}</h4>
            <div class="task-footer">
                <div class="flex items-center gap-2">
                    <div ref="assigneeButton" :class="['assignee-avatar', 'clickable', { unassigned: !task.assignee }]"
                        :title="task.assignee?.name || 'Select assignee'" @click.stop="toggleAssigneeDropdown">
                        <span v-if="!task.assignee">
                            <Icon name="carbon:user" size="14" />
                        </span>
                        <span v-else-if="!task.assignee.avatar">
                            {{ getInitials(task.assignee.name) }}
                        </span>
                        <img v-else :src="task.assignee.avatar" :alt="task.assignee.name" />
                    </div>
                    <span ref="priorityButton" :class="['priority-badge', 'clickable', getPriorityClass(task.priority)]"
                        @click.stop="togglePriorityDropdown">
                        {{ getPriorityLabel(task.priority) }}
                    </span>
                </div>
                <div v-if="task.dueDate" :class="['due-date', { overdue: isOverdue(task.dueDate) }]">
                    <Icon name="carbon:calendar" size="14" />
                    <span>{{ formatDueDate(task.dueDate) }}</span>
                </div>
            </div>
        </div>

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

        <OverlayPanel ref="priorityPanel" :style="{ width: '150px' }">
            <div class="dropdown-content">
                <div v-for="priority in priorities" :key="priority.value" class="dropdown-item"
                    @click="selectPriority(priority.value)">
                    <span :class="['priority-indicator-small', getPriorityClass(priority.value)]"></span>
                    <span>{{ priority.label }}</span>
                </div>
            </div>
        </OverlayPanel>

        <OverlayPanel ref="menuPanel" :style="{ width: '150px' }">
            <div class="dropdown-content">
                <div class="dropdown-item delete-item" @click="handleDelete">
                    <Icon name="carbon:trash-can" size="16" />
                    <span>Delete</span>
                </div>
            </div>
        </OverlayPanel>
    </div>
</template>
<script setup>
const props = defineProps({
    task: {
        type: Object,
        required: true,
    },
    statusId: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(['click', 'dragstart', 'dragend', 'update', 'delete', 'reorder']);

const projectUsersStore = useProjectUsersStore();
const taskStore = useTaskStore();

const assigneePanel = ref(null);
const priorityPanel = ref(null);
const menuPanel = ref(null);
const assigneeButton = ref(null);
const priorityButton = ref(null);
const menuButton = ref(null);
const isDraggingEnabled = ref(false);

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

const handleDragStart = (event) => {
    if (!isDraggingEnabled.value) {
        event.preventDefault();
        return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('taskId', props.task.id.toString());
    event.dataTransfer.setData('statusId', props.statusId.toString());
    event.target.classList.add('dragging');
    emit('dragstart', props.task);
};

const handleDragEnd = (event) => {
    event.target.classList.remove('dragging');
    disableDrag();
    emit('dragend', props.task);
};

const enableDrag = () => {
    isDraggingEnabled.value = true;
};

const disableDrag = () => {
    isDraggingEnabled.value = false;
};

const handleClick = () => {
    emit('click', props.task);
};

const toggleAssigneeDropdown = (event) => {
    event.stopPropagation();
    assigneePanel.value.toggle(event);
};

const togglePriorityDropdown = (event) => {
    event.stopPropagation();
    priorityPanel.value.toggle(event);
};

const toggleMenu = (event) => {
    event.stopPropagation();
    menuPanel.value.toggle(event);
};

const selectAssignee = async (member) => {
    try {
        const updates = {
            title: props.task.title,
            description: props.task.description || '',
            statusId: props.task.statusId,
            priority: props.task.priority || 'medium',
            assigneeId: member.value,
        };

        if (props.task.storyPoint) {
            updates.storyPoint = props.task.storyPoint;
        }

        await taskStore.updateTask(props.task.id, updates);

        emit('update', {
            ...props.task,
            assigneeId: member.value,
            assignee: member.value ? { userId: member.value, name: member.label } : null,
        });

        assigneePanel.value.hide();
    } catch {
        // handled by centralized API notifications
    }
};

const selectPriority = async (priority) => {
    try {
        const updates = {
            title: props.task.title,
            description: props.task.description || '',
            statusId: props.task.statusId,
            priority: priority,
        };

        if (props.task.assigneeId) {
            updates.assigneeId = props.task.assigneeId;
        }

        if (props.task.storyPoint) {
            updates.storyPoint = props.task.storyPoint;
        }

        await taskStore.updateTask(props.task.id, updates);

        emit('update', {
            ...props.task,
            priority: priority,
        });

        priorityPanel.value.hide();
    } catch {
        // handled by centralized API notifications
    }
};

const handleDelete = async () => {
    try {
        await taskStore.deleteTask(props.task.id);
        emit('delete', props.task);
        menuPanel.value.hide();
    } catch {
        // handled by centralized API notifications
    }
};

const getPriorityClass = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    return `priority-${p}`;
};

const getPriorityLabel = (priority) => {
    const labels = {
        low: 'Low',
        medium: 'Med',
        high: 'High',
        critical: 'Critical',
    };
    const p = (priority || 'medium').toLowerCase();
    return labels[p] || labels.medium;
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

const formatDueDate = (date) => {
    if (!date) return '';
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays}d`;
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
};
</script>
<style scoped>
.task-card {
    position: relative;
    background: white;
    border: 1px solid var(--surface-200);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
}

.task-card:hover {
    border-color: var(--primary-300);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
    transform: translateY(-1px);
}

.task-card.dragging {
    opacity: 0.5;
    cursor: grabbing;
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

.task-header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

.drag-trigger {
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
}

.drag-trigger:hover {
    background: var(--surface-100);
}

.drag-trigger:active {
    cursor: grabbing;
}

.task-id {
    font-size: 11px;
    font-weight: 600;
    color: var(--surface-500);
    font-family: 'Courier New', monospace;
}

.task-type-icon {
    flex-shrink: 0;
}

.task-type-icon.type-bug {
    color: #ef4444;
}

.task-type-icon.type-feature {
    color: #8b5cf6;
}

.task-type-icon.type-story {
    color: #06b6d4;
}

.task-type-icon.type-task {
    color: #64748b;
}

.task-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--surface-900);
    line-height: 1.4;
    margin: 0;
    word-wrap: break-word;
}

.task-description {
    font-size: 12px;
    color: var(--surface-600);
    line-height: 1.5;
    margin: 0;
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

.assignee-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
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

.due-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--surface-500);
    font-weight: 500;
}

.due-date.overdue {
    color: #dc2626;
}

.due-date.overdue :deep(svg) {
    color: #dc2626;
}

.drag-handle {
    cursor: pointer;
}

.dropdown-content {
    max-height: 250px;
    overflow-y: auto;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 13px;
}

.dropdown-item:hover {
    background: var(--surface-100);
}

.dropdown-item.delete-item {
    color: #dc2626;
}

.dropdown-item.delete-item:hover {
    background: #fee2e2;
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
