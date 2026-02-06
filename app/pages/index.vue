<template>
    <div class="space-y-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p class="text-slate-500 mt-1">Welcome back, Oral Khan. Here's what's happening today.</p>
            </div>
            <div class="flex gap-3">
                <Button
                    label="New Project"
                    icon="carbon:add"
                    size="small"
                    class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700"
                />
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
                class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
                <div class="z-10">
                    <p class="text-slate-500 text-sm font-medium">Total Projects</p>
                    <p class="text-3xl font-bold text-slate-800 mt-2">12</p>
                </div>
                <div
                    class="absolute right-4 top-4 p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors"
                >
                    <Icon name="carbon:layers" size="24" />
                </div>
            </div>
            <div
                class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
                <div class="z-10">
                    <p class="text-slate-500 text-sm font-medium">In Progress</p>
                    <p class="text-3xl font-bold text-slate-800 mt-2">5</p>
                </div>
                <div
                    class="absolute right-4 top-4 p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors"
                >
                    <Icon name="carbon:time" size="24" />
                </div>
            </div>
            <div
                class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
                <div class="z-10">
                    <p class="text-slate-500 text-sm font-medium">Completed</p>
                    <p class="text-3xl font-bold text-slate-800 mt-2">7</p>
                </div>
                <div
                    class="absolute right-4 top-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors"
                >
                    <Icon name="carbon:checkmark-filled" size="24" />
                </div>
            </div>
            <div
                class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
                <div class="z-10">
                    <p class="text-slate-500 text-sm font-medium">Team Members</p>
                    <p class="text-3xl font-bold text-slate-800 mt-2">4</p>
                </div>
                <div
                    class="absolute right-4 top-4 p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors"
                >
                    <Icon name="carbon:user-multiple" size="24" />
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
                <div class="space-y-4">
                    <div
                        v-for="i in 3"
                        :key="i"
                        class="flex items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                    >
                        <div
                            class="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4"
                        >
                            P{{ i }}
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-slate-800">Marketing Campaign {{ i }}</h4>
                            <p class="text-xs text-slate-500 mt-0.5">Updated 2 hours ago</p>
                        </div>
                        <div class="flex -space-x-2 mr-4">
                            <div
                                v-for="j in 3"
                                :key="j"
                                class="w-8 h-8 rounded-full border-2 border-white bg-slate-200"
                                title="User"
                            ></div>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600"
                            >In Progress</span
                        >
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 class="font-bold text-lg text-slate-800 mb-6">Quick Actions</h3>
                <div class="space-y-3">
                    <button
                        class="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                    >
                        <div
                            class="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                        >
                            <Icon name="carbon:add-alt" size="20" />
                        </div>
                        <span class="font-medium text-slate-700 group-hover:text-slate-900">Create New Project</span>
                    </button>
                    <button
                        class="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                    >
                        <div
                            class="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                        >
                            <Icon name="carbon:user-follow" size="20" />
                        </div>
                        <span class="font-medium text-slate-700 group-hover:text-slate-900">Invite Team Member</span>
                    </button>
                    <button
                        class="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                    >
                        <div
                            class="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors"
                        >
                            <Icon name="carbon:document-export" size="20" />
                        </div>
                        <span class="font-medium text-slate-700 group-hover:text-slate-900">Export Reports</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup></script>
