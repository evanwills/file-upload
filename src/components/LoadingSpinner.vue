<template>
  <svg version="1.1" viewBox="0 0 12.7 12.7" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" :class="getRevClass">
    <g transform="matrix(.069997 0 0 .069997 6.3504 -72.223)">
      <path
        id="TOP"
        transform="translate(-2.9105e-7 1.1329e-5)"
        d="m11.211 1037.8a1.5118 1.5118 0 0 0-1.3343-1.6338 86.929 86.929 0 0 0-19.754 0 1.5118 1.5118 0 0 0-1.3343 1.6338l4.7177 53.923a1.1339 1.1339 0 0 0 1.3234 1.0183 30.236 30.236 0 0 1 10.341 0 1.1339 1.1339 0 0 0 1.3234-1.0183z"
      />
      <path
        id="top-right"
        transform="translate(-2.9105e-7 1.1329e-5)"
        d="m67.842 1070.5a1.5118 1.5118 0 0 0 0.21178-2.0988 86.929 86.929 0 0 0-13.968-13.968 1.5118 1.5118 0 0 0-2.0987 0.2118l-34.794 41.465a1.1339 1.1339 0 0 0 0.21573 1.6559 30.236 30.236 0 0 1 7.3119 7.3119 1.1339 1.1339 0 0 0 1.6559 0.2157z"
      />
      <path
        id="RIGHT"
        transform="translate(-2.9105e-7 1.1329e-5)"
        d="m84.732 1133.7a1.5118 1.5118 0 0 0 1.6338-1.3343 86.929 86.929 0 0 0 0-19.754 1.5118 1.5118 0 0 0-1.6338-1.3343l-53.923 4.7177a1.1339 1.1339 0 0 0-1.0183 1.3234 30.236 30.236 0 0 1 0 10.341 1.1339 1.1339 0 0 0 1.0183 1.3234z"
      />
      <path
        id="bottom-right"
        d="m51.987 1190.4a1.5118 1.5118 0 0 0 2.0987 0.2118 86.929 86.929 0 0 0 13.968-13.968 1.5118 1.5118 0 0 0-0.21178-2.0987l-41.465-34.794a1.1339 1.1339 0 0 0-1.6559 0.2157 30.236 30.236 0 0 1-7.3119 7.3119 1.1339 1.1339 0 0 0-0.21573 1.6558z"
      />
      <path
        id="BOTTOM"
        transform="translate(-2.9105e-7 1.1329e-5)"
        d="m-11.211 1207.3a1.5118 1.5118 0 0 0 1.3343 1.6338 86.929 86.929 0 0 0 19.754 0 1.5118 1.5118 0 0 0 1.3343-1.6338l-4.7177-53.923a1.1339 1.1339 0 0 0-1.3234-1.0183 30.236 30.236 0 0 1-10.341 0 1.1339 1.1339 0 0 0-1.3234 1.0183z"
      />
      <path
        id="bottom-left"
        transform="translate(-2.9105e-7 1.1329e-5)"
        d="m-67.842 1174.5a1.5118 1.5118 0 0 0-0.21178 2.0987 86.929 86.929 0 0 0 13.968 13.968 1.5118 1.5118 0 0 0 2.0987-0.2118l34.794-41.465a1.1339 1.1339 0 0 0-0.21573-1.6558 30.236 30.236 0 0 1-7.3119-7.3119 1.1339 1.1339 0 0 0-1.6559-0.2157z"
      />
      <path
        id="LEFT"
        transform="translate(-2.9105e-7 1.1329e-5)"
        d="m-84.732 1111.3a1.5118 1.5118 0 0 0-1.6338 1.3343 86.929 86.929 0 0 0 0 19.754 1.5118 1.5118 0 0 0 1.6338 1.3343l53.923-4.7177a1.1339 1.1339 0 0 0 1.0183-1.3234 30.236 30.236 0 0 1 0-10.341 1.1339 1.1339 0 0 0-1.0183-1.3234z"
      />
      <path
        id="top-left"
        d="m-51.987 1054.7a1.5118 1.5118 0 0 0-2.0987-0.2118 86.929 86.929 0 0 0-13.968 13.968 1.5118 1.5118 0 0 0 0.21178 2.0988l41.465 34.794a1.1339 1.1339 0 0 0 1.6559-0.2157 30.236 30.236 0 0 1 7.3119-7.3119 1.1339 1.1339 0 0 0 0.21573-1.6559z"
      />
    </g>
  </svg>
</template>

<script lang="ts" setup>
/* eslint max-len: off */
import { computed } from 'vue';

const props = defineProps({
  rev: { type: Boolean, required: false, default: false },
});

const getRevClass = computed(() : string => {
  const tmp = 'loading-spinner';
  return (props.rev === true)
    ? `${tmp} ${tmp}--rev`
    : tmp;
});

</script>

<style lang="scss">
$fill-colour: #0000f5;

.loading-spinner {
  path {
    --duration: var(--loading-duration, 1.5s);
    animation-name: pulseFade;
    animation-duration: var(--duration);
    animation-iteration-count: infinite;
    fill: $fill-colour;

    &:nth-child(1) { animation-delay: 0; }
    &:nth-child(2) { animation-delay: calc(var(--duration) * 0.125); }
    &:nth-child(3) { animation-delay: calc(var(--duration) * 0.25); }
    &:nth-child(4) { animation-delay: calc(var(--duration) * 0.375); }
    &:nth-child(5) { animation-delay: calc(var(--duration) * 0.5); }
    &:nth-child(6) { animation-delay: calc(var(--duration) * 0.625); }
    &:nth-child(7) { animation-delay: calc(var(--duration) * 0.75); }
    &:nth-child(8) { animation-delay: calc(var(--duration) * 0.875); }
  }

  &--rev {
    path {
      fill: white;
    }
  }
}
@keyframes pulseFade {
  from {
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  25% {
    opacity: 1;
  }
  70% {
    opactiy: 0.1;
  }
  to {
    opacity: 0;
  }
}
</style>
