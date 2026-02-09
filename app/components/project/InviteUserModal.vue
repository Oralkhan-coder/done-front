<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                @click.self="close">
                <div class="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden transform transition-all"
                    role="dialog" aria-modal="true">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h3 class="font-semibold text-slate-800">Invite User</h3>
                        <button @click="close"
                            class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Icon name="carbon:close" size="20" />
                        </button>
                    </div>

                    <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
                        <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {{ error }}
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div class="relative">
                                <span
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Icon name="carbon:email" size="18" />
                                </span>
                                <input v-model="form.email" type="email" required placeholder="colleague@company.com"
                                    class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-slate-900 placeholder-slate-400 transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <div class="relative">
                                <span
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Icon name="carbon:user-role" size="18" />
                                </span>
                                <select v-model="form.role"
                                    class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-slate-900 transition-colors appearance-none bg-white">
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <span
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                    <Icon name="carbon:chevron-down" size="16" />
                                </span>
                            </div>
                        </div>

                        <div class="flex items-center justify-end gap-3 pt-2">
                            <button type="button" @click="close"
                                class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" :disabled="loading"
                                class="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Icon v-if="loading" name="carbon:circle-dash" class="animate-spin mr-2" />
                                <span v-else>Add</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
const props = defineProps({
    modelValue: Boolean,
    projectId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:modelValue', 'success']);
const projectStore = useProjectStore();

const form = reactive({
    email: '',
    role: 'member'
});

const loading = ref(false);
const error = ref('');

const close = () => {
    emit('update:modelValue', false);
    setTimeout(() => {
        form.email = '';
        form.role = 'member';
        error.value = '';
    }, 200);
};

const handleSubmit = async () => {
    if (!form.email) return;

    loading.value = true;
    error.value = '';

    try {
        await projectStore.inviteUser(props.projectId, {
            email: form.email,
            role: form.role
        });
        emit('success');
        close();
    } catch (e) {
        error.value = e.message || 'Failed to send invitation';
    } finally {
        loading.value = false;
    }
};
</script>
