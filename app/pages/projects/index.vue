<template>
    <div>
        <Button label='Create' class="p-1 px-4 mb-4">
            <template #icon>
                <Icon name="carbon:add-alt" />
            </template>
        </Button>
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
                            <Icon name="carbon:magic-wand-filled" size="20px" />
                        </Button>

                        <Button text rounded severity="danger" aria-label="Delete">
                            <Icon name="carbon:trash-can" size="20px" />
                        </Button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
const projectStore = useProjectStore();
await projectStore.getProjects();
</script>

<style></style>
