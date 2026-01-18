<template>
    <div class="bg-slate-50 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-800">Welcome Back</h1>
                <p class="text-slate-500 mt-2">Please enter your details to sign in</p>
            </div>

            <form action="#" class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                        id="email"
                        v-model="authStore.credentials.email"
                        type="email"
                        placeholder="name@company.com"
                        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        required
                    />
                </div>

                <div>
                    <div class="flex justify-between mb-1">
                        <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                        <a href="#" class="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Forgot?</a>
                    </div>
                    <input
                        id="password"
                        v-model="authStore.credentials.password"
                        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        type="password"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]"
                    type="submit"
                    @click.prevent="authStore.login(authStore.credentials)"
                >
                    Sign In
                </button>
            </form>

            <p class="text-center text-slate-600 mt-8 text-sm">
                Don't have an account?
                <a href="#" class="font-semibold text-indigo-600 hover:underline">Create an account</a>
            </p>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: false,
});

const authStore = useAuthStore();
</script>

<style></style>
