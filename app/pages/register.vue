<template>
    <div class="min-h-screen grid lg:grid-cols-2">
        <div class="flex items-center justify-center p-8 bg-surface-0">
            <div class="w-full max-w-md space-y-8">
                <div class="text-center lg:text-left">
                    <div
                        class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white font-bold text-xl mb-6"
                    >
                        D
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h2>
                    <p class="mt-2 text-slate-500">Get started with your free account today.</p>
                </div>

                <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
                    <div class="space-y-4">
                        <div>
                            <label for="fullName" class="block text-sm font-medium text-slate-700 mb-1"
                                >Full Name</label
                            >
                            <div class="relative">
                                <span
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
                                >
                                    <Icon name="carbon:user" size="20" />
                                </span>
                                <input
                                    id="fullName"
                                    v-model="registrationData.fullName"
                                    type="text"
                                    required
                                    class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-slate-700 mb-1"
                                >Email address</label
                            >
                            <div class="relative">
                                <span
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
                                >
                                    <Icon name="carbon:email" size="20" />
                                </span>
                                <input
                                    id="email"
                                    v-model="registrationData.email"
                                    type="email"
                                    required
                                    class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div class="relative">
                                <span
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
                                >
                                    <Icon name="carbon:password" size="20" />
                                </span>
                                <input
                                    id="password"
                                    v-model="registrationData.password"
                                    type="password"
                                    required
                                    minlength="6"
                                    class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p class="mt-1 text-xs text-slate-500">Must be at least 6 characters long</p>
                        </div>

                        <div>
                            <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1"
                                >Confirm Password</label
                            >
                            <div class="relative">
                                <span
                                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
                                >
                                    <Icon name="carbon:password" size="20" />
                                </span>
                                <input
                                    id="confirmPassword"
                                    v-model="confirmPassword"
                                    type="password"
                                    required
                                    class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p class="text-sm text-red-600">{{ errorMessage }}</p>
                    </div>

                    <div v-if="successMessage" class="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p class="text-sm text-green-600">{{ successMessage }}</p>
                    </div>

                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-md transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="!isLoading">Create account</span>
                        <span v-else class="flex items-center">
                            <Icon name="carbon:circle-dash" class="animate-spin mr-2" size="20" />
                            Creating account...
                        </span>
                    </button>

                    <div class="relative my-6">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-slate-200"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-white text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            class="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Icon name="logos:google-icon" class="mr-2" /> Google
                        </button>
                        <button
                            type="button"
                            class="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Icon name="logos:github-icon" class="mr-2" /> GitHub
                        </button>
                    </div>
                </form>

                <p class="text-center text-sm text-slate-600">
                    Already have an account?
                    <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500 hover:underline">
                        Sign in</NuxtLink
                    >
                </p>
            </div>
        </div>

        <div class="hidden lg:block relative bg-slate-900 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-slate-900/90 z-10"></div>
            <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2564&auto=format&fit=crop"
                alt="Background"
                class="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div class="absolute inset-0 flex flex-col justify-end p-12 z-20 text-white">
                <blockquote class="space-y-4">
                    <p class="text-lg font-medium italic">
                        "Join thousands of teams who trust our platform to manage their projects efficiently and
                        collaboratively."
                    </p>
                    <footer class="text-sm font-medium text-slate-300">— Alex Johnson, Engineering Lead</footer>
                </blockquote>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: false,
});

const authStore = useAuthStore();

const registrationData = reactive({
    email: '',
    password: '',
    fullName: '',
});

const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (registrationData.password !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
    }

    if (registrationData.password.length < 6) {
        errorMessage.value = 'Password must be at least 6 characters long';
        return;
    }

    isLoading.value = true;

    try {
        await authStore.register(registrationData);
        successMessage.value = 'Account created successfully! Redirecting...';

        registrationData.email = '';
        registrationData.password = '';
        registrationData.fullName = '';
        confirmPassword.value = '';

        setTimeout(() => {
            navigateTo('/login');
        }, 1500);
    } catch (error) {
        errorMessage.value = error.message || 'Registration failed. Please try again.';
    } finally {
        isLoading.value = false;
    }
};
</script>
