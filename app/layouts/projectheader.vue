<template>
    <NuxtLayout name="default">
        <div class="space-y-0">
            <div class="bg-white border-b border-slate-200 -mx-6 md:-mx-8 px-6 md:px-8 pb-0">
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
                <div class="flex items-center gap-4 pb-4">
                    <div
                        class="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {{ project.title ? project.title.charAt(0).toUpperCase() : 'P' }}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold text-slate-900">{{ project.title || 'Project' }}</h1>
                            <span v-if="project.code"
                                class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono font-semibold border border-slate-200">
                                {{ project.code }}
                            </span>
                        </div>
                        <p v-if="project.description" class="text-sm text-slate-500 mt-1">{{ project.description }}</p>
                    </div>
                </div>
                <nav class="flex items-center gap-1 -mb-px">
                    <NuxtLink v-for="tab in tabs" :key="tab.path" :to="tab.path" custom
                        v-slot="{ href, navigate, isActive }">
                        <a :href="href" @click="navigate" :class="[
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 relative',
                            isActive
                                ? 'text-indigo-700 border-indigo-600 bg-indigo-50/50'
                                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                        ]">
                            <Icon :name="tab.icon" size="18" />
                            <span>{{ tab.name }}</span>
                        </a>
                    </NuxtLink>
                </nav>
            </div>
            <div class="pt-6">
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
        icon: 'carbon:list'
    },
    {
        name: 'Board',
        path: `/projects/${route.params.id}/boards`,
        icon: 'carbon:grid'
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
