<template>
  <div class="w-1/2 min-h-1/2 bg-gray-50 rounded-lg">
    <div class=" p-4 mb-5">
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
        <Button label="Submit" class="flex-1 cursor-pointer w-full" @click="updateProject(project)" />
      </div>
    </div>
  </div>
</template>

<script setup>
const { project } = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['updateproject'])

const updateProject = async () => {
  emits('updateproject', project)
}
</script>

<style></style>