<template>
    <div class="h-full flex flex-col gap-6">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Project Wiki</h2>
                <p class="text-sm text-slate-500 mt-1">Document knowledge and keep project notes in one place.</p>
            </div>
            <Button
                label="New Page"
                icon="carbon:add"
                size="small"
                class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                @click="startNewPage"
            />
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon name="carbon:information" size="20" class="text-indigo-600" />
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-slate-900">{{ project.title || 'Project' }}</h3>
                    <p class="text-sm text-slate-600 italic font-semibold">
                        {{ project.description || 'No project description yet.' }}
                    </p>
                </div>
            </div>
        </div>

        <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0">
                <div class="p-4 border-b border-slate-100">
                    <div class="relative">
                        <Icon name="carbon:search" size="16" class="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search pages..."
                            class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                </div>

                <div v-if="wikiStore && wikiStore.isLoading && !wikiStore.pages.length" class="p-6 text-center text-slate-500">
                    <Icon name="carbon:renew" size="28" class="inline-block animate-spin" />
                    <p class="mt-3 text-sm">Loading wiki pages...</p>
                </div>

                <div v-else-if="wikiStore && wikiStore.error" class="p-6 text-center text-red-600">
                    <Icon name="carbon:warning" size="24" class="inline-block" />
                    <p class="mt-3 text-sm">{{ wikiStore.error }}</p>
                    <Button label="Retry" icon="carbon:renew" size="small" outlined class="mt-4" @click="refreshPages" />
                </div>

                <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-100">
                    <button
                        v-for="page in filteredPages"
                        :key="page.id"
                        class="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                        :class="page.id === form.id ? 'bg-indigo-50' : ''"
                        @click="selectPage(page)"
                    >
                        <div class="flex items-center gap-2">
                            <Icon name="carbon:document" size="16" class="text-slate-400" />
                            <span class="font-medium text-slate-800 truncate">{{ page.title }}</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-1 truncate">
                            {{ formatDate(page.updatedAt || page.createdAt) }}
                        </p>
                    </button>

                    <div v-if="!filteredPages.length" class="p-6 text-center text-slate-500">
                        <Icon name="carbon:notebook" size="32" class="inline-block text-slate-300" />
                        <p class="mt-3 text-sm">No wiki pages yet.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0 lg:col-span-2">
                <div class="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <Icon name="carbon:edit" size="18" class="text-slate-400" />
                        <span class="text-sm font-semibold text-slate-700">
                            {{ form.id ? 'Edit Page' : 'Create Page' }}
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Button
                            v-if="form.id"
                            label="Delete"
                            icon="carbon:trash-can"
                            size="small"
                            outlined
                            class="text-red-600 border-red-200 hover:bg-red-50"
                            @click="deletePage"
                        />
                        <Button
                            v-if="form.id"
                            label="Update"
                            icon="carbon:save"
                            size="small"
                            outlined
                            class="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            :disabled="isSaving || !form.title.trim()"
                            @click="updatePage"
                        />
                        <Button
                            label="Save New"
                            icon="carbon:add"
                            size="small"
                            class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                            :disabled="isSaving || !form.title.trim()"
                            @click="savePage"
                        />
                    </div>
                </div>

                <div class="p-5 flex-1 overflow-y-auto space-y-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                            Title
                        </label>
                        <input
                            v-model="form.title"
                            type="text"
                            placeholder="Page title"
                            class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div class="flex-1 flex flex-col min-h-0">
                        <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                            Content
                        </label>
                        <textarea
                            v-model="form.content"
                            rows="12"
                            placeholder="Write your notes here..."
                            class="w-full flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none min-h-[240px]"
                        ></textarea>
                    </div>

                    <div v-if="formError" class="text-sm text-red-600">{{ formError }}</div>

                    <div v-if="form.id" class="text-xs text-slate-500">
                        Last updated: {{ formatDate(selectedMeta.updatedAt || selectedMeta.createdAt) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'projectheader',
});

const route = useRoute();
const wikiStore = typeof useWikiStore === 'function' ? useWikiStore() : null;
const projectStore = useProjectStore();
const project = computed(() => projectStore.project);

const searchQuery = ref('');
const formError = ref('');
const isSaving = ref(false);
const selectedMeta = reactive({
    createdAt: null,
    updatedAt: null,
});

const form = reactive({
    id: null,
    title: '',
    content: '',
});

const projectId = computed(() => Number(route.params.id));

const filteredPages = computed(() => {
    if (!wikiStore) {
        return [];
    }
    if (!searchQuery.value.trim()) {
        return wikiStore.pages;
    }
    const query = searchQuery.value.toLowerCase();
    return wikiStore.pages.filter((page) => page.title?.toLowerCase().includes(query));
});

if (import.meta.client) {
    await projectStore.getProject(route);
    if (wikiStore) {
        await wikiStore.getProjectPages(projectId.value);
    }
}

const startNewPage = () => {
    formError.value = '';
    Object.assign(form, { id: null, title: '', content: '' });
    Object.assign(selectedMeta, { createdAt: null, updatedAt: null });
};

const selectPage = (page) => {
    if (!page) {
        return;
    }
    formError.value = '';
    Object.assign(form, {
        id: page.id,
        title: page.title || '',
        content: page.content || '',
    });
    Object.assign(selectedMeta, {
        createdAt: page.createdAt || null,
        updatedAt: page.updatedAt || null,
    });
};

const pickNewestPage = (pages) => {
    if (!pages?.length) {
        return null;
    }
    return [...pages].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (aTime !== bTime) {
            return bTime - aTime;
        }
        return (b.id || 0) - (a.id || 0);
    })[0];
};

const savePage = async () => {
    formError.value = '';
    const title = form.title.trim();
    if (!title) {
        formError.value = 'Title is required.';
        return;
    }

    isSaving.value = true;
    const payload = {
        title,
        content: form.content || '',
    };

    try {
        await wikiStore.createPage(projectId.value, payload);
        await wikiStore.getProjectPages(projectId.value);
        const nextSelection = pickNewestPage(wikiStore.pages);
        if (nextSelection) {
            selectPage(nextSelection);
            return;
        }
        startNewPage();
    } catch (err) {
        formError.value = 'Failed to save page.';
    } finally {
        isSaving.value = false;
    }
};

const updatePage = async () => {
    formError.value = '';
    const title = form.title.trim();
    if (!form.id) {
        formError.value = 'Select a page to update.';
        return;
    }
    if (!title) {
        formError.value = 'Title is required.';
        return;
    }
    isSaving.value = true;
    const payload = {
        title,
        content: form.content || '',
    };
    const existingId = form.id;
    try {
        await wikiStore.updatePage(existingId, payload);
        await wikiStore.getProjectPages(projectId.value);
        const nextSelection = wikiStore.pages.find((page) => page.id === existingId);
        if (nextSelection) {
            selectPage(nextSelection);
            return;
        }
        const fallback = pickNewestPage(wikiStore.pages);
        if (fallback) {
            selectPage(fallback);
            return;
        }
        startNewPage();
    } catch (err) {
        formError.value = 'Failed to update page.';
    } finally {
        isSaving.value = false;
    }
};

const deletePage = async () => {
    if (!form.id) {
        return;
    }
    if (!confirm('Delete this wiki page?')) {
        return;
    }
    try {
        await wikiStore.deletePage(form.id);
        await wikiStore.getProjectPages(projectId.value);
        if (wikiStore.pages.length) {
            selectPage(wikiStore.pages[0]);
        } else {
            startNewPage();
        }
    } catch (err) {
        formError.value = 'Failed to delete page.';
    }
};

const refreshPages = async () => {
    await wikiStore.getProjectPages(projectId.value);
};

const formatDate = (value) => {
    if (!value) {
        return 'Unknown date';
    }
    try {
        return new Date(value).toLocaleString();
    } catch (err) {
        return 'Unknown date';
    }
};
</script>
