<template>
  <svg width="210mm" height="297mm" viewBox="0 0 210 297" version="1.1" xmlns="http://www.w3.org/2000/svg" :class="stateClass">
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
            <tspan x="125" y="167">Loading...</tspan>
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
            <tspan x="113" y="179">Error</tspan>
          </text>
          <text transform="scale(0.26458333)" x="0" y="0">
            <tspan x="113" y="310">{{ error1a }}</tspan>
            <tspan x="113" y="422">{{ error1b }}.</tspan>
          </text>
          <text v-if="errorCount > 1" transform="scale(0.26458333)" x="-262.33609" y="0">
            <tspan x="113" y="559">{{ error2a }}</tspan>
            <tspan x="113" y="670">{{ error2b }}.</tspan>
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
<script lang="ts">
import { svgData } from './FileUpload.d';

export default {
  props: {
    fileName: { type: String, required: true },
    ext: { type: String, required: true },
    loading: { type: Boolean, required: false, default: false },
    tooLarge: { type: Boolean, required: false, default: false },
    isBad: { type: Boolean, required: false, default: false },
  },

  data() : svgData {
    return {
      errorCount: 0,
      error1a: '',
      error1b: '',
      error2a: '',
      error2b: ''
    };
  },

  methods: {
    stateClass() : string {
      const tmp = 'file-upload-placeholder'

      if (this.tooLarge || this.isBad) {
        return `${tmp} ${tmp}--error`;
      } else if (this.loading) {
        return `${tmp} ${tmp}--loading`;
      } else {
        return tmp;
      }
    }
  },

  mounted() : void {
    if (this.isBad) {
      this.error1a = 'Forbidden file';
      this.error1b = 'type';
      if (this.tooLarge) {
        this.error2a = 'File size is too';
        this.error2b = 'large';
      }
    } else if (this.tooLarge) {
      this.error1a = 'File size is too';
      this.error1b = 'large';
    }
  }
}
</script>

<style>
svg.file-upload-placeholder g {
  font-family: Verdana, Arial, Helvetica, sans-serif;
}
svg.file-upload-placeholder .placeholder-file-meta text {
  display: block;
  fill: #000;
  fill-opacity: 1;
  font-weight: bold;
  stroke: none;
  text-align: center;
  text-anchor: middle;
}

svg.file-upload-placeholder .placeholder-file-meta tspan {
  font-weight: bold;
  text-anchor: middle;
}
svg.file-upload-placeholder .placeholder-file-name {
  font-size: 9px;
  font-family: 'Courier New', monospace;
}
svg.file-upload-placeholder .placeholder-ext {
  font-size: 50px;
  text-transform: uppercase;
}
svg.file-upload-placeholder .placeholder-error-msg text {
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

svg.file-upload-placeholder .placeholder-error-msg {
  display: none;
}
svg.file-upload-placeholder .placeholder-error-msg rect {
  display: inline;
  fill: #d60000;
  fill-opacity: 0.7;
  stroke: none;
}

svg.file-upload-placeholder .placeholder-faux-text-block rect {
  fill: #1a1a1a;
  fill-opacity: 1;
  stroke: none;
}
svg.file-upload-placeholder #placeholder-message-error {
  fill: #fff;
  font-size: 90px;
  stroke: #fff;
}
svg.file-upload-placeholder .placeholder-page path {
  stroke: #000;
  stroke-dasharray: none;
  stroke-opacity: 1;
}
svg.file-upload-placeholder .placeholder-page-frame {
  fill: none;
  stroke-width: 5;
}
svg.file-upload-placeholder .placeholder-page-corner {
  fill: #000000;
  stroke-width: 2;
  fill-opacity: 1;
}
svg.file-upload-placeholder .placeholder-page-corner-edge {
  display:inline;
  fill:none;
  stroke:#fff !important;
  stroke-width:4;
  stroke-dasharray:none;
  stroke-opacity:1;
}

svg.file-upload-placeholder .placeholder-loading-indicator {
  display: none;
}
svg.file-upload-placeholder .placeholder-loading-indicator circle {
  fill: #fff;
  stroke: none;
  animation-direction: alternate;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-name: placeholde-slide;
  animation-timing-function: ease-in-out;
}
svg.file-upload-placeholder .placeholder-loading-indicator circle:nth-of-type(2) { animation-delay: 0.6s; }
svg.file-upload-placeholder .placeholder-loading-indicator circle:nth-of-type(3) { animation-delay: 1.2s; }
svg.file-upload-placeholder .placeholder-loading-indicator circle:nth-of-type(4) { animation-delay: 1.8s; }
svg.file-upload-placeholder .placeholder-loading-indicator text {
  text-transform: uppercase;
  fill: #fff;
  font-size: 50px;
}

svg.file-upload-placeholder--error .placeholder-error-msg {
  display: block;
}
svg.file-upload-placeholder--error .placeholder-laceholder-file-meta text {
  fill: #fff;
  stroke: #000;
  stroke-width: 0.1;
  stroke-opacity: 0.7;
}
svg.file-upload-placeholder--loading .placeholder-loading-indicator {
  display: block;
}

@keyframes placeholde-slide {
  0% { transform: translateX(0); }
  100% { transform: translateX(134px); }
}
</style>
