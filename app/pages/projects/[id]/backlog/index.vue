<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold text-slate-900">Backlog</h2>
                <p class="text-sm text-slate-500 mt-1">Plan and prioritize your project tasks</p>
            </div>
            <Button 
                label="Create Issue" 
                icon="carbon:add" 
                size="small"
                class="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700" 
            />
        </div>

        <!-- Backlog Content -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <!-- Empty State -->
            <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Icon name="carbon:list" size="32" class="text-indigo-600" />
                </div>
                <h3 class="text-lg font-semibold text-slate-900">Your backlog is empty</h3>
                <p class="text-slate-500 max-w-sm mt-2 mb-6">
                    Start adding issues to your backlog to plan and organize your project work.
                </p>
                <Button 
                    label="Create your first issue" 
                    icon="carbon:add" 
                    size="small" 
                    outlined 
                    class="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                />
            </div>
        </div>

        <!-- Info Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex gap-3">
                <Icon name="carbon:information" size="20" class="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 class="text-sm font-semibold text-blue-900">About Backlog</h4>
                    <p class="text-sm text-blue-700 mt-1">
                        The backlog is where you manage all your project's work items. 
                        Create, prioritize, and organize issues before moving them to your board.
                    </p>
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
</script>

<style scoped>
/* Additional styles if needed */
</style>
