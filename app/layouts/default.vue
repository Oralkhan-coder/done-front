<template>
    <div class="layout">
        <aside :class="['sidebar', { 'is-collapsed': isCollapsed }]">
            <div class="sidebar-header">
                <span v-if="!isCollapsed" class="logo">Done</span>
                <button
                    class="toggle-btn"
                    :aria-label="isCollapsed ? 'Expand' : 'Collapse'"
                    @click="isCollapsed = !isCollapsed"
                >
                    {{ isCollapsed ? '→' : '←' }}
                </button>
            </div>

            <nav class="nav-links">
                <NuxtLink to="/" class="nav-item p-0 m-0">
                    <Button :label="isCollapsed ? '' : 'Home'" class="w-full m-0">
                        <template #icon>
                            <Icon name="carbon:home" :class="{ 'mr-2': !isCollapsed }" />
                        </template>
                    </Button>
                </NuxtLink>

                <NuxtLink to="/projects" class="nav-item p-0 m-0">
                    <Button :label="isCollapsed ? '' : 'Project'" class="w-full m-0">
                        <template #icon>
                            <Icon name="carbon:layers" :class="{ 'mr-2': !isCollapsed }" />
                        </template>
                    </Button>
                </NuxtLink>
            </nav>
        </aside>
        <main class="main-content">
            <slot />
        </main>
    </div>
</template>

<script setup>
const isCollapsed = ref(false);
</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    font-family: sans-serif;
}

/* Sidebar Styles */
.sidebar {
    width: 240px;
    background-color: #1e293b;
    color: white;
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.sidebar.is-collapsed {
    width: 60px;
    padding: 1rem 0.5rem;
}

/* Header & Toggle */
.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
}

.toggle-btn {
    background: #334155;
    border: none;
    color: white;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
}

/* Navigation */
.nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.nav-links a {
    color: #cbd5e1;
    text-decoration: none;
    padding: 0.75rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
    white-space: nowrap;
}

.nav-links a:hover {
    background-color: #334155;
    color: white;
}

/* Content Area */
.main-content {
    flex-grow: 1;
    background-color: #f8fafc;
    padding: 2rem;
}
</style>
