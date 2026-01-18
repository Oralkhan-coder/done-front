<template>
    <div>
        <DataTable :value="projectStore.projects" table-style="min-width: 50rem">
            <Column field="code" header="Code"/>
            <Column field="title" header="Title"/>
            <Column field="createdAt" header="Created Date"/>
        </DataTable>
    </div>
</template>

<script setup>
const projectStore = useProjectStore();
await projectStore.getProjects();
</script>

<style></style>
