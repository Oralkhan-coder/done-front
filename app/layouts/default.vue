<template>
    <div class="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <aside :class="[
            'bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-20 shadow-sm',
            isCollapsed ? 'w-16' : 'w-64',
        ]">
            <div class="h-14 flex items-center justify-between px-3 border-b border-slate-100">
                <div v-if="!isCollapsed" class="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <div
                        class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                        D
                    </div>
                    <span class="font-bold text-lg text-slate-800 tracking-tight">Done</span>
                </div>
                <div v-else class="w-full flex justify-center">
                    <div
                        class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                        D
                    </div>
                </div>
                <button v-if="!isCollapsed" @click="isCollapsed = !isCollapsed"
                    class="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
                    <Icon name="carbon:chevron-left" size="18" />
                </button>
            </div>
            <div v-if="isCollapsed" class="w-full flex justify-center mt-2">
                <button @click="isCollapsed = !isCollapsed"
                    class="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
                    <Icon name="carbon:chevron-right" size="18" />
                </button>
            </div>
            <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" custom
                    v-slot="{ href, navigate, isActive }">
                    <a :href="href" @click="navigate" :class="[
                        'flex items-center px-2 py-1.5 rounded-lg transition-all duration-200 group relative overflow-hidden',
                        isActive
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
                    ]" :title="isCollapsed ? item.label : ''">
                        <Icon :name="item.icon" size="18"
                            :class="[isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600']" />
                        <span :class="[
                            'ml-3 text-xs transition-opacity duration-300 flex-1',
                            isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100',
                        ]">
                            {{ item.label }}
                        </span>

                        <!-- 3 Dots Menu for Projects -->
                        <div v-if="item.label === 'Projects' && currentProjectId && !isCollapsed"
                            class="flex items-center">
                            <button @click.stop.prevent="toggleProjectMenu"
                                class="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                <Icon name="carbon:overflow-menu-horizontal" size="16" />
                            </button>
                        </div>

                        <div v-if="isActive"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-600 rounded-r-full">
                        </div>
                    </a>
                </NuxtLink>
            </nav>
            <div class="p-3 border-t border-slate-100 space-y-2">
                <button @click="goToProfile"
                    class="w-full flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50 transition-colors text-left"
                    :title="isCollapsed ? userDisplayName : ''">
                    <img :src="userAvatar" alt="User" class="w-8 h-8 rounded-full border border-slate-200 bg-slate-50" />
                    <div :class="[
                        'overflow-hidden transition-all duration-300',
                        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                    ]">
                        <p class="text-xs font-semibold text-slate-900 truncate">{{ userDisplayName }}</p>
                        <p class="text-[10px] text-slate-500 truncate">{{ userPlan }}</p>
                    </div>
                </button>
                <button @click="handleLogout" :class="[
                    'w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200',
                    'text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-medium',
                    isCollapsed ? 'px-1' : 'px-2',
                ]" :title="isCollapsed ? 'Logout' : ''">
                    <Icon name="carbon:logout" size="16" />
                    <span :class="[
                        'transition-opacity duration-300',
                        isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100',
                    ]">
                        Logout
                    </span>
                </button>
            </div>
        </aside>

        <!-- Project Context Menu -->
        <OverlayPanel ref="projectMenu">
            <div class="w-40 py-1">
                <button @click="openInviteModal"
                    class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <Icon name="carbon:user-follow" size="14" />
                    Add User
                </button>
            </div>
        </OverlayPanel>

        <!-- Invite User Modal -->
        <ProjectInviteUserModal v-if="currentProjectId" v-model="showInviteModal" :project-id="currentProjectId"
            @success="handleInviteSuccess" />

        <main class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
            <div class="flex-1 overflow-auto px-6 md:px-8">
                <slot />
            </div>
        </main>
    </div>
</template>
<script setup>
const authStore = useAuthStore();
const route = useRoute();
const isCollapsed = ref(false);
const showInviteModal = ref(false);
const projectMenu = ref(null);

const currentProjectId = computed(() => {
    return route.params.id;
});

const navItems = [
    { label: 'Dashboard', to: '/', icon: 'carbon:home' },
    { label: 'Projects', to: '/projects', icon: 'carbon:layers' },
];

const userDisplayName = computed(() => {
    return authStore.currentUser?.fullName || authStore.currentUser?.email || 'User';
});

const userPlan = computed(() => {
    return authStore.currentUser?.plan || 'Member';
});

const userAvatar = computed(() => {
    const avatarFromBackend = authStore.currentUser?.avatar;
    if (avatarFromBackend) return avatarFromBackend;

    const seed = encodeURIComponent(userDisplayName.value || 'User');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
});

const goToProfile = () => {
    navigateTo('/profile');
};

const handleLogout = () => {
    authStore.logout();
};

const toggleProjectMenu = (event) => {
    projectMenu.value.toggle(event);
};

const openInviteModal = () => {
    showInviteModal.value = true;
    projectMenu.value.hide();
};

const handleInviteSuccess = () => {
    // Optional: Show success toast/notification
};

if (authStore.isAuthenticated) {
    await authStore.fetchCurrentUser();
}
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
