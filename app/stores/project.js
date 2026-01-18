export const useProjectStore = defineStore('project', () => {
    const project = useState('project', () => {
        return {
            id: 0,
            title: '',
            description: '',
            code: '',
        };
    });
    const projects = useState('projects', () => []);

    const getProjects = async () => {
        const res = await useApi('/projects');
        projects.value = res.data.value;
    };

    const getProject = async (route) => {
        const res = await useApi(`/projects/${route.params.id}`);
        project.value = res.data.value;
    };

    return { project, projects, getProject, getProjects };
});
