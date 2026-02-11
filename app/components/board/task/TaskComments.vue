<template>
    <div class="task-comments">
        <div class="comments-header">
            <h3 class="comments-title">
                <span>Comments</span>
                <span class="comments-count">{{ comments.length }}</span>
            </h3>
        </div>

        <div class="composer">
            <textarea
                v-model="text"
                class="comment-box"
                placeholder="Add a comment..."
                :disabled="loading || submitting"
            ></textarea>
            <div class="composer-actions">
                <Button
                    type="button"
                    label="Add Comment"
                    size="small"
                    class="bg-indigo-600 border-indigo-600"
                    :loading="submitting"
                    :disabled="loading || submitting || !text.trim()"
                    @click="addComment"
                />
            </div>
        </div>

        <div v-if="loading" class="state">
            <Icon name="carbon:renew" size="18" class="spinning" />
            <span>Loading comments...</span>
        </div>

        <div v-else-if="error" class="state error">
            <Icon name="carbon:warning" size="16" />
            <span>{{ error }}</span>
        </div>

        <div v-else-if="comments.length === 0" class="state empty">
            No comments yet. Be the first to comment!
        </div>

        <ul v-else class="comment-list">
            <li v-for="(comment, index) in comments" :key="getCommentKey(comment, index)" class="comment-item">
                <div class="comment-meta">
                    <strong>{{ getAuthorName(comment) }}</strong>
                    <div class="comment-meta-right">
                        <span>{{ formatTime(getCommentDate(comment)) || 'Unknown date' }}</span>
                        <div v-if="hasCommentId(comment)" class="comment-actions">
                            <button
                                type="button"
                                class="action-btn"
                                :disabled="loading || submitting || isCommentBusy(getCommentId(comment))"
                                @click="startEdit(comment)"
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                class="action-btn delete"
                                :disabled="loading || submitting || isCommentBusy(getCommentId(comment))"
                                @click="deleteComment(comment)"
                            >
                                {{ isCommentBusy(getCommentId(comment), 'delete') ? 'Deleting...' : 'Delete' }}
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="isEditingComment(comment)" class="comment-editor">
                    <textarea
                        v-model="editText"
                        class="comment-edit-box"
                        rows="3"
                        :disabled="isCommentBusy(getCommentId(comment))"
                    ></textarea>
                    <div class="comment-edit-actions">
                        <Button
                            type="button"
                            label="Cancel"
                            size="small"
                            severity="secondary"
                            outlined
                            :disabled="isCommentBusy(getCommentId(comment), 'update')"
                            @click="cancelEdit"
                        />
                        <Button
                            type="button"
                            label="Save"
                            size="small"
                            class="bg-indigo-600 border-indigo-600"
                            :loading="isCommentBusy(getCommentId(comment), 'update')"
                            :disabled="!editText.trim() || isCommentBusy(getCommentId(comment))"
                            @click="updateComment(comment)"
                        />
                    </div>
                </div>
                <p v-else class="comment-body">{{ getCommentContent(comment) }}</p>
            </li>
        </ul>
    </div>
</template>

<script setup>
import formatTime from '~/utils/formatTime';

const props = defineProps({
    taskId: {
        type: [Number, String],
        required: true,
    },
});

const { $api } = useNuxtApp();

const comments = ref([]);
const text = ref('');
const loading = ref(false);
const submitting = ref(false);
const error = ref('');
const editingCommentId = ref(null);
const editText = ref('');
const actionCommentId = ref(null);
const actionType = ref('');

const toCommentsArray = (response) => {
    if (Array.isArray(response)) {
        return response;
    }
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response?.items)) {
        return response.items;
    }
    if (Array.isArray(response?.comments)) {
        return response.comments;
    }
    return [];
};

const getAuthorName = (comment) => {
    return (
        comment?.author?.name ||
        comment?.user?.name ||
        comment?.createdBy?.name ||
        comment?.authorName ||
        comment?.userName ||
        'Unknown'
    );
};

const getCommentDate = (comment) => {
    return comment?.createdAt || comment?.updatedAt || comment?.date || '';
};

const getCommentId = (comment) => {
    return comment?.id ?? comment?._id ?? comment?.commentId ?? null;
};

const hasCommentId = (comment) => {
    return getCommentId(comment) !== null && getCommentId(comment) !== undefined;
};

const getCommentContent = (comment) => {
    return comment?.content || comment?.message || '';
};

const getCommentKey = (comment, index) => {
    return getCommentId(comment) || `${getCommentDate(comment)}-${index}`;
};

const isCommentBusy = (commentId, expectedType = '') => {
    if (commentId === null || commentId === undefined || actionCommentId.value === null || actionCommentId.value === undefined) {
        return false;
    }

    if (String(actionCommentId.value) !== String(commentId)) {
        return false;
    }

    if (!expectedType) {
        return true;
    }

    return actionType.value === expectedType;
};

const isEditingComment = (comment) => {
    const commentId = getCommentId(comment);
    if (commentId === null || commentId === undefined || editingCommentId.value === null || editingCommentId.value === undefined) {
        return false;
    }
    return String(editingCommentId.value) === String(commentId);
};

const startEdit = (comment) => {
    const commentId = getCommentId(comment);
    if (commentId === null || commentId === undefined) {
        return;
    }
    editingCommentId.value = commentId;
    editText.value = getCommentContent(comment);
    error.value = '';
};

const cancelEdit = () => {
    editingCommentId.value = null;
    editText.value = '';
};

const fetchComments = async () => {
    if (!props.taskId) {
        comments.value = [];
        cancelEdit();
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        const response = await $api(`/tasks/${props.taskId}/comments`);
        comments.value = toCommentsArray(response);
        if (
            editingCommentId.value !== null &&
            !comments.value.some((comment) => String(getCommentId(comment)) === String(editingCommentId.value))
        ) {
            cancelEdit();
        }
    } catch (err) {
        error.value = 'Failed to load comments';
        comments.value = [];
        cancelEdit();
    } finally {
        loading.value = false;
    }
};

const addComment = async () => {
    const content = text.value.trim();
    if (!content || !props.taskId) {
        return;
    }

    submitting.value = true;
    error.value = '';

    try {
        await $api(`/tasks/${props.taskId}/comments`, {
            method: 'POST',
            body: { content },
        });
        text.value = '';
        await fetchComments();
    } catch (err) {
        error.value = 'Failed to add comment';
    } finally {
        submitting.value = false;
    }
};

const updateComment = async (comment) => {
    const commentId = getCommentId(comment);
    const content = editText.value.trim();

    if (!props.taskId || commentId === null || commentId === undefined || !content) {
        return;
    }

    actionCommentId.value = commentId;
    actionType.value = 'update';
    error.value = '';

    try {
        await $api(`/tasks/${props.taskId}/comments/${commentId}`, {
            method: 'PATCH',
            body: { content },
        });

        cancelEdit();
        await fetchComments();
    } catch (err) {
        error.value = 'Failed to update comment';
    } finally {
        actionCommentId.value = null;
        actionType.value = '';
    }
};

const deleteComment = async (comment) => {
    const commentId = getCommentId(comment);
    if (!props.taskId || commentId === null || commentId === undefined) {
        return;
    }

    if (!confirm('Delete this comment?')) {
        return;
    }

    actionCommentId.value = commentId;
    actionType.value = 'delete';
    error.value = '';

    try {
        await $api(`/tasks/${props.taskId}/comments/${commentId}`, {
            method: 'DELETE',
        });

        if (String(editingCommentId.value) === String(commentId)) {
            cancelEdit();
        }
        await fetchComments();
    } catch (err) {
        error.value = 'Failed to delete comment';
    } finally {
        actionCommentId.value = null;
        actionType.value = '';
    }
};

watch(
    () => props.taskId,
    () => {
        text.value = '';
        cancelEdit();
        fetchComments();
    },
    { immediate: true },
);
</script>

<style scoped>
.task-comments {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.comments-header {
    border-bottom: 1px solid var(--surface-200);
    padding-bottom: 10px;
}

.comments-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--surface-900);
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.comments-count {
    min-width: 24px;
    height: 24px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-500);
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 0 6px;
}

.composer {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.comment-box {
    width: 100%;
    min-height: 106px;
    resize: vertical;
    border: 1px solid var(--surface-300);
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 15px;
    color: var(--surface-800);
    background: white;
    transition: all 0.2s ease;
}

.comment-box:focus {
    outline: none;
    border-color: var(--primary-400);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.comment-box::placeholder {
    color: var(--surface-400);
}

.composer-actions {
    display: flex;
    justify-content: flex-end;
}

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

.state.empty {
    color: var(--surface-500);
}

.comment-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.comment-item {
    border: 1px solid var(--surface-200);
    border-radius: 10px;
    background: white;
    padding: 12px 14px;
}

.comment-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--surface-500);
    margin-bottom: 6px;
}

.comment-meta-right {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.comment-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.action-btn {
    border: none;
    background: transparent;
    color: #2563eb;
    font-size: 12px;
    font-weight: 600;
    padding: 0;
    cursor: pointer;
}

.action-btn.delete {
    color: #dc2626;
}

.action-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.comment-body {
    margin: 0;
    font-size: 14px;
    color: var(--surface-800);
    white-space: pre-wrap;
    word-break: break-word;
}

.comment-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.comment-edit-box {
    width: 100%;
    resize: vertical;
    border: 1px solid var(--surface-300);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--surface-800);
}

.comment-edit-box:focus {
    outline: none;
    border-color: var(--primary-400);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.comment-edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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
</style>
