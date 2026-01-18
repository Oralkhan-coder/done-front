<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Create New Project</h1>
        <p class="text-slate-500 mt-1">Fill in the details below to create a new project workspace.</p>
      </div>

      <form class="space-y-6" @submit.prevent="projectStore.createProject(project)">
        <div class="grid gap-6">
          <div class="space-y-1.5">
            <label for="title" class="block text-sm font-medium text-slate-700">Project Title</label>
            <InputText id="title" v-model="project.title"
              class="w-full !rounded-lg !border-slate-300 focus:!border-indigo-500 focus:!ring-indigo-500"
              placeholder="e.g. Website Redesign" />
          </div>

          <div class="space-y-1.5">
            <label for="code" class="block text-sm font-medium text-slate-700">Project Code</label>
            <InputText id="code" v-model="project.code"
              class="w-full !rounded-lg !border-slate-300 focus:!border-indigo-500 focus:!ring-indigo-500 uppercase"
              placeholder="e.g. WEB-01" />
            <p class="text-xs text-slate-500">A unique identifier for your project.</p>
          </div>

          <div class="space-y-1.5">
            <label for="description" class="block text-sm font-medium text-slate-700">Description</label>
            <Textarea id="description" v-model="project.description" rows="5"
              class="w-full !rounded-lg !border-slate-300 focus:!border-indigo-500 focus:!ring-indigo-500"
              placeholder="Describe the goals and scope of this project..." style="resize: none" />
          </div>
        </div>

        <div class="flex items-center gap-4 pt-4 border-t border-slate-100">
          <NuxtLink :to="{ name: 'projects' }" class="flex-1">
            <Button label="Cancel" severity="secondary" outlined class="w-full" />
          </NuxtLink>
          <Button type="submit" label="Create Project" icon="carbon:arrow-right" iconPos="right"
            class="flex-1 bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700" />
        </div>
      </form>
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