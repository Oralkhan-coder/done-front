<template>
    <div>
        <NuxtLink :to="{ name: 'projects-create' }" class="m-0 p-0">
            <Button label='Create' class="p-1 px-4 mb-4">
                <template #icon>
                    <Icon name="carbon:add-alt" />
                </template>
            </Button>
        </NuxtLink>

        <div v-if="isEditModalOpen" @click="isEditModalOpen = false" class="modal-shadow">
            <ProjectsUpdateModal :project="editedProject" @updateproject="projectStore.updateProject" @click.stop>
            </ProjectsUpdateModal>
        </div>

        <DataTable :value="projectStore.projects" table-style="min-width: 50rem">
            <Column field="title" header="Title">
                <template #body="slotProps">
                    <NuxtLink :to="{ name: 'projects-id-boards', params: { id: slotProps.data.id } }">
                        {{ slotProps.data.title }}
                    </NuxtLink>
                </template>
            </Column>
            <Column field="code" header="Code" />
            <Column field="createdAt" header="Created Date">
                <template #body="slotProps">
                    {{ formatTime(slotProps.data.createdAt) }}
                </template>
            </Column>
            <Column header="Actions" style="width: 120px">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button text rounded aria-label="Edit">
                            <Icon name="carbon:magic-wand-filled" size="20px" @click="openEditModal(slotProps.data)" />
                        </Button>

                        <Button @click.prevent="projectStore.deleteProject(slotProps.data)" text rounded
                            severity="danger" aria-label="Delete">
                            <Icon name="carbon:trash-can" size="20px" />
                        </Button>
                    </div>
                </template>
            </Column>
            <template #empty> No projects found. </template>
        </DataTable>
    </div>
</template>

<script setup>
const isEditModalOpen = ref(false)
const editedProject = reactive({
    id: 0,
    title: "",
    description: "",
    code: ""
})
const projectStore = useProjectStore();
await projectStore.getProjects();


const openEditModal = (project) => {
    isEditModalOpen.value = true
    Object.assign(editedProject, {
        id: project.id,
        title: project.title,
        description: project.description,
        code: project.code
    })
}
</script>

<style>
.modal-shadow {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, .7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
}
</style>
