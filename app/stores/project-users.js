export const useProjectUsersStore = defineStore('project-users', () => {
    const projectUsers = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const currentProjectId = ref(null);

    const fetchProjectUsers = async (projectId) => {
        if (currentProjectId.value === projectId && projectUsers.value.length > 0) {
            return projectUsers.value;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const { $api } = useNuxtApp();
            const response = await $api(`/projects/${projectId}/users`);

            console.log('Fetched project users from API:', response);

            projectUsers.value = response.map((member) => {
                const userId = member.user?.userId || member.userId || member.user?.id || member.id;
                const userName = member.user?.name || member.name || `User ${userId}`;
                const userEmail = member.user?.email || member.email;
                const userAvatar = member.user?.avatar || member.avatar;

                return {
                    userId,
                    name: userName,
                    email: userEmail,
                    avatar: userAvatar,
                    role: member.role || 'member',
                    _original: member,
                };
            });

            currentProjectId.value = projectId;

            return projectUsers.value;
        } catch (err) {
            error.value = 'Failed to fetch project users';
            console.error('Project users fetch error:', err);
            projectUsers.value = [];
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const getUsersForDropdown = (includeNoAssignee = true) => {
        const users = projectUsers.value.map((user) => ({
            label: user.name,
            value: user.userId,
        }));

        if (includeNoAssignee) {
            return [{ label: 'No Assignee', value: null }, ...users];
        }

        return users;
    };

    const getUserById = (userId) => {
        return projectUsers.value.find((user) => user.userId === userId);
    };

    const getUserInitials = (userId) => {
        const user = getUserById(userId);
        if (!user || !user.name) return '?';

        return user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const clearUsers = () => {
        projectUsers.value = [];
        currentProjectId.value = null;
        error.value = null;
    };

    const refreshUsers = async () => {
        if (!currentProjectId.value) {
            console.warn('No project ID set, cannot refresh users');
            return;
        }

        projectUsers.value = [];
        return await fetchProjectUsers(currentProjectId.value);
    };

    return {
        projectUsers,
        isLoading,
        error,
        currentProjectId,
        fetchProjectUsers,
        getUsersForDropdown,
        getUserById,
        getUserInitials,
        clearUsers,
        refreshUsers,
    };
});
