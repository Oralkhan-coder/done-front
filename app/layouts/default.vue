<template>
    <div class="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <aside :class="[
            'bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-20 shadow-sm',
            isCollapsed ? 'w-20' : 'w-64'
        ]">
            <div class="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                <div v-if="!isCollapsed" class="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <div
                        class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        D
                    </div>
                    <span class="font-bold text-xl text-slate-800 tracking-tight">Done</span>
                </div>
                <div v-else class="w-full flex justify-center">
                    <div
                        class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        D
                    </div>
                </div>

                <button v-if="!isCollapsed" @click="isCollapsed = !isCollapsed"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
                    <Icon name="carbon:chevron-left" size="20" />
                </button>
            </div>

            <div v-if="isCollapsed" class="w-full flex justify-center mt-2">
                <button @click="isCollapsed = !isCollapsed"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
                    <Icon name="carbon:chevron-right" size="20" />
                </button>
            </div>


            <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" custom
                    v-slot="{ href, navigate, isActive }">
                    <a :href="href" @click="navigate" :class="[
                        'flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                        isActive
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    ]" :title="isCollapsed ? item.label : ''">
                        <Icon :name="item.icon" size="22"
                            :class="[isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600']" />

                        <span :class="[
                            'ml-3 transition-opacity duration-300',
                            isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
                        ]">
                            {{ item.label }}
                        </span>

                        <div v-if="isActive"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full"></div>
                    </a>
                </NuxtLink>
            </nav>

            <div class="p-4 border-t border-slate-100">
                <div class="flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User"
                        class="w-10 h-10 rounded-full border border-slate-200 bg-slate-50" />
                    <div
                        :class="['overflow-hidden transition-all duration-300', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100']">
                        <p class="text-sm font-medium text-slate-900 truncate">Oral Khan</p>
                        <p class="text-xs text-slate-500 truncate">Pro Plan</p>
                    </div>
                </div>
            </div>
        </aside>

        <main class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
            <div class="flex-1 overflow-auto p-6 md:p-8">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
const isCollapsed = ref(false);

const navItems = [
    { label: 'Dashboard', to: '/', icon: 'carbon:home' },
    { label: 'Projects', to: '/projects', icon: 'carbon:layers' },
];
</script>

<style scoped>
nav::-webkit-scrollbar {
    width: 4px;
}

nav::-webkit-scrollbar-thumb {
    background-color: theme('colors.slate.200');
    border-radius: 4px;
}
</style>
