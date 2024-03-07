<template>
  <button
    :class="btnClassName"
    type="button"
    v-on:click="handleOpenCamera">
    {{ btnTxt }}
    <span
      v-if="btnTxtHidden !== ''"
      class="visually-hidden">
      {{ btnTxtHidden }}
    </span>
  </button>

  <dialog
    class="camera-dialogue"
    ref="cameraui"
    v-on:close="handleCloseDialogue(false)"
    v-on:cancel="handleCloseDialogue(false)">
    <div class="camera-dialogue__wrap">
      <LoadingSpinner v-show="showSpinner" />
      <p v-if="errorMsg !== ''" v-html="errorMsg"></p>
      <div v-show="streaming === true" class="camera">
        <video
          class="camera-dialogue__video"
          id="video"
          ref="videoEl"
          v-on:handleCanplay="handleCanPlay()">Video stream not available.</video>
        <p class="camera-dialogue__btn-wrap">
          <button
            class="file-upload__btn"
            id="startbutton"
            type="button"
            v-on:click="handleTakePhoto()">
            Capture
          </button>
        </p>
      </div>
      <div v-show="captured === true" class="output">
        <canvas
          class="file-upload__btn"
          :height="vHeight"
          ref="canvas"
          style="display:none;"
          :width="vWidth"></canvas>
        <img
          class="camera-dialogue__video"
          id="photo"
          :src="photo"
          alt="The screen capture will appear in this box."
          ref="imgEl" />
        <p class="camera-dialogue__btn-wrap">
          <button
            class="file-upload__btn"
            id="retakebutton"
            type="button"
            v-on:click="handleRetakePhoto()">
            Retake
            <span class="visually-hidden">photo</span>
          </button>
          <button
            class="file-upload__btn"
            id="usebutton"
            type="button"
            v-on:click="handleUsePhoto()">
            Use
            <span class="visually-hidden">photo</span>
          </button>
        </p>
      </div>
    </div>
    <button
      class="camera-dialogue__main-close"
      type="button"
      v-on:click="handleCloseDialogue(true)">
      <span class="visually-hidden">
        Close camera
      </span>
    </button>
  </dialog>
</template>

<script setup>
// We are using the video element without any audio so there's no
// need for a captions track
/* eslint vuejs-accessibility/media-has-caption: off */
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import LoadingSpinner from '../LoadingSpinner.vue';
import { doCloseModal, doShowModal } from '../../../utils/vue-utils';

// --------------------------------------------------
// START: Emitted events

const emit = defineEmits<{
  (e: 'close', value: boolean ) : void,
  (e: 'capturing', value: boolean ) : void,
  (e: 'usephoto', value: File ) : void,
}>();

//  END:  Emitted events
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  use: { type: Boolean, required: false, default: false },
  prefix: { type: String, required: false, default: '' },
  maxPx: { type: Number, required: false, default: 1500 },
  portrait: { type: Boolean, required: false, default: true },
  btnClass: { type: String, required: false, default: '' },
  btnTxt: { type: String, required: false, default: 'Take a photo' },
  btnTxtHidden: { type: String, required: false, default: '' },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

const mediaConstraints = {
  audio: false,
  video: true,
  // video: {
  //   width: { ideal: 1000 },
  //   height: { ideal: 1500 },
  // },
};

const isOpen : Ref<boolean> = ref(false);
const vWidth : Ref<number> = ref(0);
const vHeight : Ref<number> = ref(0);
const streaming : Ref<boolean> = ref(false);
const resizing : Ref<number> = ref(-1);
const captured : Ref<boolean> = ref(false);
const photo : Ref<string> = ref('');
const startInit : Ref<boolean> = ref(true);

const videoEl : Ref<HTMLVideoElement|null> = ref(null);
const imgEl : Ref<HTMLImageElement|null> = ref(null);
const canvas : Ref<HTMLCanvasElement|null> = ref(null);
const cameraui : Ref<HTMLDialogElement|null> = ref(null);
const errorMsg : Ref<string> = ref('');

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

// eslint-disable-next-line arrow-body-style
const btnClassName = computed(() : string => {
  const tmp : string = 'file-upload__';
  const btn : string = `${tmp}btn ${tmp}btn--webcam`;

  return (props.btnClass.trim() !== '')
    ? `${btn} ${props.btnClass}`
    : `${btn} ${tmp}label`;
});

const showSpinner = computed(() : boolean => streaming.value === false
  && captured.value === false && errorMsg.value === '');

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

const setImgSizeInner = () => {
  if (videoEl.value !== null) {
    if (videoEl.value.videoHeight > 0 && videoEl.value.videoWidth > 0) {
      const ratio = (props.portrait === true)
        ? (videoEl.value.videoWidth / videoEl.value.videoHeight)
        : (videoEl.value.videoHeight / videoEl.value.videoWidth);

      if (props.portrait === true) {
        vHeight.value = props.maxPx;
        vWidth.value = ratio * props.maxPx;
      } else {
        vWidth.value = props.maxPx;
        vHeight.value = props.maxPx / ratio;
      }
      resizing.value = -1;
    } else {
      // This is required because some
      resizing.value = setTimeout(setImgSizeInner, 500);
    }
  } else {
    resizing.value = -1;
  }

  if (typeof window.screen !== 'undefined' && typeof window.screen.orientation !== 'undefined') {
    // eslint-disable-next-line no-use-before-define
    window.screen.orientation.removeEventListener('orientationchange', setImgSize);
  }
};

const setImgSize = () => {
  if (resizing.value === -1 && videoEl.value !== null) {
    if (videoEl.value.videoWidth === 0 || videoEl.value.videoHeight === 0) {
      resizing.value = setTimeout(setImgSizeInner, 500);
    } else {
      setImgSizeInner();
    }
  }
};

const dialogueCloseInner = () : void => {
  streaming.value = false;
  captured.value = false;
  photo.value = '';
  startInit.value = true;
  isOpen.value = false;
  errorMsg.value = '';

  if (videoEl.value !== null && videoEl.value.srcObject !== null) {
    (videoEl.value.srcObject as MediaStream).getTracks().forEach(
      (track) => { track.stop(); },
    );
  }

  if (typeof window.screen !== 'undefined' && typeof window.screen.orientation !== 'undefined') {
    window.screen.orientation.removeEventListener('orientationchange', setImgSize);
  }
};

const initCamera = () : void => {
  if (props.use === true && isOpen.value === true && startInit.value === true) {
    startInit.value = false;
    if (typeof window.screen !== 'undefined' && typeof window.screen.orientation !== 'undefined') {
      window.screen.orientation.addEventListener('orientationchange', setImgSize);
    }
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((stream : MediaStream) : void => {
        if (videoEl.value !== null) {
          streaming.value = true;
          videoEl.value.srcObject = stream;
          videoEl.value.play();
          setImgSize();
        }
      }).catch((error) : void => {
        console.log('error:', error); // eslint-disable-line no-console
        // eslint-disable-next-line no-console
        console.error('Could not use camera:', error);
        errorMsg.value = `Could not use camera: <strong>${error.toString().replace(/^.*?: /, '')}</strong>`;
      });
  }
};

// - - - - - - - - - - - - - - - - - - - - - - - - -
// START: Event handlers

const handleCanPlay = () => {
  if (videoEl.value !== null) {
    if (streaming.value === false) {
      setImgSize();
      streaming.value = true;
    }
  }
};

const handleCloseDialogue = (close : boolean) : void => {
  dialogueCloseInner();
  if (close === true && cameraui.value !== null) {
    doCloseModal(cameraui.value);
    emit('capturing', false);
  }
};

const handleClearPhoto = () => {
  if (canvas.value !== null) {
    const context : CanvasRenderingContext2D|null = canvas.value.getContext('2d');

    if (context !== null && videoEl.value !== null) {
      photo.value = '';
      captured.value = false;
    }
  }
};

const handleOpenCamera = () => {
  isOpen.value = true;

  emit('capturing', true);

  if (cameraui.value !== null) {
    initCamera();
    doShowModal(cameraui.value);
  }
};

const handleTakePhoto = () => {
  if (canvas.value !== null) {
    const context : CanvasRenderingContext2D|null = canvas.value.getContext('2d');

    if (context !== null && videoEl.value !== null) {
      if (vWidth.value && vHeight.value) {
        canvas.value.width = vWidth.value;
        canvas.value.height = vHeight.value;
        context.drawImage(videoEl.value, 0, 0, vWidth.value, vHeight.value);

        if (canvas.value !== null) {
          photo.value = canvas.value.toDataURL('image/png');
        }
        streaming.value = false;
        captured.value = true;
      } else {
        handleClearPhoto();
      }
    }
  }
};

const handleRetakePhoto = () => {
  photo.value = '';
  streaming.value = true;
  captured.value = false;
};

const handleUsePhoto = () => {
  if (photo.value !== '') {
    const blobBin = atob(photo.value.split(',')[1]);
    const blobBits = [];

    for (let a = 0; a < blobBin.length; a += 1) {
      blobBits.push(blobBin.charCodeAt(a));
    }

    let fileName = props.prefix.trim().replace(/[^\-a-z0-9]+/ig, '-').replace(/^-+|-+$/g, '');

    if (fileName !== '') {
      fileName += '__';
    }

    fileName += `${Date.now()}.png`;

    if (cameraui.value !== null) {
      doCloseModal(cameraui.value);
    }

    emit(
      'usephoto',
      new File(
        [new Uint8Array(blobBits)],
        fileName,
        { type: 'image/png' },
      ),
    );
  }
};

//  END:  Event handlers
// - - - - - - - - - - - - - - - - - - - - - - - - -

//  END:  Local methods
// --------------------------------------------------

// onBeforeMount(() => {
// });
</script>

<style lang="scss">
.camera-dialogue {
  border: none;
  background-color: transparent;
  padding: 1rem;
  width: calc(100% - 4rem);
  // max-width: 29.5rem;
  // max-height: 29.5rem;

  &__wrap {
    background-color: white;
    border: 0.05rem solid #0000f5;
    border-radius: 0.3rem;
    padding: 1.25rem 1rem;
  }

  .loading-spinner {
    width: 3rem;
    height: 3rem;
  }

  &__video, &__img {
    background-size: contain;
    height: auto;
    width: 100%;
  }

  &__main-close {
    background-color: #fff;
    border: 0.1rem solid #009;
    border-radius: 50% !important;
    color: #000;
    display: inline-block;
    font-size: 0.5rem;
    height: 2rem;
    line-height: 1rem;
    position: absolute;
    right: 0;
    top: 0;
    width: 2rem;

    &::after {
      content: 'X';
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      font-size: 1rem;
      font-weight: bold;
      left: 50%;
      line-height: 0.7rem;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &__btn-wrap {
    margin: 1rem 0 0;
    display: flex;
    column-gap: 1rem;

    > * {
      width: calc(50% - 0.5rem);
    }
  }

}
</style>
