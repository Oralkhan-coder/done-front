<template>
    <div class="space-y-8 p-6 md:p-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p class="text-slate-500 mt-1">Welcome back, {{ displayName }}. Here's what's happening today.</p>
            </div>
            <div class="flex gap-3">
                <NuxtLink to="/projects/create">
                    <Button
                        label="New Project"
                        icon="carbon:add"
                        size="small"
                        class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                    />
                </NuxtLink>
            </div>
        </div>

        <div
            v-if="loadError"
            class="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
            <span>{{ loadError }}</span>
            <Button label="Retry" size="small" outlined class="!text-red-700 !border-red-300" @click="loadDashboard" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
                v-for="card in statsCards"
                :key="card.key"
                class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
                <div class="z-10">
                    <p class="text-slate-500 text-sm font-medium">{{ card.label }}</p>
                    <p class="text-3xl font-bold text-slate-800 mt-2">
                        <span v-if="isLoading" class="inline-block h-8 w-14 bg-slate-100 animate-pulse rounded"></span>
                        <span v-else>{{ card.value }}</span>
                    </p>
                </div>
                <div
                    :class="[
                        'absolute right-4 top-4 p-3 rounded-xl transition-colors',
                        card.iconClass,
                    ]"
                >
                    <Icon :name="card.icon" size="24" />
                </div>
            </div>
        </div>
        <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="font-bold text-lg text-slate-800">Recent Projects</h3>
                    <NuxtLink to="/projects" class="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >View All</NuxtLink
                    >
                </div>

                <div v-if="isLoading" class="space-y-4">
                    <div
                        v-for="i in 3"
                        :key="`loading-${i}`"
                        class="h-20 rounded-xl border border-slate-100 bg-slate-50 animate-pulse"
                    ></div>
                </div>
                <div v-else-if="recentProjects.length" class="space-y-4">
                    <NuxtLink
                        v-for="project in recentProjects"
                        :key="project.id"
                        :to="`/projects/${project.id}/boards`"
                        class="flex items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                    >
                        <div
                            class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4 uppercase"
                        >
                            {{ projectMonogram(project) }}
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-slate-800">{{ project.title }}</h4>
                            <p class="text-xs text-slate-500 mt-0.5">
                                {{ formatRelativeTime(project.updatedAt || project.createdAt) }}
                            </p>
                        </div>

                        <div v-if="getProjectMembers(project.id).length" class="flex -space-x-2 mr-4">
                            <div
                                v-for="member in getProjectMembers(project.id).slice(0, 3)"
                                :key="member.key"
                                class="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 text-indigo-700 text-[11px] font-semibold flex items-center justify-center"
                                :title="member.name"
                            >
                                {{ memberInitials(member.name) }}
                            </div>
                            <div
                                v-if="getProjectMembers(project.id).length > 3"
                                class="w-8 h-8 rounded-full border-2 border-white bg-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-center"
                            >
                                +{{ getProjectMembers(project.id).length - 3 }}
                            </div>
                        </div>
                        <div v-else class="mr-4 text-[11px] text-slate-400">No members</div>

                        <span
                            :class="[
                                'px-2.5 py-1 rounded-full text-xs font-medium',
                                getProjectStatus(project.id) === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-indigo-50 text-indigo-600',
                            ]"
                        >
                            {{ getProjectStatus(project.id) }}
                        </span>
                    </NuxtLink>
                </div>
                <div v-else class="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
                    No projects yet. Create your first project to populate the dashboard.
                </div>
            </div>
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 class="font-bold text-lg text-slate-800 mb-6">Quick Actions</h3>
                <div class="space-y-3">
                    <NuxtLink
                        to="/projects/create"
                        class="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                    >
                        <div
                            class="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                        >
                            <Icon name="carbon:add-alt" size="20" />
                        </div>
                        <span class="font-medium text-slate-700 group-hover:text-slate-900">Create New Project</span>
                    </NuxtLink>
                    <NuxtLink
                        to="/projects"
                        class="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                    >
                        <div
                            class="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                        >
                            <Icon name="carbon:user-follow" size="20" />
                        </div>
                        <span class="font-medium text-slate-700 group-hover:text-slate-900">Invite Team Member</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
const authStore = useAuthStore();
const { $api } = useNuxtApp();

const isLoading = ref(true);
const loadError = ref('');

const projects = ref([]);
const boardsByProjectId = ref({});
const membersByProjectId = ref({});

const doneStatusPattern = /done|complete|completed|closed|resolved|finish|finished/i;
const emptyArray = [];

const displayName = computed(() => {
    return authStore.currentUser?.fullName || authStore.currentUser?.email || 'User';
});

const normalizeArray = (value) => {
    return Array.isArray(value) ? value : [];
};

const parseDateValue = (value) => {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
};

const projectMonogram = (project) => {
    const source = (project.code || project.title || 'P').trim();
    return source.slice(0, 2).toUpperCase();
};

const memberInitials = (name) => {
    const normalized = (name || '').trim();
    if (!normalized) return '?';

    return normalized
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
};

const formatRelativeTime = (value) => {
    const timestamp = parseDateValue(value);
    if (!timestamp) return 'Updated recently';

    const diffMs = Date.now() - timestamp;
    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (diffMs < minuteMs) return 'Updated just now';
    if (diffMs < hourMs) {
        const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
        return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    if (diffMs < dayMs) {
        const hours = Math.max(1, Math.floor(diffMs / hourMs));
        return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    if (diffMs < 7 * dayMs) {
        const days = Math.max(1, Math.floor(diffMs / dayMs));
        return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
    }

    return `Updated ${new Date(timestamp).toLocaleDateString()}`;
};

const getProjectMembers = (projectId) => {
    return normalizeArray(membersByProjectId.value[projectId]).map((member, index) => {
        const userId = member?.user?.id ?? member?.userId ?? member?.id ?? null;
        const name = member?.user?.name || member?.name || `User ${index + 1}`;

        return {
            key: userId ? `${projectId}-${userId}` : `${projectId}-member-${index}`,
            userId,
            name,
        };
    });
};

const getProjectTaskSummary = (projectId) => {
    const columns = normalizeArray(boardsByProjectId.value[projectId]);

    return columns.reduce(
        (summary, column) => {
            const tasks = normalizeArray(column?.tasks);
            const taskCount = tasks.length;
            summary.total += taskCount;

            if (doneStatusPattern.test(String(column?.statusTitle || ''))) {
                summary.completed += taskCount;
            }

            return summary;
        },
        { total: 0, completed: 0 },
    );
};

const isProjectCompleted = (projectId) => {
    const summary = getProjectTaskSummary(projectId);
    return summary.total > 0 && summary.completed === summary.total;
};

const getProjectStatus = (projectId) => {
    return isProjectCompleted(projectId) ? 'Completed' : 'In Progress';
};

const totalProjects = computed(() => projects.value.length);

const completedProjects = computed(() => {
    return projects.value.filter((project) => isProjectCompleted(project.id)).length;
});

const inProgressProjects = computed(() => {
    return Math.max(totalProjects.value - completedProjects.value, 0);
});

const uniqueTeamMembers = computed(() => {
    const map = new Map();

    projects.value.forEach((project) => {
        getProjectMembers(project.id).forEach((member) => {
            const mapKey = member.userId ? `id:${member.userId}` : `name:${member.name.toLowerCase()}`;
            if (!map.has(mapKey)) {
                map.set(mapKey, member);
            }
        });
    });

    return Array.from(map.values());
});

const teamMembersCount = computed(() => uniqueTeamMembers.value.length);

const recentProjects = computed(() => {
    return [...projects.value]
        .sort((a, b) => parseDateValue(b.updatedAt || b.createdAt) - parseDateValue(a.updatedAt || a.createdAt))
        .slice(0, 5);
});

const statsCards = computed(() => [
    {
        key: 'total',
        label: 'Total Projects',
        value: totalProjects.value,
        icon: 'carbon:layers',
        iconClass: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
    },
    {
        key: 'in-progress',
        label: 'In Progress',
        value: inProgressProjects.value,
        icon: 'carbon:time',
        iconClass: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    },
    {
        key: 'completed',
        label: 'Completed',
        value: completedProjects.value,
        icon: 'carbon:checkmark-filled',
        iconClass: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    },
    {
        key: 'team-members',
        label: 'Team Members',
        value: teamMembersCount.value,
        icon: 'carbon:user-multiple',
        iconClass: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
    },
]);

const fetchProjects = async () => {
    const response = await $api('/projects');
    return normalizeArray(response);
};

const fetchProjectBoard = async (projectId) => {
    try {
        const response = await $api(`/projects/${projectId}/board`);
        return normalizeArray(response);
    } catch (error) {
        return emptyArray;
    }
};

const fetchProjectMembers = async (projectId) => {
    try {
        const response = await $api(`/projects/${projectId}/users`);
        return normalizeArray(response);
    } catch (error) {
        return emptyArray;
    }
};

const loadDashboard = async () => {
    isLoading.value = true;
    loadError.value = '';

    try {
        if (authStore.isAuthenticated) {
            await authStore.fetchCurrentUser();
        }

        const loadedProjects = await fetchProjects();
        projects.value = loadedProjects;

        if (!loadedProjects.length) {
            boardsByProjectId.value = {};
            membersByProjectId.value = {};
            return;
        }

        const [boards, members] = await Promise.all([
            Promise.all(loadedProjects.map((project) => fetchProjectBoard(project.id))),
            Promise.all(loadedProjects.map((project) => fetchProjectMembers(project.id))),
        ]);

        const boardMap = {};
        const memberMap = {};

        loadedProjects.forEach((project, index) => {
            boardMap[project.id] = boards[index];
            memberMap[project.id] = members[index];
        });

        boardsByProjectId.value = boardMap;
        membersByProjectId.value = memberMap;
    } catch (error) {
        console.error('Dashboard load error:', error);
        loadError.value = error?.data?.message || error?.message || 'Failed to load dashboard.';
        projects.value = [];
        boardsByProjectId.value = {};
        membersByProjectId.value = {};
    } finally {
        isLoading.value = false;
    }
};

await loadDashboard();
</script>
