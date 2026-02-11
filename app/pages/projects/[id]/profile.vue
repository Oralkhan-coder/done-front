<template>
    <div class="profile-page">
        <div v-if="loadError" class="info-alert error">
            <Icon name="carbon:warning-alt" size="18" />
            <span>{{ loadError }}</span>
        </div>

        <div v-if="isBootLoading" class="state-box">
            <Icon name="carbon:renew" size="24" class="animate-spin" />
            <span>Loading project profile...</span>
        </div>

        <div v-else class="profile-grid">
            <aside class="menu-card">
                <button
                    v-for="section in sections"
                    :key="section.id"
                    type="button"
                    class="section-btn"
                    :class="{ 'is-active': activeSection === section.id }"
                    @click="setActiveSection(section.id)"
                >
                    <Icon :name="section.icon" size="18" />
                    <span>{{ section.label }}</span>
                </button>
            </aside>

            <section class="content-card">
                <div class="content-header">
                    <h2>{{ currentSectionLabel }}</h2>
                    <Button
                        label="Refresh"
                        icon="carbon:renew"
                        size="small"
                        outlined
                        :loading="isRefreshing"
                        @click="refreshActiveSection"
                    />
                </div>

                <div v-if="activeSection === 'project-info'" class="section-content">
                    <div class="info-grid">
                        <div class="info-row">
                            <p class="row-label">Name:</p>
                            <p class="row-value">{{ project.title }}</p>
                        </div>
                        <div class="info-row">
                            <p class="row-label">Code:</p>
                            <p class="row-value">{{ project.code }}</p>
                        </div>
                        <div class="info-row">
                            <p class="row-label">Description:</p>
                            <p class="row-value">{{ project.description }}</p>
                        </div>
                        <div class="info-row">
                            <p class="row-label">Type:</p>
                            <p class="row-value">{{ projectType }}</p>
                        </div>
                        <div class="info-row">
                            <p class="row-label">Owner:</p>
                            <p class="row-value">{{ ownerName }}</p>
                        </div>
                        <div class="info-row">
                            <p class="row-label">Created Date:</p>
                            <p class="row-value">{{ createdDate }}</p>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button type="button" class="action-link danger" @click="deleteProject">
                            <Icon name="carbon:trash-can" size="16" />
                            <span>Delete</span>
                        </button>
                        <span class="divider">|</span>
                        <button type="button" class="action-link" @click="openEditModal">
                            <Icon name="carbon:edit" size="16" />
                            <span>Edit</span>
                        </button>
                    </div>
                </div>

                <div v-else-if="activeSection === 'members'" class="section-content">
                    <div class="section-row between">
                        <h3>Project Members</h3>
                        <Button
                            label="Invite Member"
                            icon="carbon:user-follow"
                            size="small"
                            outlined
                            @click="isInviteModalOpen = true"
                        />
                    </div>

                    <div
                        v-if="projectUsersStore.isLoading && !projectUsersStore.projectUsers.length"
                        class="state-box compact"
                    >
                        <Icon name="carbon:renew" size="20" class="animate-spin" />
                        <span>Loading members...</span>
                    </div>

                    <div v-else-if="!projectUsersStore.projectUsers.length" class="empty-box">
                        <Icon name="carbon:user-multiple" size="26" />
                        <h3>No members found</h3>
                        <p>Invite teammates to collaborate in this project.</p>
                    </div>

                    <div v-else class="members-list">
                        <div v-for="member in projectUsersStore.projectUsers" :key="member.userId" class="member-item">
                            <div class="member-avatar">{{ getInitials(member.name) }}</div>
                            <div class="member-main">
                                <p class="member-name">{{ member.name }}</p>
                                <p class="member-email">{{ member.email }}</p>
                            </div>
                            <span class="role-chip" :class="getRoleClass(member.role)">{{
                                formatRole(member.role)
                            }}</span>
                        </div>
                    </div>
                </div>

                <div v-else-if="activeSection === 'statuses'" class="section-content">
                    <h3>Workflow Statuses</h3>

                    <div v-if="statusStore.isLoading && !statusStore.statuses.length" class="state-box compact">
                        <Icon name="carbon:renew" size="20" class="animate-spin" />
                        <span>Loading statuses...</span>
                    </div>

                    <div v-else-if="!statusStore.statuses.length" class="empty-box">
                        <Icon name="carbon:list" size="26" />
                        <h3>No statuses configured</h3>
                        <p>Add statuses in project workflow to organize board columns.</p>
                    </div>

                    <div v-else class="status-list">
                        <div v-for="(status, index) in statusStore.statuses" :key="status.id" class="status-item">
                            <span class="status-index">{{ index + 1 }}</span>
                            <span class="status-title">{{ status.title }}</span>
                        </div>
                    </div>
                </div>

                <div v-else-if="activeSection === 'monitoring'" class="section-content">
                    <div v-if="monitoringLoading" class="state-box compact">
                        <Icon name="carbon:renew" size="20" class="animate-spin" />
                        <span>Loading monitoring metrics...</span>
                    </div>

                    <div v-else>
                        <div class="metric-grid">
                            <div v-for="card in monitoringCards" :key="card.label" class="metric-card">
                                <div class="metric-icon">
                                    <Icon :name="card.icon" size="20" />
                                </div>
                                <p class="metric-value">{{ card.value }}</p>
                                <p class="metric-label">{{ card.label }}</p>
                            </div>
                        </div>

                        <div class="sprint-summary">
                            <h3>Sprint Overview</h3>
                            <div class="summary-row">
                                <span>Planned</span>
                                <strong>{{ sprintSummary.planned }}</strong>
                            </div>
                            <div class="summary-row">
                                <span>Active</span>
                                <strong>{{ sprintSummary.active }}</strong>
                            </div>
                            <div class="summary-row">
                                <span>Completed</span>
                                <strong>{{ sprintSummary.closed }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <Dialog
            v-model:visible="isEditModalOpen"
            modal
            header="Edit Project"
            :style="{ width: '560px', maxWidth: '95vw' }"
            :draggable="false"
        >
            <form class="edit-form" @submit.prevent="saveProject">
                <div class="form-group">
                    <label for="project-title" class="form-label">Project Title</label>
                    <InputText id="project-title" v-model="editForm.title" class="w-full" placeholder="Project title" />
                </div>

                <div class="form-group">
                    <label for="project-code" class="form-label">Project Code</label>
                    <InputText id="project-code" v-model="editForm.code" class="w-full" placeholder="PROJ" />
                </div>

                <div class="form-group">
                    <label for="project-description" class="form-label">Description</label>
                    <Textarea
                        id="project-description"
                        v-model="editForm.description"
                        rows="5"
                        class="w-full"
                        placeholder="Project description"
                    />
                </div>

                <div v-if="editError" class="form-error">{{ editError }}</div>

                <div class="modal-actions">
                    <Button label="Cancel" severity="secondary" outlined type="button" @click="closeEditModal" />
                    <Button
                        label="Save Changes"
                        icon="carbon:save"
                        type="submit"
                        :loading="isSavingProject"
                        class="bg-indigo-600 border-indigo-600"
                    />
                </div>
            </form>
        </Dialog>

        <ProjectInviteUserModal
            v-model="isInviteModalOpen"
            :project-id="String(projectId)"
            @success="handleInviteSuccess"
        />
    </div>
</template>

<script setup>
import formatTime from '~/utils/formatTime';

definePageMeta({
    layout: 'projectheader',
});

const route = useRoute();
const projectStore = useProjectStore();
const projectUsersStore = useProjectUsersStore();
const statusStore = useStatusStore();
const boardStore = useBoardStore();
const sprintStore = useSprintStore();

const sections = [
    { id: 'project-info', label: 'Project Info', icon: 'carbon:information' },
    { id: 'members', label: 'Members', icon: 'carbon:user-multiple' },
    { id: 'statuses', label: 'Statuses', icon: 'carbon:list' },
    { id: 'monitoring', label: 'Monitoring', icon: 'carbon:chart-line' },
];

const activeSection = ref('project-info');
const isBootLoading = ref(true);
const isRefreshing = ref(false);
const isMonitoringLoaded = ref(false);
const isInviteModalOpen = ref(false);
const loadError = ref('');

const isEditModalOpen = ref(false);
const isSavingProject = ref(false);
const editError = ref('');

const editForm = reactive({
    title: '',
    code: '',
    description: '',
});

const projectId = computed(() => Number(route.params.id || 0));
const project = computed(() => projectStore.project);
const currentSectionLabel = computed(
    () => sections.find((item) => item.id === activeSection.value)?.label || 'Section',
);
const projectType = computed(() => {
    const typeValue = project.value.type;
    if (typeof typeValue === 'string' && typeValue.trim()) {
        return typeValue;
    }
    return 'Not specified';
});
const ownerName = computed(() => {
    const owner = projectUsersStore.projectUsers.find((member) => String(member.role).toLowerCase() === 'owner');
    if (owner?.name) {
        return owner.name;
    }
    return 'Not specified';
});
const createdDate = computed(() => formatDate(project.value.createdAt));
const monitoringLoading = computed(() => boardStore.isLoading || sprintStore.isLoading);

const totalTasks = computed(() => {
    return boardStore.board.reduce((sum, column) => sum + (column.tasks?.length || 0), 0);
});

const sprintSummary = computed(() => {
    return sprintStore.sprints.reduce(
        (acc, sprint) => {
            const normalizedStatus = String(sprint.status || '').toLowerCase();
            if (normalizedStatus === 'active') {
                acc.active += 1;
            } else if (normalizedStatus === 'closed') {
                acc.closed += 1;
            } else {
                acc.planned += 1;
            }
            return acc;
        },
        { planned: 0, active: 0, closed: 0 },
    );
});

const monitoringCards = computed(() => {
    return [
        { label: 'Members', value: projectUsersStore.projectUsers.length, icon: 'carbon:user-multiple' },
        { label: 'Statuses', value: statusStore.statuses.length, icon: 'carbon:list' },
        { label: 'Board Columns', value: boardStore.board.length, icon: 'carbon:grid' },
        { label: 'Total Tasks', value: totalTasks.value, icon: 'carbon:task' },
    ];
});

const resolveErrorMessage = (error, fallback) => {
    return error?.data?.error || error?.response?._data?.error || error?.statusMessage || error?.message || fallback;
};

const formatDate = (value) => {
    return formatTime(value) || '';
};

const getInitials = (value = '') => {
    const words = String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2);

    if (!words.length) {
        return '';
    }

    return words.map((word) => word.charAt(0).toUpperCase()).join('');
};

const formatRole = (role) => {
    const normalized = String(role || '').toLowerCase();
    if (normalized === 'owner') return 'Owner';
    if (normalized === 'admin') return 'Admin';
    return 'Member';
};

const getRoleClass = (role) => {
    const normalized = String(role || '').toLowerCase();
    if (normalized === 'owner') return 'owner';
    if (normalized === 'admin') return 'admin';
    return 'member';
};

const loadBaseData = async (force = false) => {
    if (!projectId.value) {
        throw new Error('Invalid project ID');
    }

    if (force) {
        projectUsersStore.clearUsers();
        statusStore.clearStatuses();
    }

    await Promise.all([
        projectStore.getProject(route),
        projectUsersStore.fetchProjectUsers(projectId.value),
        statusStore.fetchStatuses(projectId.value),
    ]);
};

const loadMonitoringData = async () => {
    await Promise.all([
        boardStore.getBoard(projectId.value),
        sprintStore.fetchProjectSprints(projectId.value, { force: true }),
    ]);
    isMonitoringLoaded.value = true;
};

const ensureSectionData = async (sectionId, force = false) => {
    if (sectionId === 'monitoring' && (force || !isMonitoringLoaded.value)) {
        await loadMonitoringData();
    }
};

const loadInitialData = async () => {
    isBootLoading.value = true;
    loadError.value = '';

    try {
        await loadBaseData(true);
        await ensureSectionData(activeSection.value, true);
    } catch (error) {
        loadError.value = resolveErrorMessage(error, 'Failed to load project profile.');
    } finally {
        isBootLoading.value = false;
    }
};

const refreshActiveSection = async () => {
    isRefreshing.value = true;
    loadError.value = '';

    try {
        await loadBaseData(true);
        await ensureSectionData(activeSection.value, true);
    } catch (error) {
        loadError.value = resolveErrorMessage(error, 'Failed to refresh data.');
    } finally {
        isRefreshing.value = false;
    }
};

const setActiveSection = async (sectionId) => {
    activeSection.value = sectionId;

    try {
        await ensureSectionData(sectionId);
    } catch (error) {
        loadError.value = resolveErrorMessage(error, 'Failed to load section data.');
    }
};

const openEditModal = () => {
    editError.value = '';
    Object.assign(editForm, {
        title: project.value.title || '',
        code: project.value.code || '',
        description: project.value.description || '',
    });
    isEditModalOpen.value = true;
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
    editError.value = '';
};

const saveProject = async () => {
    const title = editForm.title.trim();
    const code = editForm.code.trim();
    const description = editForm.description.trim();

    if (!title || !code || !description) {
        editError.value = 'All fields are required.';
        return;
    }

    isSavingProject.value = true;
    editError.value = '';

    try {
        await projectStore.updateProject({
            id: project.value.id,
            title,
            code,
            description,
        });
        await projectStore.getProject(route);
        closeEditModal();
    } catch (error) {
        editError.value = resolveErrorMessage(error, 'Failed to update project.');
    } finally {
        isSavingProject.value = false;
    }
};

const deleteProject = async () => {
    if (!project.value.id) {
        return;
    }

    const label = project.value.title || `#${project.value.id}`;
    if (!confirm(`Delete project "${label}"?`)) {
        return;
    }

    try {
        await projectStore.deleteProject(project.value);
        await navigateTo('/projects');
    } catch (error) {
        loadError.value = resolveErrorMessage(error, 'Failed to delete project.');
    }
};

const handleInviteSuccess = async () => {
    try {
        await projectUsersStore.refreshUsers();
    } catch (error) {
        loadError.value = resolveErrorMessage(error, 'Member was invited, but list refresh failed.');
    }
};

await loadInitialData();

watch(projectId, async (nextId, prevId) => {
    if (!nextId || nextId === prevId) {
        return;
    }

    activeSection.value = 'project-info';
    isMonitoringLoaded.value = false;
    await loadInitialData();
});
</script>

<style scoped>
.profile-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
}

.profile-grid {
    display: grid;
    grid-template-columns: minmax(220px, 270px) 1fr;
    gap: 18px;
    align-items: start;
}

.menu-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: white;
    border: 1px solid var(--surface-200);
    border-radius: 14px;
    padding: 10px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.section-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: var(--surface-700);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
}

.section-btn:hover {
    background: var(--surface-50);
    color: var(--surface-900);
}

.section-btn.is-active {
    color: var(--primary-700);
    background: var(--primary-50);
    border-color: var(--primary-200);
}

.content-card {
    background: white;
    border: 1px solid var(--surface-200);
    border-radius: 14px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
    padding: 22px;
    min-height: 420px;
}

.content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--surface-200);
}

.content-header h2 {
    margin: 0;
    font-size: 30px;
    font-weight: 500;
    color: var(--surface-700);
    letter-spacing: 0.02em;
}

.section-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.section-content h3 {
    margin: 0;
    font-size: 18px;
    color: var(--surface-900);
}

.section-row.between {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.info-grid {
    display: flex;
    flex-direction: column;
}

.info-row {
    display: grid;
    grid-template-columns: minmax(150px, 220px) 1fr;
    gap: 14px;
    border-bottom: 1px solid var(--surface-100);
    padding: 9px 0;
}

.info-row:last-child {
    border-bottom: none;
}

.row-label {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #506687;
}

.row-value {
    margin: 0;
    font-size: 16px;
    color: #2f507d;
    font-weight: 600;
}

.profile-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-top: 8px;
    border-top: 1px solid var(--surface-100);
}

.action-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    color: #2f507d;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s ease;
}

.action-link:hover {
    color: var(--primary-700);
}

.action-link.danger:hover {
    color: #dc2626;
}

.divider {
    color: var(--surface-300);
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.member-item {
    display: grid;
    grid-template-columns: 42px 1fr auto;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    padding: 10px 12px;
}

.member-avatar {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    background: var(--primary-100);
    color: var(--primary-700);
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
}

.member-main {
    min-width: 0;
}

.member-name {
    margin: 0;
    font-weight: 600;
    color: var(--surface-800);
}

.member-email {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--surface-500);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.role-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
}

.role-chip.owner {
    color: #7c2d12;
    background: #ffedd5;
}

.role-chip.admin {
    color: #1d4ed8;
    background: #dbeafe;
}

.role-chip.member {
    color: #155e75;
    background: #cffafe;
}

.status-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--surface-200);
}

.status-index {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: var(--primary-100);
    color: var(--primary-700);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
}

.status-title {
    font-weight: 600;
    color: var(--surface-800);
}

.metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.metric-card {
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    padding: 14px;
}

.metric-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--primary-50);
    color: var(--primary-700);
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.metric-value {
    margin: 10px 0 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--surface-900);
}

.metric-label {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--surface-500);
}

.sprint-summary {
    margin-top: 16px;
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    padding: 14px;
}

.sprint-summary h3 {
    margin: 0 0 10px;
}

.summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed var(--surface-200);
}

.summary-row:last-child {
    border-bottom: none;
}

.state-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 30px;
    border: 1px dashed var(--surface-300);
    border-radius: 10px;
    color: var(--surface-500);
}

.state-box.compact {
    padding: 24px;
}

.empty-box {
    border: 1px dashed var(--surface-300);
    border-radius: 10px;
    padding: 30px;
    text-align: center;
    color: var(--surface-500);
}

.empty-box h3 {
    margin: 10px 0 6px;
    font-size: 18px;
    color: var(--surface-800);
}

.empty-box p {
    margin: 0;
    font-size: 14px;
}

.empty-box :deep(.p-button) {
    margin-top: 14px;
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 8px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--surface-700);
}

.form-error {
    color: #b91c1c;
    font-size: 13px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 8px 10px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
}

.info-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
}

.info-alert.error {
    color: #991b1b;
    border: 1px solid #fecaca;
    background: #fef2f2;
}

@media (max-width: 1320px) {
    .content-header h2 {
        font-size: 28px;
    }

    .row-label {
        font-size: 15px;
    }

    .row-value {
        font-size: 16px;
    }

    .action-link {
        font-size: 16px;
    }
}

@media (max-width: 1024px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }

    .menu-card {
        position: static;
    }

    .metric-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .content-header h2 {
        font-size: 24px;
    }

    .row-label {
        font-size: 14px;
    }

    .row-value {
        font-size: 15px;
    }
}

@media (max-width: 640px) {
    .content-card {
        padding: 16px;
    }

    .content-header {
        flex-direction: column;
        align-items: stretch;
    }

    .info-row {
        grid-template-columns: 1fr;
        gap: 4px;
    }

    .action-link {
        font-size: 14px;
    }

    .member-item {
        grid-template-columns: 42px 1fr;
    }

    .role-chip {
        justify-self: start;
    }

    .metric-grid {
        grid-template-columns: 1fr;
    }
}
</style>
