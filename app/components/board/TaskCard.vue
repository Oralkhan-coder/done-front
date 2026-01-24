<template>
    <div
        class="task-card group"
        draggable="true"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @click="handleClick"
    >
        <div :class="['priority-indicator', `priority-${task.priority || 'medium'}`]"></div>

        <div class="task-card-content">
            <div class="task-header">
                <div class="flex items-center gap-2">
                    <Icon
                        :name="getTaskTypeIcon(task.type)"
                        :class="['task-type-icon', `type-${task.type || 'task'}`]"
                        size="16"
                    />
                    <span class="task-id">{{ task.code || `#${task.id}` }}</span>
                </div>
                <div class="drag-handle opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="carbon:draggable" size="16" class="text-slate-400" />
                </div>
            </div>

            <h4 class="task-title">{{ task.title }}</h4>

            <p v-if="task.description" class="task-description">
                {{ truncateText(task.description, 80) }}
            </p>

            <div class="task-footer">
                <div class="flex items-center gap-2">
                    <!-- Assignee Avatar -->
                    <div v-if="task.assignee" class="assignee-avatar" :title="task.assignee.name">
                        <span v-if="!task.assignee.avatar">
                            {{ getInitials(task.assignee.name) }}
                        </span>
                        <img v-else :src="task.assignee.avatar" :alt="task.assignee.name" />
                    </div>
                    <div v-else class="assignee-avatar unassigned" title="Unassigned">
                        <Icon name="carbon:user" size="14" />
                    </div>

                    <!-- Priority Badge -->
                    <span :class="['priority-badge', `priority-${task.priority || 'medium'}`]">
                        {{ getPriorityLabel(task.priority) }}
                    </span>
                </div>

                <div v-if="task.dueDate" :class="['due-date', { overdue: isOverdue(task.dueDate) }]">
                    <Icon name="carbon:calendar" size="14" />
                    <span>{{ formatDueDate(task.dueDate) }}</span>
                </div>
            </div>
        </div>
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

const emit = defineEmits(['click', 'dragstart', 'dragend']);

// Drag handlers
const handleDragStart = (event) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('taskId', props.task.id.toString());
    event.dataTransfer.setData('statusId', props.statusId.toString());
    event.target.classList.add('dragging');
    emit('dragstart', props.task);
};

const handleDragEnd = (event) => {
    event.target.classList.remove('dragging');
    emit('dragend', props.task);
};

const handleClick = () => {
    emit('click', props.task);
};

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

const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
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

/* Priority Indicator - Left Border */
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

/* Card Content */
.task-card-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Header */
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

/* Title */
.task-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--surface-900);
    line-height: 1.4;
    margin: 0;
    word-wrap: break-word;
}

/* Description */
.task-description {
    font-size: 12px;
    color: var(--surface-600);
    line-height: 1.5;
    margin: 0;
}

/* Footer */
.task-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
}

/* Assignee Avatar */
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

/* Priority Badge */
.priority-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
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

/* Due Date */
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
</style>
