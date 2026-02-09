<template>
    <div class="status-column">
        <div class="column-header">
            <div class="column-title-section">
                <h3 class="column-title">{{ column.statusTitle }}</h3>
                <span class="task-count">{{ taskCount }}</span>
            </div>
            <button class="add-task-btn" @click="handleAddTask" title="Add task">
                <Icon name="carbon:add" size="16" />
            </button>
        </div>
        <div class="tasks-container" :class="{ 'drag-over': isDragOver }" @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave" @drop="handleDrop">
            <!-- Inline Create Card -->
            <Transition name="create-card">
                <BoardTaskCreateCard v-if="showInlineCreate" :status-id="column.statusId" @submit="handleTaskCreated"
                    @cancel="handleCancelCreate" />
            </Transition>

            <TransitionGroup name="task-list" tag="div">
                <BoardTaskCard v-for="task in column.tasks" :key="task.id" :task="task" :status-id="column.statusId"
                    @click="handleTaskClick(task)" @update="handleTaskUpdate" @delete="handleTaskDelete" />
            </TransitionGroup>
            <div v-if="!column.tasks || column.tasks.length === 0" class="empty-state">
                <Icon name="carbon:document-blank" size="32" class="empty-icon" />
                <p class="empty-text">No tasks</p>
                <button class="empty-add-btn" @click="handleAddTask">
                    <Icon name="carbon:add" size="14" />
                    <span>Add task</span>
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
const props = defineProps({
    column: {
        type: Object,
        required: true,
    },
});
const boardStore = useBoardStore();
const route = useRoute();
const isDragOver = ref(false);
const showInlineCreate = ref(false);

const taskCount = computed(() => {
    return props.column.tasks?.length || 0;
});

const handleAddTask = () => {
    showInlineCreate.value = true;
};

const handleTaskClick = (task) => {
    boardStore.openUpdateModal(task);
};

const handleTaskCreated = () => {
    showInlineCreate.value = false;
};

const handleCancelCreate = () => {
    showInlineCreate.value = false;
};

const handleTaskUpdate = (updatedTask) => {
    const column = boardStore.board.find((col) => col.statusId === props.column.statusId);
    if (column && column.tasks) {
        const taskIndex = column.tasks.findIndex((t) => t.id === updatedTask.id);
        if (taskIndex !== -1) {
            column.tasks[taskIndex] = { ...column.tasks[taskIndex], ...updatedTask };
        }
    }
};

const handleTaskDelete = (deletedTask) => {
    const column = boardStore.board.find((col) => col.statusId === props.column.statusId);
    if (column && column.tasks) {
        const taskIndex = column.tasks.findIndex((t) => t.id === deletedTask.id);
        if (taskIndex !== -1) {
            column.tasks.splice(taskIndex, 1);
        }
    }
};

const handleDragOver = (event) => {
    event.preventDefault();
    isDragOver.value = true;
};
const handleDragLeave = () => {
    isDragOver.value = false;
};

const getDropIndex = (event) => {
    const taskElements = [...event.currentTarget.querySelectorAll('[data-task-id]')];
    if (!taskElements.length) return 0;

    const pointerY = event.clientY;
    for (let index = 0; index < taskElements.length; index += 1) {
        const rect = taskElements[index].getBoundingClientRect();
        const middleY = rect.top + rect.height / 2;

        if (pointerY < middleY) {
            return index;
        }
    }

    return taskElements.length;
};

const handleDrop = async (event) => {
    event.preventDefault();
    isDragOver.value = false;

    const taskId = Number.parseInt(event.dataTransfer.getData('taskId'), 10);
    const fromStatusId = Number.parseInt(event.dataTransfer.getData('statusId'), 10);
    const toStatusId = Number(props.column.statusId);

    if (Number.isNaN(taskId) || Number.isNaN(fromStatusId) || Number.isNaN(toStatusId)) {
        return;
    }

    try {
        const dropIndex = getDropIndex(event);
        await boardStore.moveTask(route.params.id, taskId, fromStatusId, toStatusId, dropIndex);
    } catch (error) {
        console.error('Failed to move task:', error);
    }
};
</script>
<style scoped>
.status-column {
    display: flex;
    flex-direction: column;
    background: var(--surface-50);
    border-radius: 12px;
    min-width: 300px;
    max-width: 300px;
    height: fit-content;
}

.column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--surface-200);
    background: white;
    border-radius: 12px 12px 0 0;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 10;
}


.column-title-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.column-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.task-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 20px;
    padding: 0 6px;
    background: var(--surface-200);
    color: var(--surface-600);
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
}

.add-task-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--surface-500);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.add-task-btn:hover {
    background: var(--primary-50);
    color: var(--primary-600);
}

.tasks-container {
    flex: 1;
    padding: 12px;
    min-height: 200px;
    transition: background-color 0.2s ease;
}

.tasks-container.drag-over {
    background: var(--primary-50);
    border: 2px dashed var(--primary-400);
    border-radius: 8px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    text-align: center;
}

.empty-icon {
    color: var(--surface-300);
    margin-bottom: 12px;
}

.empty-text {
    font-size: 13px;
    color: var(--surface-500);
    margin: 0 0 16px 0;
}

.empty-add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: white;
    border: 1px solid var(--surface-300);
    border-radius: 6px;
    color: var(--surface-700);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.empty-add-btn:hover {
    background: var(--primary-50);
    border-color: var(--primary-400);
    color: var(--primary-700);
}

.task-list-move,
.task-list-enter-active,
.task-list-leave-active {
    transition: all 0.3s ease;
}

.task-list-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.task-list-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

.task-list-leave-active {
    position: absolute;
}

.create-card-enter-active,
.create-card-leave-active {
    transition: all 0.3s ease;
}

.create-card-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.create-card-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
