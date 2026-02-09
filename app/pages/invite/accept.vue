<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
        <div class="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
            <div v-if="loading" class="space-y-4">
                <Icon name="carbon:circle-dash" class="animate-spin mx-auto text-primary-600" size="48" />
                <h2 class="text-xl font-semibold text-slate-800">Validating Invitation...</h2>
                <p class="text-slate-500">Please wait while we check your invitation link.</p>
            </div>

            <div v-else-if="error" class="space-y-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="carbon:warning" class="text-red-600" size="32" />
                </div>
                <h2 class="text-xl font-semibold text-slate-800">Invalid Invitation</h2>
                <p class="text-slate-500">{{ error }}</p>
                <NuxtLink 
                    to="/" 
                    class="inline-block mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                    Go Home
                </NuxtLink>
            </div>

            <div v-else class="space-y-4">
                <Icon name="carbon:checkmark-outline" class="animate-bounce mx-auto text-green-600" size="48" />
                <h2 class="text-xl font-semibold text-slate-800">Invitation Verified</h2>
                <p class="text-slate-500">Redirecting you to complete your registration...</p>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: false
});

const route = useRoute();
const loading = ref(true);
const error = ref('');

onMounted(async () => {
    const token = route.query.token;

    if (!token) {
        error.value = 'No invitation token provided.';
        loading.value = false;
        return;
    }

    try {
        // Store token for later use during registration/OTP
        localStorage.setItem('inviteToken', token);

        const response = await $fetch(`http://localhost:3000/invitation/validate`, {
            params: { token }
        });

        if (!response.valid) {
            error.value = 'This invitation link is invalid or has expired.';
            loading.value = false;
            return;
        }

        if (response.userExists) {
            // If user already exists, redirect to login
            // The user handling for existing users might need more specific requirements,
            // but for now redirecting to login seems appropriate.
            // Ideally, the backend might handle adding them to the project directly if they exist,
            // or we might need another flow.
            // For this task, we focus on the "no account" flow.
             await navigateTo('/login?email=' + response.email);
        } else {
            // Redirect to register with prefilled email
            await navigateTo(`/register?email=${response.email}`);
        }

    } catch (e) {
        error.value = e.message || 'Failed to validate invitation.';
    } finally {
        if (!error.value) {
            // Keep loading true if we are redirecting to avoid flash of content
            // or we could set it to false if we want to show the success message briefly
            // Let's show success message briefly
             loading.value = false;
        } else {
             loading.value = false;
        }
    }
});
</script>
