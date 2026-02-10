<template>
    <NuxtLayout name="default">
        <div class="flex flex-col h-full">
            <div class="bg-white border-b border-slate-200 -mx-6 md:-mx-8 px-6 md:px-8 pb-0 flex-shrink-0">
                <div class="pt-4 pb-3">
                    <nav class="flex items-center gap-2 text-sm">
                        <NuxtLink to="/projects"
                            class="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <Icon name="carbon:layers" size="16" />
                            <span>Projects</span>
                        </NuxtLink>
                        <Icon name="carbon:chevron-right" size="16" class="text-slate-300" />
                        <span class="text-slate-700 font-medium">{{ project.title || 'Loading...' }}</span>
                    </nav>
                </div>

                <nav class="flex items-center gap-1 -mb-px">
                    <NuxtLink v-for="tab in tabs" :key="tab.path" :to="tab.path" custom
                        v-slot="{ href, navigate, isActive }">
                        <a :href="href" @click="navigate" :class="[
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 relative',
                            isActive
                                ? 'text-indigo-700 border-indigo-600 bg-indigo-50/50'
                                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50',
                        ]">
                            <Icon :name="tab.icon" size="18" />
                            <span>{{ tab.name }}</span>
                        </a>
                    </NuxtLink>
                </nav>
            </div>
            <div class="flex-1 min-h-0">
                <slot />
            </div>
        </div>
    </NuxtLayout>
</template>
<script setup>
const route = useRoute();
const projectStore = useProjectStore();
const project = computed(() => projectStore.project);
await projectStore.getProject(route);
const tabs = computed(() => [
    {
        name: 'Backlog',
        path: `/projects/${route.params.id}/backlog`,
        icon: 'carbon:list',
    },
    {
        name: 'Board',
        path: `/projects/${route.params.id}/boards`,
        icon: 'carbon:grid',
    },
    {
        name: 'Sprints',
        path: `/projects/${route.params.id}/sprints`,
        icon: 'carbon:timer',
    },
    {
        name: 'Wiki',
        path: `/projects/${route.params.id}/wiki`,
        icon: 'carbon:notebook',
    },
]);
</script>
<style scoped>
nav a {
    position: relative;
}

nav a::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transition: transform 0.2s ease;
}

nav a:hover::after {
    transform: scaleX(1);
}
</style>
