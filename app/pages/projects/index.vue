<template>
    <div class="h-full overflow-y-auto p-6 md:p-8">
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900">Projects</h1>
                    <p class="text-slate-500 mt-1">Manage and track your ongoing projects.</p>
                </div>
                <NuxtLink :to="{ name: 'projects-create' }">
                    <Button
                        label="New Project"
                        icon="carbon:add"
                        size="small"
                        class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                    />
                </NuxtLink>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <DataTable
                    :value="projectStore.projects"
                    :pt="{
                        table: { class: 'w-full' },
                        thead: { class: 'bg-slate-50 border-b border-slate-200' },
                        bodyRow: {
                            class: 'hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0',
                        },
                    }"
                >
                    <Column field="title" class="py-4 px-6 text-slate-800 font-medium">
                        <template #header>
                            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >Project Name</span
                            >
                        </template>
                        <template #body="slotProps">
                            <NuxtLink
                                :to="`/projects/${slotProps.data.id}/boards`"
                                class="group flex items-center gap-3"
                            >
                                <div
                                    class="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                                >
                                    {{ slotProps.data.title.charAt(0) }}
                                </div>
                                <span class="group-hover:text-indigo-600 transition-colors font-semibold">{{
                                    slotProps.data.title
                                }}</span>
                            </NuxtLink>
                        </template>
                    </Column>
                    <Column field="code" class="py-4 px-6 text-slate-600">
                        <template #header>
                            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</span>
                        </template>
                        <template #body="slotProps">
                            <span
                                class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-mono font-medium border border-slate-200"
                            >
                                {{ slotProps.data.code }}
                            </span>
                        </template>
                    </Column>
                    <Column field="createdAt" class="py-4 px-6 text-slate-600">
                        <template #header>
                            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</span>
                        </template>
                        <template #body="slotProps">
                            <span class="text-sm">{{ formatTime(slotProps.data.createdAt) }}</span>
                        </template>
                    </Column>
                    <Column class="py-4 px-6 w-32">
                        <template #header>
                            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</span>
                        </template>
                        <template #body="slotProps">
                            <div class="flex items-center gap-1">
                                <button
                                    @click="openEditModal(slotProps.data)"
                                    class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Icon name="carbon:edit" size="18" />
                                </button>
                                <button
                                    @click.prevent="projectStore.deleteProject(slotProps.data)"
                                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Icon name="carbon:trash-can" size="18" />
                                </button>
                            </div>
                        </template>
                    </Column>
                    <template #empty>
                        <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Icon name="carbon:search" size="32" class="text-slate-400" />
                            </div>
                            <h3 class="text-lg font-semibold text-slate-900">No projects found</h3>
                            <p class="text-slate-500 max-w-sm mt-1 mb-6">
                                Get started by creating your first project to organize your tasks.
                            </p>
                            <NuxtLink :to="{ name: 'projects-create' }">
                                <Button label="Create Project" icon="carbon:add" size="small" outlined />
                            </NuxtLink>
                        </div>
                    </template>
                </DataTable>
            </div>
            <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                    @click="isEditModalOpen = false"
                ></div>
                <div
                    class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl transform transition-all p-6 space-y-4"
                >
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-slate-900">Edit Project</h3>
                        <button
                            @click="isEditModalOpen = false"
                            class="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <Icon name="carbon:close" size="24" />
                        </button>
                    </div>
                    <ProjectsUpdateModal
                        :project="editedProject"
                        @updateproject="
                            (p) => {
                                projectStore.updateProject(p);
                                isEditModalOpen = false;
                            }
                        "
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const isEditModalOpen = ref(false);
const editedProject = reactive({
    id: 0,
    title: '',
    description: '',
    code: '',
});
const projectStore = useProjectStore();
await projectStore.getProjects();
const openEditModal = (project) => {
    isEditModalOpen.value = true;
    Object.assign(editedProject, {
        id: project.id,
        title: project.title,
        description: project.description,
        code: project.code,
    });
};
</script>
