<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import FileUpload from './components/FileUpload/FileUpload.vue';

function handleUpload (e : Event) {
  console.group('handleUpload()')
  console.log('event:', e);
  console.log('handling upload confirmation click')
  console.groupEnd();
}

</script>

<template>
  <FileUpload label="Upload some documents" maxFiles="10" id="file-upload-1" helpTxt="This is some useful info on why you should upload files to our service" @confirm-upload.once="handleUpload"></FileUpload>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
