<template>
    <ClientOnly>
        <Editor v-model="localValue" license-key="gpl" :init="editorConfig" />
    </ClientOnly>
</template>

<script setup>
import { computed } from 'vue';
import Editor from '@tinymce/tinymce-vue';
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/code';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/table';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/content/default/content.min.css';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value || ''),
});

const editorConfig = {
    height: 400,
    menubar: false,
    skin: false,
    content_css: false,
    plugins: ['lists', 'link', 'table', 'code', 'autolink', 'preview'],
    toolbar:
        'undo redo | bold italic underline | ' +
        'bullist numlist | alignleft aligncenter alignright | ' +
        'link table | code preview',
    content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:14px }',
};
</script>
