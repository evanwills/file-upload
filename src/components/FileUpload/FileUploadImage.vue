<template>
  <figure
    :class="wrapClass"
    v-on:keyup="keyUpEvent($event)">
    <figcaption :class="(fileSrc !== '') ? 'file-upload-img--img' : 'file-upload-img--file'">
      <span class="file-upload-img__pos">{{ (pos + 1) }}</span>
      <span class="file-upload-img__file-name" v-html="_fileName"></span>
      <!--
      <p v-if="isTooBig === true" class="file-upload-img__bad">
        This file is too large to be uploaded.
        Please replace it with a smaller version or delete it from the upload list.
      </p>
      <p v-if="isBadType === true" class="file-upload-img__bad-msg">
        You cannot upload a <code>.{{ ext }}</code> type file.
        Please delete or replace it.
      </p>
      <p v-if="isSurplus === true" class="file-upload-img__bad-msg">
        There are already too many files in the list.
        Either move this file up the list or delete it.
      </p>
      -->
    </figcaption>

    <div class="file-upload-img__img">
      <img
        v-if="fileSrc !== ''"
        :alt="alt"
        :class="isPortrait === true ? 'portrait' : ''"
        :key="updatedKey"
        :src="fileSrc" />
      <FileUploadPlaceholder
        v-else
        :loading="!isReady"
        :is-bad="isBadType"
        :too-large="isTooBig"
        :ext="ext"
        :file-name="fileName" />
    </div>

    <span v-if="isReady || isBad" :class="getBtnBlockClass">
      <button
        v-if="canMove === true && isBad === false && pos > 0"
        class="file-upload__btn file-upload-img__btn file-upload-img__btn--move file-upload-img__btn--left"
        ref="moveLeftBtn"
        :tabindex="(isFocused === false) ? -1 : undefined"
        type="button"
        v-on:click="moveLeftClick">
        <span class="material-icons">arrow_back</span>
        <span class="visually-hidden">Move left</span>
      </button>
      <button
        v-if="canMove === true && isBad === false && pos < (total - 1)"
        class="file-upload__btn file-upload-img__btn file-upload-img__btn--move file-upload-img__btn--right"
        :tabindex="(isFocused === false) ? -1 : undefined"
        type="button"
        v-on:click="moveRightClick">
        <span class="material-icons">arrow_forward</span>
        <span class="visually-hidden">Move right</span>
      </button>
      <label
        v-if="isSurplus === false && fromCamera === false"
        class="file-upload-img__btn file-upload-img__btn--replace">
        <span class="material-icons">autorenew</span>
        <span class="visually-hidden">Replace</span>
        <input
          :accept="accepted"
          class="visually-hidden"
          :id="getID('extra-input')"
          :tabindex="(isFocused === false) ? -1 : undefined"
          type="file"
          v-on:change="replaceComplete($event)"
          v-on:click="replaceClick"
          v-on:focus="replaceFocus" />
      </label>
      <WebCamera
        v-else-if="isSurplus === false && fromCamera === true"
        btn-txt=""
        btn-txt-hidden="Replace"
        btn-class="file-upload-img__btn file-upload-img__btn--replace"
        btn-icon="autorenew"
        use
        v-on:usephoto="replaceFromCamera($event)" />
      <button
        v-if="total > 1 || isBad"
        class="file-upload__btn file-upload-img__btn file-upload-img__btn--delete"
        :tabindex="(isFocused === false) ? -1 : undefined"
        type="button"
        v-on:click="deleteClick">
        <span class="material-icons">clear</span>
        <span class="visually-hidden">Delete</span>
      </button>
    </span>
  </figure>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  // onMounted,
  onUpdated,
  ref,
} from 'vue';
import { getFieldID } from './FileUpload.utils';
import FileUploadPlaceholder from './FileUploadPlaceholder.vue';
import WebCamera from './WebCamera.vue';

// --------------------------------------------------
// START: Emitted events

const emit = defineEmits([
  'delete',
  'moveleft',
  'moveright',
  'replace',
  'fileOpen',
  'keyup',
]);

//  END:  Emitted events
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  /**
   * List of space separated MIME types for files user can upload
   *
   * @property {string} accepted
   */
  accepted: { type: String, required: true },

  /**
   * Whether or not user can move this file relative to its
   * siblings
   *
   * @property {boolean} canMove
   */
  canMove: { type: Boolean, required: false, default: false },

  /**
   * Letters in file extension for this file.
   *
   * Used to indicate the file type for non image files or
   * processing state for images.
   *
   * @property {string} ext
   */
  ext: { type: String, required: true },

  /**
   * File name of image/file
   *
   * @property {string} fileName
   */
  fileName: { type: String, required: true },

  /**
   * File size (in Bytes) for this file/image
   *
   * @property {number} fileSize
   */
  fileSize: { type: Number, required: true },

  /**
   * Data source URL for the image
   * (empty string if image is not processed or file is not an image)
   *
   * @property {string} fileSrc
   */
  fileSrc: { type: String, required: true },

  /**
   * Human readable file type for image
   *
   * @property {string} fileType
   */
  fileType: { type: String, required: true },

  /**
   * Whether or not the file was created via the web using the
   * device's camera
   *
   * @property {boolean} fromCamera
   */
  fromCamera: { type: Boolean, required: false, default: false },

  /**
   * ID for this component
   *
   * @property {string} id
   */
  id: { type: String, required: true },

  /**
   * Whether or not this file/image has an unacceptable file type
   *
   * @property {boolean} badType
   */
  isBadType: { type: Boolean, required: false, default: false },
  /**
   * Whether or not this component is the focused file/image in
   * the file carousel
   *
   * @property {boolean} isFocused
   */
  isFocused: { type: Boolean, required: true },

  /**
   * Whether or not image in this component has a portrait aspect
   * ratio.
   *
   * @property {boolean} isPortrait
   */
  isPortrait: { type: Boolean, required: true },

  /**
   * Whether or not this file is ready to be rendered
   *
   * @property {boolean} isReady
   */
  isReady: { type: Boolean, required: false },

  /**
   * Whether or not this file is surplus
   *
   * (i.e. the maximum number of good files has already been
   * reached. This file may be good but there are already enough
   * so it can't be included in the upload)
   *
   * @property {boolean} isSurplus
   */
  isSurplus: { type: Boolean, required: true },

  /**
   * Whether or not this file's size exceedes the maximum allowed
   *
   * @property
   */
  isTooBig: { type: Boolean, required: true },

  /**
   * Position of this file/image within the list of files/images
   * user has selected for upload
   *
   * @property {number} pos
   */
  pos: { type: Number, required: true },

  /**
   * Total number of files/images in the list of files/images the
   * user has selected for upload
   */
  total: { type: Number, required: true },

  /**
   * Total number of files/images in the list of files/images the
   * user has selected for upload
   */
  updatedKey: { type: String, required: true },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

// const isBad = ref(false);
// const wrapClass = ref('');
const alt = ref('');
// const _ext = ref('');
// const _fileName = ref('');
// const _fileOpen = ref(false);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

/**
 * Get class names to use on element wrapping buttons
 *
 * @returns btn-block classes for button wrapper
 */
const getBtnBlockClass = computed(() => {
  const tmp = 'file-upload-img__btn-block';

  return (props.isFocused)
    ? `${tmp} ${tmp}--show`
    : tmp;
});

/**
 * Get class names to use on placeholder element
 *
 * @returns placeholder classes
 */
// const getPlaceholderClass = computed(() => {
//   const tmp = 'file-upload-img__placeholder';

//   return (props.isReady === false)
//     ? `${tmp} ${tmp}--processing`
//     : tmp;
// });

/**
 * Make the file name wrappable but inserting a zero-width space
 * before any non alpha-numeric character
 *
 * @returns string with zero-width spaces added to help file
 *          names wrap
 */
// const makeWrapable = computed(() => props.fileName.replace(/(?=[^a-z0-9]+)/ig, '\u200B'));

const isBad = computed(() => (props.isTooBig === true || props.isBadType === true));

const wrapClass = computed(() => {
  const tmp = 'file-upload-img';

  if (isBad.value === true) {
    return `${tmp} ${tmp}--bad`;
  }

  if (props.isSurplus === true) {
    return `${tmp}  ${tmp}--surplus`;
  }

  return tmp;
});

const _fileName = computed(() => props.fileName.replace(/([^a-z0-9]+)/ig, '$1&ZeroWidthSpace;'));

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

/**
 * Removing this file from the list of files to be uploaded
 */
const deleteClick = () => {
  emit('delete', props.fileName);
};

/**
 * Handle swapping this file's position with its left hand
 * neighbour
 */
const moveLeftClick = () => {
  emit('moveleft', props.fileName);
};

/**
 * Handle swapping this file's position with its right hand
 * neighbour
 */
const moveRightClick = () => {
  emit('moveright', props.fileName);
};

/**
 * Handle replacing the existing file with a newly selected file
 * from user's file system
 *
 * @param e
 */
const replaceComplete = (e) => {
  const { files } = e.target;

  if (files !== null) {
    emit(
      'replace',
      {
        oldName: props.fileName,
        newFile: files[0],
      },
    );
  }
};

/**
 * Handle replacing the existing file with a newly selected file
 * from user's file system
 *
 * @param {File} file
 */
const replaceFromCamera = (file) => {
  if (file !== null) {
    emit(
      'replace',
      {
        oldName: props.fileName,
        newFile: file,
      },
    );
  }
};

const replaceClick = () => {
  emit('fileOpen', true);
};

const replaceFocus = () => {
  emit('fileOpen', false);
};

/**
 * Handle user releasing a pressed keyboard key
 *
 * @param {KeyboardEvent} keyEvent
 */
const keyUpEvent = (keyEvent) => {
  emit('keyup', keyEvent);
};

/**
 * Get a unique ID to user as the value for a label's `for`
 * attribute and an ID for the associated input field.
 *
 * @param {string} suffix string to append to parent ID
 *
 * @returns {string} a string to use as an input field ID
 */
const getID = (suffix) => getFieldID(props.id, suffix);

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  // const tmp = 'file-upload-img';

  // if (props.isTooBig === true || props.isBadType === true) {
  //   isBad.value = true;

  //   wrapClass.value = `${tmp} ${tmp}--bad`;
  // } else if (props.isSurplus === true) {
  //   wrapClass.value = `${tmp} ${tmp}--surplus`;
  // } else {
  //   wrapClass.value = tmp;
  // }

  // _ext.value = (props.isReady === false)
  //   ? `Processing ${props.ext} image`
  //   : props.ext;

  // _fileName.value = props.fileName.replace(/([^a-z0-9]+)/ig, '$1&ZeroWidthSpace;')

  console.group('FileUploadImage.onBeforeMount()');
  console.log('props.fileName:', props.fileName);
  console.log('props.updatedKey:', props.updatedKey);
  console.groupEnd();
});

onUpdated(() => {
  console.group('FileUploadImage.onUpdated()');
  console.log('props.fileName:', props.fileName);
  console.log('props.updatedKey:', props.updatedKey);
  console.groupEnd();
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>

<style lang="scss">
.file-upload-img {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  // height: 100%;
  height: calc(var(--file-upload-img-max) + 5.5rem);
  margin: 0;
  overflow-y: auto;
  padding: 1rem 1rem 0.5rem;
  position: relative;

  > figcaption {
    position: absolute;
    top: 1rem;
    left: 0;
    right: 0;
    z-index: 1;
  }

  &--bad {
    &::before {
      border-color: #c00;
    }
  }

  &__img {
    flex-grow: 1;
    position: relative;
    // order: 2;
    box-shadow: 0 0 0.75rem rgba(0, 0, 0, 0.2);

    > img,  > svg {
      display: block;
      height: 100%;
      // max-width: calc(100% - 2rem);
      margin: 0 auto;
      height: calc(var(--file-upload-img-max) + 0.5rem);
      // max-height: var(--file-upload-img-max);
      // max-width: var(--file-upload-img-max);
      object-fit: scale-down;
      position: relative;
      text-align: center;
      width: calc(var(--file-upload-img-max));
    }
  }

  &--file {
    .file-upload-img {
      &__bad-msg {
        margin: 1.25rem 2.8rem 0;
      }

      &__file-name {
        display: none;
      }
    }
  }

  &__btn {
    border-radius: 0;
    flex-grow: 1;
    padding: 0.6rem;
    text-align: center;
    // width: 3rem;
    position: relative;
    height: 3rem;

    &:focus {
      outline: 0.2rem dotted #00b;
    }

    &::before {
      position: absolute;
      font-size: 1.5rem;
      line-height: 0.9rem;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -55%);
    }

    &-block {
      bottom: 0;
      box-sizing: border-box;
      column-gap: 0.3rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      opacity: 0;
      // order: 1;
      padding: 0 0 0.5rem;
      row-gap: 0.5rem;
      transition: opacity ease-in-out 0.3s;
      white-space: normal;
      text-align: center;
      width: 100%;

      &--show {
        opacity: 1;
      }

      @media screen and (min-width: 30rem) {
        column-gap: 1rem;
        // order: 2;
        padding: 0.5rem 0 0;
      }
    }

    &--delete {
      background-color: #c00;
      color: #fff;

      &::before {
        content: '\00425';
        transform: translate(-50%, -55%) scaleX(125%);
      }
    }

    &--replace {
      background-color: #00b;
      // border-radius: 0.5rem;
      color: #fff;
      padding: 0 0.6rem;
      order: -1;
      position: relative;

      &:hover {
        cursor: pointer;
      }

      &:focus-within {
        outline: 0.2rem dotted #00b;
        // outline-offset: 0.1rem;
      }

      &::before {
        content: '\021BB';
        font-size: 2rem;
        line-height: 0.9rem;
        transform: translate(-50%, -75%);
      }
    }

    &--left {
      order: -2;

      &::before {
        content: '\021D0';
      }
    }

    &--right {
      order: 1;

      &::before {
        content: '\021D2';
      }
    }

    &--move {
      &::before {
        transform: translate(-50%, -65%) scale(125%);
      }
    }
  }

  &__placeholder {
    width: 72%;

    &__ext {
      @media screen and (min-height: 26rem) and (min-width: 26rem) {
        font-size: 1.125rem
      }

      @media screen and (min-height: 30rem) and (min-width: 30rem) {
        font-size: 1.1875rem
      }

      @media screen and (min-height: 34rem) and (min-width: 34rem) {
        font-size: 1.25rem
      }

      @media screen and (min-height: 38rem) and (min-width: 36rem) {
        font-size: 1.5rem
      }

      @media screen and (min-height: 42rem) and (min-width: 42rem) {
        font-size: 2rem
      }

      // @media screen and (min-height: 46rem) and (min-width: 44rem) {
      // }

      // @media screen and (min-height: 50rem) and (min-width: 50rem) {
      // }

      // @media screen and (min-height: 54rem) and (min-width: 54rem) {
      // }
    }

    &__name {
      @media screen and (min-height: 34rem) and (min-width: 34rem) {
        font-size: 1rem
      }
    }
  }

  &__bad-msg {
    background-color: rgba(185, 0, 0, 0.7);
    color: #fff;
    // border-radius: 1rem;
    max-width: 20rem;
    margin: 1rem 2rem 0.5rem;
    padding: 1rem 1.25rem;
    white-space: normal;
  }

  &__bad-msg {
    background-color: rgba(185, 0, 0, 0.7);
    color: #fff;
    /* border-radius: 1rem; */
    max-width: 20rem;
    margin: 1rem 2rem 0.5rem;
    padding: 1rem 1.25rem;
    white-space: normal;
  }

  &__pos {
    background-color: #009;
    border: 0.15rem solid #fff;
    border-radius: 50%;
    color: #fff;
    font-size: 0.8rem;
    height: 1.6rem;
    left: 0rem;
    line-height: 1.4rem;
    position: absolute;
    text-align: center;
    top: -0.95rem;
    width: 1.6rem;
    z-index: 1;
  }

  &__file-name {
    // background-color: rgba(255, 255, 255, 0.7);
    display: block;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.875rem;
    hyphens: auto;
    margin: -1.15rem 0 0;
    overflow-wrap: anywhere;
    padding: 0 2rem;
    text-align: center;
    word-break: break-all;
    white-space: normal;
  }
}
</style>
