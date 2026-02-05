export const useProjectStore = defineStore('project', () => {
    const project = reactive({
        title: '',
        description: '',
        code: '',
    });
    const projects = ref([]);
    const getProjects = async () => {
        const res = await useApi('/projects');
        projects.value = res.data.value;
    };
    const getProject = async (route) => {
        const res = await useApi(`/projects/${route.params.id}`);
        Object.assign(project, res.data.value);
    };
    const createProject = async (newProject) => {
        const { $api } = useNuxtApp();
        await $api('/projects', {
            method: 'POST',
            body: newProject,
        });
        Object.assign(newProject, {
            title: '',
            code: '',
            description: '',
        });
        return navigateTo('/projects');
    };
    const deleteProject = async (project) => {
        const { $api } = useNuxtApp();
        await $api(`/projects/${project.id}`, {
            method: 'DELETE',
        });
        projects.value = projects.value.filter((item) => item !== project);
    };
    const updateProject = async (updatedData) => {
        const { $api } = useNuxtApp();
        await $api(`/projects/${updatedData.id}`, {
            method: 'PUT',
            body: updatedData,
        });
        projects.value = projects.value.map((item) => {
            if (item.id === updatedData.id) {
                return { ...item, ...updatedData };
            }
            return item;
        });
    };
    return { project, projects, getProject, getProjects, createProject, deleteProject, updateProject };
});
