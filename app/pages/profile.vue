<template>
    <div class="max-w-7xl mx-auto py-8">
        <div>
            <section class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
                <div v-if="activeTab === 'profile'" class="space-y-6">
                    <div class="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h1 class="text-2xl font-bold text-slate-900">Profile</h1>
                            <p class="text-sm text-slate-500 mt-1">Manage your account information</p>
                        </div>
                        <div class="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <button
                                type="button"
                                :class="tabToggleButtonClass('profile')"
                                @click="activeTab = 'profile'"
                            >
                                <Icon name="carbon:user" size="16" />
                                Profile
                            </button>
                            <button
                                type="button"
                                :class="tabToggleButtonClass('activity')"
                                @click="activeTab = 'activity'"
                            >
                                <Icon name="carbon:activity" size="16" />
                                Activity
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
                        <img
                            :src="userAvatar"
                            alt="Profile avatar"
                            class="w-20 h-20 rounded-full border border-slate-200 bg-slate-50"
                        />
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

                <div v-else-if="activeTab === 'activity'" class="space-y-4">
	                    <div class="flex items-center justify-between gap-4 flex-wrap">
	                        <div>
	                            <h1 class="text-2xl font-bold text-slate-900">{{ accountName }} activities</h1>
	                            <p class="text-sm text-slate-500 mt-1">Recent actions in projects and issues</p>
	                        </div>
                        <div class="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <button
                                type="button"
                                :class="tabToggleButtonClass('profile')"
                                @click="activeTab = 'profile'"
                            >
                                <Icon name="carbon:user" size="16" />
                                Profile
                            </button>
                            <button
                                type="button"
                                :class="tabToggleButtonClass('activity')"
                                @click="activeTab = 'activity'"
                            >
                                <Icon name="carbon:activity" size="16" />
                                Activity
                            </button>
                        </div>
                    </div>

                    <div v-if="activitiesLoading" class="state">
                        <Icon name="carbon:renew" size="18" class="spinning" />
                        <span>Loading activity...</span>
                    </div>

                    <div v-else-if="activitiesError" class="state error">
                        <Icon name="carbon:warning" size="16" />
                        <span>{{ activitiesError }}</span>
                    </div>

                    <div v-else-if="activityRows.length === 0" class="state empty">
                        No activity yet.
                    </div>

                    <div v-else class="history-table-wrap">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Issue</th>
                                    <th>Type</th>
                                    <th>Created date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(entry, index) in activityRows" :key="activityKey(entry, index)">
                                    <td>{{ entry.project || '-' }}</td>
                                    <td>{{ entry.issue || '-' }}</td>
                                    <td>{{ entry.message }}</td>
                                    <td>{{ entry.createdAt ? formatTime(entry.createdAt) : '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-else class="state empty">
                    {{ currentTabLabel }} section is coming soon.
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import formatTime from '~/utils/formatTime';

const authStore = useAuthStore();
const { $api } = useNuxtApp();

const activeTab = ref('profile');
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const activitiesLoading = ref(false);
const activitiesError = ref('');
const activityRows = ref([]);
const activitiesLoaded = ref(false);

const form = reactive({
    fullName: '',
    email: '',
});

const tabs = [{ key: 'profile', label: 'Profile', icon: 'carbon:user' }];

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

const accountName = computed(() => form.fullName || form.email || 'User');
const currentTabLabel = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label || 'This');
const tabToggleButtonClass = (tabKey) => [
    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    activeTab.value === tabKey ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
];

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

const toActivityArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.activities)) return response.activities;
    if (Array.isArray(response?.history)) return response.history;
    return [];
};

const toProjectArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.projects)) return response.projects;
    return [];
};

const toTaskArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.tasks)) return response.tasks;
    if (Array.isArray(response?.data?.tasks)) return response.data.tasks;
    return [];
};

const resolveText = (...values) => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return '';
};

const normalizeId = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
};

const normalizeEmail = (value) => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim().toLowerCase();
};

const normalizeName = (value) => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim().toLowerCase();
};

const resolveProjectName = (entry) =>
    resolveText(entry?.project?.title, entry?.project?.name, entry?.projectTitle, entry?.projectName, entry?.project);

const resolveIssueName = (entry) =>
    resolveText(
        entry?.issue?.title,
        entry?.issue?.name,
        entry?.task?.title,
        entry?.task?.name,
        entry?.taskTitle,
        entry?.issueTitle,
        entry?.ticketTitle,
    );

const resolveActivityDate = (entry) => {
    return entry?.createdAt || entry?.timestamp || entry?.date || entry?.updatedAt || '';
};

const resolveActorName = (entry) => {
    return resolveText(
        entry?.user?.email,
        entry?.user?.name,
        entry?.actor?.email,
        entry?.actor?.name,
        entry?.author?.email,
        entry?.author?.name,
        form.email,
        'User',
    );
};

const isCurrentUserActivity = (entry) => {
    const currentId = normalizeId(authStore.currentUser?.userId);
    const currentEmail = normalizeEmail(authStore.currentUser?.email || form.email);
    const currentName = normalizeName(authStore.currentUser?.fullName || form.fullName);

    const candidateIds = [
        entry?.actorId,
        entry?.userId,
        entry?.authorId,
        entry?.changedById,
        entry?.user?.id,
        entry?.user?.userId,
        entry?.actor?.id,
        entry?.actor?.userId,
        entry?.author?.id,
        entry?.author?.userId,
        entry?.changedBy?.id,
        entry?.changedBy?.userId,
    ]
        .map(normalizeId)
        .filter(Boolean);

    if (currentId && candidateIds.some((id) => id === currentId)) {
        return true;
    }

    const candidateEmails = [
        entry?.user?.email,
        entry?.actor?.email,
        entry?.author?.email,
        entry?.changedBy?.email,
        entry?.email,
    ]
        .map(normalizeEmail)
        .filter(Boolean);

    if (currentEmail && candidateEmails.some((email) => email === currentEmail)) {
        return true;
    }

    const candidateNames = [
        entry?.user?.name,
        entry?.actor?.name,
        entry?.author?.name,
        entry?.changedBy?.name,
        entry?.fullName,
        entry?.username,
    ]
        .map(normalizeName)
        .filter(Boolean);

    if (currentName && candidateNames.some((name) => name === currentName)) {
        return true;
    }

    return false;
};

const toActivityMessage = (entry) => {
    const actor = resolveActorName(entry);
    const issue = resolveIssueName(entry) || 'issue';

    const action = resolveText(entry?.action, entry?.event, entry?.type, entry?.field, entry?.status);
    const normalizedAction = action.toLowerCase();

    if (!action && (entry?.message || entry?.description)) {
        return resolveText(entry.message, entry.description);
    }

    if (normalizedAction.includes('start')) {
        return `${actor} started work on the issue ${issue}.`;
    }

    if (normalizedAction.includes('stop')) {
        return `${actor} stopped work on the issue ${issue}.`;
    }

    if (normalizedAction.includes('create') || normalizedAction.includes('add')) {
        return `${actor} created a new issue ${issue}.`;
    }

    if (normalizedAction.includes('delete') || normalizedAction.includes('remove')) {
        return `${actor} deleted the issue ${issue}.`;
    }

    if (normalizedAction.includes('update') || normalizedAction.includes('edit')) {
        return `${actor} updated the issue ${issue}.`;
    }

    if (entry?.field) {
        return `${actor} updated the issue ${issue}.`;
    }

    if (action) {
        return `${actor} ${action} ${issue}.`;
    }

    return `${actor} updated an issue.`;
};

const normalizeActivityEntry = (entry) => {
    const issue = resolveIssueName(entry);

    return {
        id: entry?.id || entry?._id || entry?.historyId || null,
        project: resolveProjectName(entry),
        issue,
        message: toActivityMessage(entry),
        createdAt: resolveActivityDate(entry),
    };
};

const fetchUserActivityFromProjects = async () => {
    const projectsEndpoints = ['/projects', '/users/me/projects', '/me/projects'];
    let projects = [];
    let projectsError = null;

    for (const endpoint of projectsEndpoints) {
        try {
            const response = await $api(endpoint);
            const parsed = toProjectArray(response);
            if (parsed.length > 0) {
                projects = parsed;
                break;
            }
        } catch (error) {
            const statusCode = error?.statusCode || error?.status || error?.response?.status;
            if (statusCode !== 404) {
                projectsError = error;
            }
        }
    }

    if (projects.length === 0) {
        if (projectsError) {
            throw projectsError;
        }
        return [];
    }

    const limitedProjects = projects.slice(0, 10);
    const taskResponseList = await Promise.allSettled(
        limitedProjects.map(async (project) => {
            const projectId = project?.id || project?.projectId;
            if (!projectId) {
                return [];
            }

            const taskEndpoints = [`/projects/${projectId}/tasks`, `/projects/${projectId}/backlog`];

            for (const endpoint of taskEndpoints) {
                try {
                    const response = await $api(endpoint);
                    const tasks = toTaskArray(response);
                    if (tasks.length > 0) {
                        return tasks.map((task) => ({
                            ...task,
                            projectTitle: resolveText(project?.title, project?.name, project?.projectTitle, project?.projectName),
                        }));
                    }
                } catch {
                    // try next endpoint
                }
            }

            return [];
        }),
    );

    const allTasks = taskResponseList
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value);

    if (allTasks.length === 0) {
        return [];
    }

    const sortedTasks = [...allTasks].sort((a, b) => {
        const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
        const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
        return bTime - aTime;
    });

    const tasksForHistory = sortedTasks.slice(0, 60);

    const historyList = await Promise.allSettled(
        tasksForHistory.map(async (task) => {
            const taskId = task?.id || task?.taskId;
            if (!taskId) {
                return [];
            }

            try {
                const response = await $api(`/tasks/${taskId}/history`);
                const history = toActivityArray(response);

                return history.map((entry) => ({
                    ...entry,
                    task,
                    taskTitle: resolveText(task?.title, task?.name, task?.taskTitle),
                    projectTitle: resolveText(task?.projectTitle, task?.project?.title, task?.project?.name),
                }));
            } catch {
                return [];
            }
        }),
    );

    const mergedHistory = historyList
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value);

    return mergedHistory.filter(isCurrentUserActivity);
};

const fetchUserActivities = async () => {
    if (!authStore.isAuthenticated) {
        activityRows.value = [];
        return;
    }

    activitiesLoading.value = true;
    activitiesError.value = '';

    const userId = authStore.currentUser?.userId;
    const candidateEndpoints = [
        '/users/me/activities',
        '/users/me/activity',
        '/profile/activities',
        '/profile/activity',
        '/activities/me',
        '/activity/me',
    ];

    if (userId) {
        candidateEndpoints.push(`/users/${userId}/activities`);
        candidateEndpoints.push(`/users/${userId}/activity`);
    }

    let responseRows = [];
    let lastError = null;

    for (const endpoint of candidateEndpoints) {
        try {
            const response = await $api(endpoint);
            const parsed = toActivityArray(response);
            if (parsed.length > 0) {
                responseRows = parsed;
                break;
            }
        } catch (error) {
            lastError = error;
        }
    }

    try {
        if (responseRows.length === 0) {
            responseRows = await fetchUserActivityFromProjects();
        }

        const normalized = responseRows.map(normalizeActivityEntry);

        normalized.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });

        activityRows.value = normalized.slice(0, 100);
        activitiesLoaded.value = true;
    } catch (error) {
        activityRows.value = [];
        activitiesError.value =
            error?.data?.message ||
            error?.message ||
            lastError?.data?.message ||
            lastError?.message ||
            'Failed to load activity';
    } finally {
        activitiesLoading.value = false;
    }
};

const activityKey = (entry, index) => {
    return entry?.id || `${entry?.createdAt || 'date'}-${index}`;
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

watch(
    activeTab,
    async (tab) => {
        if (tab !== 'activity' || activitiesLoaded.value || activitiesLoading.value) {
            return;
        }
        await fetchUserActivities();
    },
    { immediate: true },
);
</script>

<style scoped>
.state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    border: 1px dashed var(--surface-300);
    border-radius: 8px;
    color: var(--surface-500);
    font-size: 14px;
}

.state.error {
    border-color: #fecaca;
    color: #dc2626;
    background: #fef2f2;
}

.history-table-wrap {
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    overflow: hidden;
    background: white;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
}

.history-table th,
.history-table td {
    text-align: left;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--surface-700);
    vertical-align: top;
}

.history-table th {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-200);
    color: var(--surface-600);
}

.history-table tbody tr + tr td {
    border-top: 1px solid var(--surface-100);
}

.history-table td:nth-child(1),
.history-table td:nth-child(2),
.history-table td:nth-child(4) {
    white-space: nowrap;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 1024px) {
    .history-table td:nth-child(1),
    .history-table td:nth-child(2),
    .history-table td:nth-child(4) {
        white-space: normal;
    }
}
</style>
