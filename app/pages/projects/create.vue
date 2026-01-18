<template>
  <div class="w-1/2 p-4 mx-auto">
    <div class="w-full border border-gray-200 p-4">

      <div class="w-full mb-2">
        <FloatLabel variant="on" class="w-full">
          <InputText id="title" v-model="project.title" class="w-full" />
          <label for="title">Title</label>
        </FloatLabel>
      </div>

      <div class="w-full mb-2">
        <FloatLabel variant="on" class="w-full">
          <InputText id="code" v-model="project.code" class="w-full" />
          <label for="code">Code</label>
        </FloatLabel>
      </div>

      <div class="w-full mb-2">
        <FloatLabel variant="on" class="w-full">
          <Textarea id="description" v-model="project.description" rows="5" cols="30" class="w-full"
            style="resize: none" />
          <label for="description">Description</label>
        </FloatLabel>
      </div>

      <div class="w-full flex items-center gap-2 mt-3">
        <NuxtLink class="flex-1" :to="{ name: 'projects' }">
          <Button label="Cancel" class="w-full bg-sky-400 cursor-pointer hover:!bg-sky-700" />
        </NuxtLink>
        <Button label="Submit" class="flex-1 cursor-pointer w-full" @click="projectStore.createProject(project)" />
      </div>

    </div>
  </div>
</template>

<script setup>
const projectStore = useProjectStore()

const project = reactive({
  title: '',
  code: '',
  description: '',
})
</script>

<style></style>