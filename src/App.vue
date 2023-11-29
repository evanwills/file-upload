<template>
  <!-- -->
  <FileUpload
    label="Upload some documents"
    maxFiles="10"
    id="file-upload--1"
    helpTxt="This is some useful info on why you should upload files to our service"
    v-on:confirm-upload="handleUpload"
    reorder
    cancel-confirm-text="Are you really sure you want to cancel?"
    upload-confirm-text="Those are some awesome files. Are you ready to send them?"
    jpeg-level="0.7" />
  <!-- -->
  <!-- <WebCamera use /> -->
</template>

<script setup lang="ts">
import FileUpload from './components/FileUpload/FileUpload.vue';
// import WebCamera from './components/FileUpload/WebCamera.vue';

function handleUpload (e : Event) {
  console.group('handleUpload()')
  console.log('event:', e);
  console.log('handling upload confirmation click')
  console.groupEnd();
}

</script>

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

/**
 * Copied from Bootstrap 5.x CSS
 */
.visually-hidden,
.visually-hidden-focusable:not(:focus):not(:focus-within) {
  border: 0 !important;
  clip: rect(0,0,0,0) !important;
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  position: absolute !important;
  white-space: nowrap !important;
  width: 1px !important;
}
</style>
