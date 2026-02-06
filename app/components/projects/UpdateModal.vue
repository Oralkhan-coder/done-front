<template>
    <div class="w-full">
        <form @submit.prevent="updateProject" class="space-y-6">
            <div class="grid gap-6">
                <div class="space-y-1.5">
                    <label for="edit-title" class="block text-sm font-medium text-slate-700">Project Title</label>
                    <InputText
                        id="edit-title"
                        v-model="project.title"
                        class="w-full !rounded-lg !border-slate-300 focus:!border-indigo-500 focus:!ring-indigo-500"
                    />
                </div>
                <div class="space-y-1.5">
                    <label for="edit-code" class="block text-sm font-medium text-slate-700">Project Code</label>
                    <InputText
                        id="edit-code"
                        v-model="project.code"
                        class="w-full !rounded-lg !border-slate-300 focus:!border-indigo-500 focus:!ring-indigo-500 uppercase"
                    />
                </div>
                <div class="space-y-1.5">
                    <label for="edit-description" class="block text-sm font-medium text-slate-700">Description</label>
                    <Textarea
                        id="edit-description"
                        v-model="project.description"
                        rows="5"
                        class="w-full !rounded-lg !border-slate-300 focus:!border-indigo-500 focus:!ring-indigo-500"
                        style="resize: none"
                    />
                </div>
            </div>
            <div class="flex items-center justify-end pt-2">
                <Button
                    type="submit"
                    label="Save Changes"
                    icon="carbon:save"
                    class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                />
            </div>
        </form>
    </div>
</template>
<script setup>
const props = defineProps({
    project: {
        type: Object,
        required: true,
    },
});
const emits = defineEmits(['updateproject']);
const updateProject = () => {
    emits('updateproject', props.project);
};
</script>
