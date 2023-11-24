<template>
  <svg height="100%" viewBox="0 0 210 297" version="1.1" xmlns="http://www.w3.org/2000/svg" :class="stateClass">
      <g>
        <g class="placeholder-faux-text-block">
          <rect width="120" height="22" x="28" y="28" />
          <rect width="154" height="20" x="28" y="66" />
          <rect width="154" height="20" x="28" y="95.5" />
          <rect width="154" height="20" x="28" y="132" />
          <rect width="154" height="20" x="28" y="161.5" />
        </g>
        <g class="placeholder-loading-indicator">
          <text transform="scale(0.26458333)" x="0" y="0">
            <tspan x="125" y="167">Resizing...</tspan>
          </text>
          <circle r="7.5" cx="38" cy="76" />
          <circle r="7.5" cx="38" cy="105" />
          <circle r="7.5" cx="38" cy="142" />
          <circle r="7.5" cx="38" cy="171.5" />
        </g>
        <g class="placeholder-page">
				  <path class="placeholder-page-corner-edge" d="m 130,10.000001 v 70 h 70" />
          <path class="placeholder-page-frame" d="m 10,10.132292 120,-0.132291 70,70 0,206.999969 H 10 Z" />
          <path class="placeholder-page-corner" d="m 130,10 c 19.12159,19.057535 31.0578,31.0578 70,70 h -70 z" />
        </g>
      </g>
      <g>
        <g v-if="errorCount > 0" class="placeholder-error-msg" >
          <rect width="210" height="297" x="-1.7763568e-15" y="-1.7763568e-15" />
          <text transform="scale(0.26458333)" class="placeholder-message-error" x="0" y="0">
            <tspan x="120" y="170">Error</tspan>
          </text>
          <text transform="scale(0.26458333)" x="0" y="0">
            <tspan x="120" y="310">{{ error1a }}</tspan>
            <tspan x="120" y="421">{{ error1b }}.</tspan>
          </text>
          <text v-if="errorCount > 1" transform="scale(0.26458333)" x="-262.33609" y="0">
            <tspan x="120" y="559">{{ error2a }}</tspan>
            <tspan x="120" y="670">{{ error2b }}.</tspan>
          </text>
        </g>
        <g class="placeholder-file-meta">
          <text class="placeholder-ext" x="105" y="242">
            <tspan x="105" y="242">.{{ ext }}</tspan>
          </text>
          <text class="placeholder-file-name" x="105" y="268">
            <tspan x="105" y="268">{{ fileName }}</tspan>
          </text>
        </g>
      </g>
  </svg>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';
import type { Ref } from 'vue';
// import { svgData } from '../../types/FileUpload.d';

// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  fileName: { type: String, required: true },
  ext: { type: String, required: true },
  loading: { type: Boolean, required: false, default: false },
  tooLarge: { type: Boolean, required: false, default: false },
  isBad: { type: Boolean, required: false, default: false },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

const errorCount : Ref<number> = ref(0);
const error1a : Ref<string> = ref('');
const error1b : Ref<string> = ref('');
const error2a : Ref<string> = ref('');
const error2b : Ref<string> = ref('');

//  END:  Local state
// --------------------------------------------------
// START: Local methods

const stateClass = computed(() : string => {
  const tmp = 'file-upload-placeholder'

  if (props.tooLarge || props.isBad) {
    return `${tmp} ${tmp}--error`;
  } else if (props.loading) {
    return `${tmp} ${tmp}--loading`;
  } else {
    return tmp;
  }
});

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() : void => {
  errorCount.value = 0;

  if (props.isBad) {
    error1a.value = 'Forbidden file';
    error1b.value = 'type';
    errorCount.value += 1;

    if (props.tooLarge) {
      error2a.value = 'File size is too';
      error2b.value = 'large';
      errorCount.value += 1;
    }
  } else if (props.tooLarge) {
    error1a.value = 'File size is too';
    error1b.value = 'large';
    errorCount.value += 1;
  }
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>

<style lang="scss">
svg {
  &.file-upload-placeholder {
    g {
      font-family: Verdana, Arial, Helvetica, sans-serif;
    }

    #placeholder-message-error {
      fill: #fff;
      font-size: 90px;
      stroke: #fff;
    }

    .placeholder {
      &-file {
        &-meta {
          text {
            display: block;
            fill: #000;
            fill-opacity: 1;
            font-weight: bold;
            stroke: none;
            text-align: center;
            text-anchor: middle;
          }

          tspan {
            font-weight: bold;
            text-anchor: middle;
          }
        }

        &-name {
          font-size: 9px;
          font-family: 'Courier New', monospace;
        }
      }

      &-ext {
        font-size: 50px;
        text-transform: uppercase;
        filter:
          drop-shadow(rgba(70, 70, 70, 0.7) -0.5px 1.5px 1px)
          drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
      }

      &-error-msg {
        display: none;

        text {
          font-weight: bold;
          font-size: 60px;
          font-family: Verdana, Arial, Helvetica, sans-serif;
          text-align: start;
          display: inline;
          fill: #fff;
          stroke: #000;
          stroke-width: 1;
          stroke-opacity: 0.7;
          stroke-dasharray: none;
        }

        rect {
          display: inline;
          fill: #d60000;
          fill-opacity: 0.7;
          stroke: none;
        }
      }

      &-faux-text-block {
        rect {
          fill: #1a1a1a;
          fill-opacity: 1;
          stroke: none;
        }
      }

      &-page {
        path {
          stroke: #000;
          stroke-dasharray: none;
          stroke-opacity: 1;
        }

        &-frame {
          fill: none;
          stroke-width: 5;
        }

        &-corner {
          fill: #000000;
          stroke-width: 2;
          fill-opacity: 1;

          &-edge {
            display:inline;
            fill:none;
            stroke:#fff !important;
            stroke-width:4;
            stroke-dasharray:none;
            stroke-opacity:1;
          }
        }
      }

      &-loading-indicator {
        display: none;

        circle {
          fill: #fff;
          stroke: none;
          animation-direction: alternate;
          animation-duration: 1s;
          animation-iteration-count: infinite;
          animation-name: placeholde-slide;
          animation-timing-function: ease-in-out;
          /* filter: drop-shadow(rgba(255, 255, 100, 0.5) -1px 0px 3px); */

          &:nth-of-type(2) { animation-delay: 0.2s; }
          &:nth-of-type(3) { animation-delay: 0.4s; }
          &:nth-of-type(4) { animation-delay: 0.6s; }
        }

        text {
          text-transform: uppercase;
          fill: #fff;
          font-size: 50px;
        }
      }
    }

    &--error {
      .placeholder {
        &-error-msg {
          display: block;
        }

        &-file-meta text {
          fill: #fff;
          stroke: #000;
          stroke-width: 0.1;
          stroke-opacity: 0.7;
        }
      }
    }

    &--loading .placeholder-loading-indicator {
      display: inline;
    }
  }
}

@keyframes placeholde-slide {
  0% { transform: translateX(0); }
  100% { transform: translateX(134px); }
}
</style>
