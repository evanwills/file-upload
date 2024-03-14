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
        class="file-upload__btn file-upload-img__btn
              file-upload-img__btn--move
              file-upload-img__btn--left"
        ref="moveLeftBtn"
        :tabindex="(isFocused === false) ? -1 : undefined"
        type="button"
        v-on:click="moveLeftClick">
        <span class="material-icons">arrow_back</span>
        <span class="visually-hidden">Move left</span>
      </button>
      <button
        v-if="canMove === true && isBad === false && pos < (total - 1)"
        class="file-upload__btn file-upload-img__btn
              file-upload-img__btn--move
              file-upload-img__btn--right"
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
  // onBeforeMount,
  // onMounted,
  // onUpdated,
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

// onBeforeMount(() => {
// });

// onUpdated(() => {
// });

//  END:  Lifecycle methods
// --------------------------------------------------
</script>

<style lang="scss" src="./FileUploadImage.scss"></style>
