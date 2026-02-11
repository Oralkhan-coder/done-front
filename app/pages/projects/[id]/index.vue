<script setup>
const route = useRoute();
await navigateTo(`/projects/${route.params.id}/profile`, { redirectCode: 302 });
</script>
