<template>
    <div class="min-h-screen grid lg:grid-cols-2">
        <!-- Left Side - Form -->
        <div class="flex items-center justify-center p-8 bg-surface-0">
            <div class="w-full max-w-md space-y-8">
                <div class="text-center lg:text-left">
                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white font-bold text-xl mb-6">
                        D
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                    <p class="mt-2 text-slate-500">Please enter your details to sign in.</p>
                </div>

                <form class="mt-8 space-y-6" @submit.prevent="authStore.login(authStore.credentials)">
                    <div class="space-y-4">
                        <div>
                            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Icon name="carbon:email" size="20" />
                                </span>
                                <input
                                    id="email"
                                    v-model="authStore.credentials.email"
                                    type="email"
                                    required
                                    class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                                <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
                            </div>
                            <div class="relative">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Icon name="carbon:password" size="20" />
                                </span>
                                <input
                                    id="password"
                                    v-model="authStore.credentials.password"
                                    type="password"
                                    required
                                    class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-md transform active:scale-[0.99]"
                    >
                        Sign in
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
                        <button type="button" class="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            <Icon name="logos:google-icon" class="mr-2" /> Google
                        </button>
                        <button type="button" class="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            <Icon name="logos:github-icon" class="mr-2" /> GitHub
                        </button>
                    </div>
                </form>

                <p class="text-center text-sm text-slate-600">
                    Don't have an account?
                    <a href="#" class="font-medium text-primary-600 hover:text-primary-500 hover:underline">Sign up for free</a>
                </p>
            </div>
        </div>

        <!-- Right Side - Image/Feature -->
        <div class="hidden lg:block relative bg-slate-900 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-slate-900/90 z-10"></div>
            <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
                alt="Background" 
                class="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div class="absolute inset-0 flex flex-col justify-end p-12 z-20 text-white">
                <blockquote class="space-y-4">
                    <p class="text-lg font-medium italic">
                        "This project management tool has completely transformed how our team operates. The clarity and efficiency we've gained is unmatched."
                    </p>
                    <footer class="text-sm font-medium text-slate-300">
                        — Sofia Davis, Product Manager
                    </footer>
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
</script>
