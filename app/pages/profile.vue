<template>
    <div class="max-w-5xl mx-auto py-8">
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
            <div class="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900">Profile</h1>
                    <p class="text-sm text-slate-500 mt-1">Manage your account information</p>
                </div>
                <NuxtLink to="/" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                    Back
                </NuxtLink>
            </div>

            <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
                <img :src="userAvatar" alt="Profile avatar" class="w-20 h-20 rounded-full border border-slate-200 bg-slate-50" />
                <div>
                    <p class="text-base font-semibold text-slate-900">{{ form.fullName || 'User' }}</p>
                    <p class="text-sm text-slate-500">{{ form.email || '-' }}</p>
                </div>
            </div>

            <form class="space-y-5" @submit.prevent="handleUpdateProfile">
                <div class="space-y-2">
                    <label for="fullName" class="text-sm font-medium text-slate-700">Full name</label>
                    <input
                        id="fullName"
                        v-model="form.fullName"
                        type="text"
                        class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Your full name"
                    />
                </div>

                <div class="space-y-2">
                    <label for="email" class="text-sm font-medium text-slate-700">Email</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="name@example.com"
                    />
                </div>

                <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
                <p v-if="successMessage" class="text-sm text-emerald-600">{{ successMessage }}</p>

                <button
                    type="submit"
                    :disabled="isSaving || authStore.userLoading"
                    class="w-full py-3 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {{ isSaving ? 'Saving...' : 'Update profile' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
const authStore = useAuthStore();
const { $api } = useNuxtApp();

const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive({
    fullName: '',
    email: '',
});

const syncFormWithStore = () => {
    form.fullName = authStore.currentUser?.fullName || '';
    form.email = authStore.currentUser?.email || '';
};

const userAvatar = computed(() => {
    const avatarFromBackend = authStore.currentUser?.avatar;
    if (avatarFromBackend) return avatarFromBackend;

    const seed = encodeURIComponent(form.fullName || form.email || 'User');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
});

const updateViaEndpoints = async (payload) => {
    const endpoints = ['/users/me', '/profile', '/me'];
    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            await $api(endpoint, {
                method: 'PATCH',
                body: payload,
            });
            return true;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('Failed to update profile');
};

const handleUpdateProfile = async () => {
    if (!form.email?.trim()) {
        errorMessage.value = 'Email is required';
        successMessage.value = '';
        return;
    }

    isSaving.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
        await updateViaEndpoints({
            fullName: form.fullName,
            name: form.fullName,
            email: form.email,
        });

        await authStore.fetchCurrentUser(true);
        syncFormWithStore();
        successMessage.value = 'Profile updated';
    } catch (error) {
        errorMessage.value = error?.data?.message || error?.message || 'Failed to update profile';
    } finally {
        isSaving.value = false;
    }
};

await authStore.fetchCurrentUser();
syncFormWithStore();
</script>
