<template>
    <div class="board-page">
        <!-- Board Toolbar -->
        <div class="board-toolbar">
            <div class="toolbar-left">
                <h2 class="board-title">Board</h2>
                <div class="board-stats">
                    <span class="stat-item">
                        <Icon name="carbon:checkbox" size="16" />
                        {{ totalTasks }} tasks
                    </span>
                </div>
            </div>
            <div class="toolbar-right">
                <div class="search-box">
                    <Icon name="carbon:search" size="16" class="search-icon" />
                    <input v-model="searchQuery" type="text" placeholder="Search tasks..." class="search-input" />
                </div>
                <button class="refresh-btn" @click="handleRefresh" :disabled="boardStore.isLoading">
                    <Icon name="carbon:renew" size="18" :class="{ 'spinning': boardStore.isLoading }" />
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="boardStore.isLoading && !boardStore.board.length" class="loading-state">
            <Icon name="carbon:renew" size="48" class="spinning" />
            <p>Loading board...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="boardStore.error" class="error-state">
            <Icon name="carbon:warning" size="48" />
            <h3>Failed to load board</h3>
            <p>{{ boardStore.error }}</p>
            <Button label="Retry" icon="carbon:renew" @click="handleRefresh" outlined />
        </div>

        <!-- Board Columns -->
        <div v-else class="board-container">
            <div class="board-columns">
                <BoardStatusColumn v-for="column in filteredBoard" :key="column.statusId" :column="column" />
            </div>

            <!-- Empty State -->
            <div v-if="!boardStore.board.length" class="empty-board">
                <Icon name="carbon:grid" size="64" class="empty-icon" />
                <h3>No status columns found</h3>
                <p>Your board doesn't have any status columns yet.</p>
            </div>
        </div>

        <!-- Create Task Modal -->
        <BoardCreateTaskModal :is-open="boardStore.isCreateModalOpen" :status-id="boardStore.selectedStatusId || 0" />

        <!-- Task Detail Modal -->
        <BoardTaskDetailModal :is-open="boardStore.isDetailModalOpen" :task="boardStore.selectedTask" />
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'projectheader',
});

const route = useRoute();
const boardStore = useBoardStore();

await boardStore.getBoard(route);

const searchQuery = ref('');

const totalTasks = computed(() => {
    return boardStore.board.reduce((total, column) => {
        return total + (column.tasks?.length || 0);
    }, 0);
});

const filteredBoard = computed(() => {
    if (!searchQuery.value.trim()) {
        return boardStore.board;
    }

    const query = searchQuery.value.toLowerCase();
    return boardStore.board.map(column => ({
        ...column,
        tasks: column.tasks?.filter(task => {
            return (
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.assignee?.name?.toLowerCase().includes(query) ||
                task.code?.toLowerCase().includes(query)
            );
        }) || [],
    }));
});

// Methods
const handleRefresh = async () => {
    await boardStore.getBoard(route);
};
</script>

<style scoped>
.board-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 240px);
    min-height: 600px;
}

/* Toolbar */
.board-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    margin-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.board-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0;
}

.board-stats {
    display: flex;
    align-items: center;
    gap: 12px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--surface-600);
    font-weight: 500;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: var(--surface-400);
    pointer-events: none;
}

.search-input {
    width: 280px;
    padding: 8px 12px 8px 36px;
    border: 1px solid var(--surface-300);
    border-radius: 8px;
    font-size: 14px;
    color: var(--surface-900);
    background: white;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-400);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
    color: var(--surface-400);
}

.refresh-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--surface-300);
    background: white;
    border-radius: 8px;
    color: var(--surface-600);
    cursor: pointer;
    transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
    background: var(--surface-50);
    border-color: var(--primary-400);
    color: var(--primary-600);
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Board Container */
.board-container {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 16px;
}

.board-columns {
    display: flex;
    gap: 16px;
    min-height: 100%;
    padding: 4px;
}

/* Loading State */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: var(--surface-500);
}

.loading-state p {
    margin-top: 16px;
    font-size: 14px;
}

/* Error State */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
}

.error-state :deep(svg) {
    color: #ef4444;
    margin-bottom: 16px;
}

.error-state h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0 0 8px 0;
}

.error-state p {
    font-size: 14px;
    color: var(--surface-600);
    margin: 0 0 24px 0;
}

/* Empty Board */
.empty-board {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
}

.empty-icon {
    color: var(--surface-300);
    margin-bottom: 16px;
}

.empty-board h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0 0 8px 0;
}

.empty-board p {
    font-size: 14px;
    color: var(--surface-600);
    margin: 0;
}

/* Spinning Animation */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.spinning {
    animation: spin 1s linear infinite;
}

/* Scrollbar */
.board-container::-webkit-scrollbar {
    height: 10px;
}

.board-container::-webkit-scrollbar-track {
    background: var(--surface-100);
    border-radius: 5px;
}

.board-container::-webkit-scrollbar-thumb {
    background: var(--surface-300);
    border-radius: 5px;
}

.board-container::-webkit-scrollbar-thumb:hover {
    background: var(--surface-400);
}

/* Responsive */
@media (max-width: 768px) {
    .board-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .toolbar-left,
    .toolbar-right {
        width: 100%;
        justify-content: space-between;
    }

    .search-input {
        width: 100%;
    }

    .board-page {
        height: auto;
        min-height: auto;
    }

    .board-columns {
        flex-direction: column;
    }
}
</style>
