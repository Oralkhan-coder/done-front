<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title">Create Task</h2>
                        <button class="close-btn" @click="handleClose">
                            <Icon name="carbon:close" size="24" />
                        </button>
                    </div>
                    <form @submit.prevent="handleSubmit" class="modal-body">
                        <div class="form-group">
                            <label for="task-title" class="form-label required">Title</label>
                            <InputText
                                id="task-title"
                                v-model="formData.title"
                                placeholder="Enter task title"
                                class="w-full"
                                :class="{ 'p-invalid': errors.title }"
                            />
                            <small v-if="errors.title" class="error-message">{{ errors.title }}</small>
                        </div>
                        <div class="form-group">
                            <label for="task-description" class="form-label">Description</label>
                            <Textarea
                                id="task-description"
                                v-model="formData.description"
                                placeholder="Add a description..."
                                rows="4"
                                class="w-full"
                            />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="task-priority" class="form-label">Priority</label>
                                <Select
                                    id="task-priority"
                                    v-model="formData.priority"
                                    :options="priorities"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Select priority"
                                    class="w-full"
                                />
                            </div>
                            <div class="form-group">
                                <label for="task-story-point" class="form-label">Story Points</label>
                                <InputNumber
                                    id="task-story-point"
                                    v-model="formData.storyPoint"
                                    placeholder="Enter story points"
                                    class="w-full"
                                    :min="0"
                                />
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="task-assignee" class="form-label">Assignee</label>
                            <Select
                                id="task-assignee"
                                v-model="formData.assigneeId"
                                :options="projectMembers"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select assignee"
                                class="w-full"
                                :loading="loadingMembers"
                            />
                        </div>
                        <div class="modal-actions">
                            <Button label="Cancel" severity="secondary" outlined @click="handleClose" type="button" />
                            <Button
                                label="Create Task"
                                icon="carbon:add"
                                :loading="isSubmitting"
                                type="submit"
                                class="bg-indigo-600 border-indigo-600"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    statusId: {
        type: Number,
        required: true,
    },
});
const emit = defineEmits(['close', 'submit']);
const route = useRoute();
const boardStore = useBoardStore();
const projectUsersStore = useProjectUsersStore();

const formData = reactive({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: null,
    storyPoint: null,
});

const errors = reactive({
    title: '',
});

const isSubmitting = ref(false);

const priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

// Use computed to get project members from store
const projectMembers = computed(() => {
    return projectUsersStore.getUsersForDropdown(true);
});

const loadingMembers = computed(() => {
    return projectUsersStore.isLoading;
});

const validateForm = () => {
    errors.title = '';
    if (!formData.title.trim()) {
        errors.title = 'Title is required';
        return false;
    }
    return true;
};

const resetForm = () => {
    formData.title = '';
    formData.description = '';
    formData.priority = 'medium';
    formData.assigneeId = null;
    formData.storyPoint = null;
    errors.title = '';
};

const handleClose = () => {
    resetForm();
    boardStore.closeModals();
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;
    try {
        const requestBody = {
            title: formData.title,
            statusId: props.statusId,
        };

        if (formData.description) {
            requestBody.description = formData.description;
        }
        if (formData.priority) {
            requestBody.priority = formData.priority;
        }
        if (formData.assigneeId) {
            requestBody.assigneeId = formData.assigneeId;
        }
        if (formData.storyPoint !== null && formData.storyPoint !== undefined) {
            requestBody.storyPoint = formData.storyPoint;
        }

        const response = await $api(`/projects/${route.params.id}/tasks`, {
            method: 'POST',
            body: requestBody,
        });

        console.log('Task creation response:', response);

        const column = boardStore.board.find((col) => col.statusId === props.statusId);
        if (column && response) {
            if (!column.tasks) column.tasks = [];
            const newTask = {
                ...response,
                title: response.title || formData.title,
                description: response.description || formData.description,
                priority: response.priority || formData.priority,
                statusId: response.statusId || props.statusId,
            };
            console.log('Adding task to board:', newTask);
            column.tasks.push(newTask);
        }

        resetForm();
        boardStore.closeModals();
    } catch (error) {
        console.error('Failed to create task:', error);
    } finally {
        isSubmitting.value = false;
    }
};

watch(
    () => props.isOpen,
    (newVal) => {
        if (newVal) {
            if (route.params.id) {
                projectUsersStore.fetchProjectUsers(route.params.id);
            }
        } else {
            resetForm();
        }
    },
);
</script>
<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
}

.modal-container {
    background: white;
    border-radius: 16px;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid var(--surface-200);
}

.modal-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--surface-900);
    margin: 0;
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--surface-500);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: var(--surface-100);
    color: var(--surface-900);
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--surface-700);
    margin-bottom: 8px;
}

.form-label.required::after {
    content: ' *';
    color: #ef4444;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.error-message {
    display: block;
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
}

.modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--surface-200);
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
    transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-container {
    transform: scale(0.95) translateY(-20px);
}

.modal-leave-to .modal-container {
    transform: scale(0.95) translateY(20px);
}

@media (max-width: 640px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>
