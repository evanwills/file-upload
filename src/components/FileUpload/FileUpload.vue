<template>
  <div :id="id" class="file-upload" v-on:keyup="handleKeyUp($event)">
    <!-- START: Open/Close file selection UI -->
    <button
      :disable="active === true"
      :class="firstBtnClass"
      :tabindex="active ? -1 : undefined"
      type="button"
      v-on:click="toggleActive">
      <span v-if="uploadBtnIcon !== ''" class="upload-button-icon material-icons">
        {{ uploadBtnIcon }}
      </span>
      {{ uploadBtnText }}
      <span class="visually-hidden">{{ genericTypeList }} files</span>
    </button>
    <button
      :class="activeClass('bg-close')"
      :tabindex="(!active || showConfirm) ? -1 : undefined"
      :disabled="(showConfirm) ? true : undefined"
      type="button"
      v-on:click="handleClose($event)">
      <span class="visually-hidden">
        Close upload {{ genericTypeList }} files
      </span>
    </button>
    <!--  END:  Open/Close file selection UI -->

    <!-- START: file selection/capture and display UI -->
    <article v-if="showConfirm === false" :class="getDialogueClass">
      <header>
        <slot name="header">
          <h2 class="file-upload__head">{{ label }}</h2>
          <p v-if="helpTxt !== ''" class="file-upload__help">{{ helpTxt }}</p>
        </slot>
      </header>
      <main v-if="!uploadEmpty" class="file-upload__carousel__wrap">
        <button
          v-if="(uploadList.length > 1)"
          ref="previousBtn"
          class="file-upload__btn file-upload__carousel__btn file-upload__carousel__btn--previous"
          :disabled="(noloop === true && selectedKey === 0)"
          type="button"
          v-on:click="previous">
          <span class="visually-hidden">Previous</span>
        </button>
        <div class="file-upload__carousel__outer">
          <ul class="file-upload__carousel" :style="getCarouselStyle">
            <li
              v-for="(file, index) in uploadList"
              class="file-upload__carousel__item"
              :key="file.key">
              <FileUploadImage
                :accepted="accepted"
                :can-move="reorder"
                :ext="file.ext"
                :file-src="file.src"
                :file-name="file.name"
                :file-size="file.size"
                :file-type="file.type"
                :from-camera="file.fromCamera"
                :id="getImgID(file.name)"
                :is-bad-type="file.badType"
                :is-focused="selectedKey === index"
                :is-portrait="file.isPortrait"
                :is-ready="file.ready"
                :is-surplus="file.surplus"
                :is-too-big="file.tooBig"
                :key="file.key"
                :pos="index"
                :total="uploadList.length"
                :updated-key="file.key"
                v-on:delete="deleteFile"
                v-on:replace="replaceFile"
                v-on:moveleft="moveFileLeft"
                v-on:moveright="moveFileRight"
                v-on:fileOpen="fileOpenToggle($event)"
                v-on:keyup="handleKeyUp($event)" />
            </li>
          </ul>
        </div>
        <button
          v-if="(uploadList.length > 1)"
          class="file-upload__btn file-upload__carousel__btn file-upload__carousel__btn--next"
          :disabled="(noloop === true && selectedKey === max)"
          type="button"
          v-on:click="next">
          <span class="visually-hidden">Next</span>
        </button>
      </main>
      <footer>
        <p v-if="uploadList.length === 0" class="file-upload__first-label">
          <label
            :for="getID('main-input')"
            class="file-upload__label">
            {{ uploadHelp }}
            <input
              :accept="accepted"
              class="file-upload__input visually-hidden"
              :id="getID('main-input')"
              :multiple="(max > 1)"
              type="file"
              v-on:change="processSelectedFiles"
              v-on:click="fileInputClick"
              v-on:focus="assumeClosed" />
          </label>
          <WebCamera
            use
            v-on:capturing="toggleWebCamStatus($event)"
            v-on:usephoto="processCapturedPhoto" />
        </p>
        <p
          v-else-if="uploadList.length > max || badCount > 0"
          class="file-upload__bad-list-msg">
          {{ getBadListMsg }}
        </p>
        <p
          v-if="uploadList.length > 0 && full === false && badCount === 0"
          class="file-upload__add-confirm">
          <label
            v-if="goodCount < max"
            :for="getID('extra-input')"
            class="file-upload__add-btn">
            Add another file
            <input
              :accept="accepted"
              class="file-upload__input visually-hidden"
              :id="getID('extra-input')"
              :multiple="(max > 1 && (max - uploadList.length) > 1)"
              type="file"
              v-on:change="processSelectedFiles"
              v-on:click="fileInputClick"
              v-on:focus="assumeClosed" />
          </label>
          <WebCamera
            v-if="goodCount < max"
            btn-txt="Take another photo"
            use
            v-on:capturing="toggleWebCamStatus($event)"
            v-on:usephoto="processCapturedPhoto" />
          <button
            v-if="canConfirm === true"
            class="file-upload__btn file-upload__confirm--btn"
            type="button"
            v-on:click="handleConfirm">
            {{ getConfirmUploadBtnTxt }}
          </button>
        </p>
      </footer>
      <button
        class="file-upload__main-close"
        v-on:click="handleClose"
        :tabindex="active ? undefined : -1"
        type="button">
        <span class="visually-hidden">
          Close upload {{ genericTypeList }} files
        </span>
      </button>
    </article>
    <!--  END: file selection/capture and display UI -->

    <!-- START: Send/Cancel confirmation UI -->
    <article v-if="showConfirm === true && confirmText !== ''" :class="getDialogueClass">
      <header>
        <h2 class="file-upload__head">{{ label }}</h2>
      </header>
      <p class="file-upload__confirm-txt">{{ confirmText }}</p>
      <footer>
        <p class="file-upload__confirm-btns">
          <button
            v-if="confirmUpload === true"
            ref="continueBtn"
            class="file-upload__btn file-upload__confirm-btn__confirm"
            type="button"
            v-on:click="handleConfirmInner">
            {{ confirmBtnTxt }}
          </button>
          <button
            v-else
            class="file-upload__btn file-upload__confirm-btn__confirm"
            ref="continueBtn"
            type="button"
            v-on:click="toggleActive">
            {{ cancelBtnTxt }}
          </button>
          <button
            class="file-upload__btn file-upload__confirm-btn--cancel"
            type="button"
            v-on:click="handleUnconfirm">Cancel</button>
        </p>
      </footer>
    </article>
    <!-- START: Send/Cancel confirmation UI -->
  </div>
</template>

<script setup>
import imageReducer from 'image-blob-reduce';
// import imageBlobReduce, { ImageBlobReduce } from 'image-blob-reduce';
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  ref,
} from 'vue';
import {
  defaultTypes,
  getAllowedTypes,
  getFieldID,
  getFileExt,
  // imgIsPortrait,
  isBadType,
  moveFile,
  humanImplode,
  humanFileSizeToBytes,
} from './FileUpload.utils';
import { getEpre } from '../../../utils/general-utils';
import FileUploadImage from './FileUploadImage.vue';
import WebCamera from './WebCamera.vue';

// --------------------------------------------------
// START: Emitted events

const emit = defineEmits(['confirmupload', 'fileuploadclosed']);

const instance = getCurrentInstance();

//  END:  Emitted events
// --------------------------------------------------
// START: Properties/attributes

const props = defineProps({
  /**
   * Whether or not to automatically exclude any files that cannot
   * be included in file upload.
   *
   * By default user must deliberately remove any files that
   * cannot be uploaded.
   *
   * @property {boolean} autoExclude
   */
  autoExclude: { type: Boolean, required: false, default: false },

  /**
   * Text for the button shown to the user asking them to confirm
   * they want to abandon the upload, (after they have clicked the
   * close dialogue button)
   */
  cancelBtnTxt: { type: String, required: false, default: 'Discard upload' },

  /**
   * Text to show user when asking them to confirm they want to
   * abandon the upload
   *
   * @property {string} cancelConfirmText
   */
  cancelConfirmText: { type: String, required: false, default: '' },

  /**
   * Text for the button shown to the user asking them to confirm
   * they want to upload their selected files.
   * (after they have clicked the confirm and upload dialogue button)
   *
   * @property {string} confirmBtnTxt
   */
  confirmBtnTxt: { type: String, required: false, default: 'Send files' },

  /**
   * Whether or not the user must confirm they are sure they want to
   * cancel the file upload
   *
   * @property {boolean} confirmCancel
   */
  confirmCancel: { type: Boolean, required: false, default: false },

  /**
   * Whether or not the user must confirm that they have selected all
   * the files they wish to upload and are ready to upload them.
   *
   * @property {boolean} confirmComplete
   */
  confirmComplete: { type: Boolean, required: false, default: false },

  /**
   * Text to show user to help them choose appropritate files to
   * upload
   *
   * @property {string} helpTxt
   */
  helpTxt: { type: String, required: false, default: '' },

  /**
   * ID of this component. Used to add unique IDs to all fields
   * and buttons within the component
   *
   * > __Note:__ This ID will be prepended to button, input field
   * >       IDs to make sure those elements can be reused
   * >       else where in the code without duplication.
   *
   * @property {string} id
   */
  id: { type: String, required: true },

  /**
   * Label to (briefly) describe the purpose of the upload
   *
   * @property {string} label
   */
  label: { type: String, required: true },

  /**
   * Maximum number of files the user can upload at one time
   *
   * * If `maxFiles` is set to zero (0) maximum is unlimited
   *   (actual limit will be set to: 999).
   * * If `maxFiles` is negative or cannot be parsed as an integer,
   *   the default (1) will be used
   *
   * > __Note:__ __`unlimited` overrides `max-files`.__
   * >
   * > If you want to allow users to upload more than 999 files in
   * one go, do __*NOT*__ use unlimited.
   *
   * @property {number} maxFiles
   */
  maxFiles: { type: String, required: false, default: '1' },

  /**
   * Maximum number of pixels an image can be in any dimension
   *
   * @property {number} maxPixels
   */
  maxPixels: { type: String, required: false, default: '1500' },

  /**
   * Maximum size a single file can be
   *
   * > __Note:__ If no unit is specified, Bytes are assumed
   *
   * @property {string} maxSingle
   */
  maxSingle: { type: String, required: false, default: '5MB' },

  /**
   * Maximum total upload size for all files combined
   *
   * > __Note:__ If no unit is specified, Bytes are assumed
   *
   * @property {string} maxTotal
   */
  maxTotal: { type: String, required: false, default: '15MB' },

  /**
   * Minimum number of files the user must upload
   *
   * @property {number} minFiles
   */
  minFiles: { type: String, required: false, default: '1' },

  /**
   * Whether or not to loop the carousel around if the user tries
   * to focus beyond the limit of the carousel
   *
   * e.g. Prevent moving the focus right of the last item,
   *    or left of the first item
   *
   * The default behaviour of the carousel is to loop back to the
   * begining when moving the focus item to after the last item,
   * or loop to the end when moving.
   *
   * @property {boolean} reorder
   */
  noloop: { type: Boolean, required: false, default: false },

  /**
   * Whether or not the user can reorder files/images within the
   * list
   *
   * By default the selected order is the order the files get
   * sent to the server. If reorder is true, then the user can
   * change the order before the files are uploaded.
   *
   * @property {boolean} reorder
   */
  reorder: { type: Boolean, required: false, default: false },

  /**
   * List of file extensions matching file types the server will
   * accept
   *
   * @property {string}
   */
  types: {
    type: String,
    required: false,
    default: 'png jpg webp pdf docx doc',
  },

  /**
   * Whether or not the user can upload an unlimited number
   * *(999)* of files.
   *
   * > __Note:__ __`unlimited` overrides `max-files`.__
   * >
   * > If you want to allow users to upload more than 999 files in
   * one go, do __*NOT*__ use unlimited.
   *
   * @property {boolean} unlimited
   */
  unlimited: { type: Boolean, required: false, default: false },

  /**
   * The text for the button the user first sees and uses to open
   * the full upload dialogue/widget
   *
   * @property {string} uploadBtnText
   */
  uploadBtnClass: { type: String, required: false, default: '' },

  /**
   * The text for the button the user first sees and uses to open
   * the full upload dialogue/widget
   *
   * @property {string} uploadBtnText
   */
  uploadBtnIcon: { type: String, required: false, default: '' },

  /**
   * The text for the button the user first sees and uses to open
   * the full upload dialogue/widget
   *
   * @property {string} uploadBtnText
   */
  uploadBtnText: { type: String, required: false, default: 'Upload' },

  /**
   * Text to show the user when asking to confirm they want to
   * upload the selected files
   *
   * Normally this would be a paragraphs explaining thanking them
   * for uploading the files and explaining what will be done with
   * the files once received.
   *
   * @property {string} uploadConfirmText
   */
  uploadConfirmText: { type: String, required: false, default: '' },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

/**
 * List of accepted mime types of files user is allowed to upload
 */
const accepted = ref('');

/**
 * Whether or not the main file upload UI is active
 */
const active = ref(false);

/**
 * List of file MIME types user can upload
 */
const allowedTypes = ref(defaultTypes);

/**
 * Number of invalid files user has selected
 * (they may be wrong type or too large)
 */
const badCount = ref(0);

/**
 * Whether or not the user can confirm their selection of files
 * and send them to the server
 *
 * > __Note:__ Only TRUE if there are no bad files, and total
 * >           upload size is within maximum upload limit.
 * >           OR
 * >           `auto-exclue` attribute is present
 */
const canConfirm = ref(false);

/**
 * Number of pixels wide the window is
 */
// const carouselOffset = ref(0);

/**
 * Text to render when user is asked to either confirm or cancel
 * upload
 */
const confirmText = ref('');

/**
 * Whether or not the confirmation screen is for confirming upload
 * or confirming abandonment of upload
 */
const confirmUpload = ref(true);

const continueBtn = ref(null);

/**
 * Whether or not whether or not to set the focus on "Previous"
 * button when the carousel opens
 */
const doAutofocus = ref(true);

const ePre = ref(null);

/**
 * Whether or not the user has already selected the maximum number
 * of (valid) files they can
 */
const full = ref(false);

/**
 * List of generic file types to show in hidden button text
 */
const genericTypeList = ref('');

/**
 * Number of valid files user has selected
 * (files that are small enough and of the right type)
 */
const goodCount = ref(0);

/**
 * List of human readable file types to show user
 */
const humanTypeList = ref('');

/**
 * Object used to reduce image file sizes
 */
// const imgReduce = ref(null);

/**
 * Maximum number of files user may upload
 */
const max = ref(1);

/**
 * Maximum number of pixels (in either X or Y dimension) an image
 * should be after processing
 */
const maxPx = ref(1500);

/**
 * Minimum number of files user may upload
 */
const min = ref(1);

/**
 * Unique ID for files (is incremented each time a file is selected)
 */
const nextUID = ref(0);

const noResize = ref(false);

const previousBtn = ref(null);

/**
 * How many images are currently being processed
 */
// const processingCount = ref(0);

/**
 * The object representing the file currently in prime position
 * in the carousel
 */
const selected = ref(null);

/**
 * The index of the file currently in prime position in the
 * carousel array.
 */
const selectedKey = ref(-1);

/**
 * Whether or not files are being selected
 */
const selectingFiles = ref(false);

/**
 * Whether or not to render the confirmation screen
 */
const singleMax = ref(5242880);

/**
 * Whether or not to render the confirmation screen
 */
const showConfirm = ref(false);

/**
 * Whether the total number of bytes is greater than the allowed maximum
 */
const tooBig = ref(false);

/**
 * Maximum number of bytes the combined size of all selected
 * file can be
 */
const totalMax = ref(15728640);

/**
 * Generated help text to guide users in how many and which types
 * of files can be uploaded
 */
const uploadHelp = ref('');

/**
 * List of files user has selected to upload
 */
const uploadList = ref([]);

/**
 * Whether or not the user can confirm their selection of files
 * and send them to the server
 *
 * > __Note:__ Only TRUE if there are no bad files, and total
 * >           upload size is within maximum upload limit.
 * >           OR
 * >           `auto-exclue` attribute is present
 */
const webCamOpen = ref(false);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

const firstBtnClass = computed(() => { // eslint-disable-line arrow-body-style
  return (props.uploadBtnClass !== '')
    ? props.uploadBtnClass
    : 'file-upload__btn file-upload__open';
});

/**
 * Get inline carousel styles
 *
 * @returns {string} Inline CSS for styling carousel
 */
const getCarouselStyle = computed(() => `--carousel-items: ${uploadList.value.length}; `
    + `--carousel-pos: ${selectedKey.value};`);

/**
 * Get message to report on bad files if there are issues with
 * one or more files.
 *
 * @returns {string} Message if there are issues. Empty string otherwise.
 */
const getBadListMsg = computed(() => {
  const excess = goodCount.value - max.value;

  let output = '';
  let also = 'You';

  if (tooBig.value === true) {
    output = 'The total upload size for your selected files is '
      + `greater than ${props.maxTotal}. You will need to remove `
      + `one or more files to get under the ${props.maxTotal} `
      + 'upload limit.';
  } else {
    if (badCount.value > 0) {
      if (badCount.value === 1) {
        output = 'You have one invalid file (marked with a red '
          + 'notice block). You must remove or replace it before '
          + 'you can upload your files.';
      } else {
        output = `You have ${badCount.value} invalid files (each `
          + 'marked with a red notice blocks). You must remove or '
          + 'replace all of them before you can upload your files.';
      }
      also = ' You also';
    }

    if (excess > 0) {
      if (excess === 1) {
        output += `${also} have one too many files selected (the `
          + 'excess file is marked with a red notice block) You '
          + 'must remove it before you can upload your files.';
      } else {
        output = `You have ${excess} too many files (each marked `
          + 'with a red notice blocks). You must remove them before '
          + 'you can upload your files.';
      }
    }
  }
  return output;
});

/**
 * Text in button used to confirm the user is happy with their
 * selected files and is ready to send them to the server.
 *
 * @returns {string} Button text for confirming upload is ready
 */
const getConfirmUploadBtnTxt = computed(() => { // eslint-disable-line arrow-body-style
  return (props.uploadConfirmText !== '')
    ? 'Confirm and upload'
    : 'Upload';
});

const uploadEmpty = computed(() => (uploadList.value.length === 0));

const getHeadClass = computed(() => {
  const tmp = 'file-upload__head';
  let output = tmp;

  if (!uploadEmpty.value) {
    output += ` ${tmp}--type`;
  }

  return output;
});

/**
 * Get a class name (or names) for styling the main upload
 * dialogue/modal
 *
 * @returns {string} dialogue/modal classes
 */
const getDialogueClass = computed(() => {
  const clsName = 'file-upload__dialogue';
  let output = clsName;

  if (active.value === true) {
    output += ` ${clsName}--active`;
  }

  if (showConfirm.value === true) {
    output += ` ${clsName}--confirm`;
  } else {
    output += ` ${clsName}--`;
    output += (uploadList.value.length === 0)
      ? 'none'
      : 'some';
  }

  return output;
});

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

/**
 * Get list of classes to use on an element
 *
 * @param {string} cls1 primary class for the element
 * @param {string?} cls2 secondary class used for the element
 *
 * @returns {string} space separated list of class names
 */
const activeClass = (cls1, cls2) => {
  const output = [`file-upload__${cls1}`];

  if (typeof cls2 === 'string') {
    output.push(`file-upload__${cls2}`);
  }

  if (active.value === true) {
    for (let a = 0; a < output.length; a += 1) {
      output[a] = `${output[a]} ${output[a]}--active`;
    }
  }

  return output.join(' ');
};

/**
 * Add a new file to the list or replace an existing file in
 * the list of files the user has selected for uploading.
 *
 * @param {fileData} data matadata about the file to be uploaded
 */
const addFileToList = (data) => {
  let done = false;
  for (let a = 0; a < uploadList.value.length; a += 1) {
    if (uploadList.value[a].name === data.name) {
      uploadList.value[a] = data;
      done = true;
    }
  }

  if (done === false) {
    uploadList.value.push(data);
  }
};

/**
 * Get a callback function to pass to setTimeout()
 *
 * @param {ref<boolean>} _selectingFiles
 *
 * @returns {Function}
 */
const fixEscapeRace = (_selectingFiles) => () => {
  _selectingFiles.value = false; // eslint-disable-line no-param-reassign
};

/**
 * Handle the user closing the file selection dialogue and
 * prevent "Esc" key press from closing the whole upload modal UI
 *
 * This is a hack to get around a race condition where, if the
 * file upload dialogue is open and user clicks the "Esc" key,
 * the FileUpload keyboard handling fires causing the whole
 * FileUpload modal to close.
 *
 * By adding a half second delay, to setting selectingFiles to
 * FALSE, the file upload dialogue can close while the main
 * FileUpload modal stays open.
 *
 */
const assumeClosed = () => {
  if (selectingFiles.value === true) {
    setTimeout(fixEscapeRace(selectingFiles), 500);
  }
};

const doForceUpdate = () => {
  if (typeof instance !== 'undefined'
    && typeof instance.proxy !== 'undefined'
  ) {
    instance.proxy.$forceUpdate();
  }
};

/**
 * Go through the list of selected files and check if there are
 * any issues posed by the group of files as a whole.
 */
const checkForIssues = (forceUpdate = false) => {
  /**
   * `old` stores the current state before it gets updated.
   * This can then be used to compare state after update.
   * If nothing important has been updated, there will be no
   * forced rerender. If anything has changed the component
   * will be forced to update.
   *
   * @var old
   */
  const old = {
    good: goodCount.value,
    bad: badCount.value,
    full: full.value,
    tooBig: tooBig.value,
    pos: selectedKey.value,
  };

  let bad = 0;
  let good = 0;
  let totalBytes = 0;
  let newPos = -1;

  for (let a = 0; a < uploadList.value.length; a += 1) {
    if (uploadList.value[a].badType === false
      && uploadList.value[a].tooBig === false
    ) {
      const oldSurp = uploadList.value[a].surplus;
      good += 1;
      uploadList.value[a].surplus = (good > max.value);
      uploadList.value[a].reload = (oldSurp !== uploadList.value[a].surplus);
      totalBytes += uploadList.value[a].size;
    } else {
      bad += 1;
      if (newPos === -1) {
        newPos = 0;
      }
    }
  }

  goodCount.value = good;
  badCount.value = bad;
  full.value = (good > max.value);
  tooBig.value = (totalBytes > totalMax.value);

  if (full.value === true && newPos === -1) {
    newPos = max.value;
  }

  if (newPos > -1) {
    selectedKey.value = newPos;
  }

  canConfirm.value = (
    (goodCount.value > 0 && tooBig.value === false)
    && (
      (badCount.value === 0 && full.value === false)
      || props.autoExclude === true
    )
  );

  if (forceUpdate === true
    || old.good !== goodCount.value
    || old.bad !== badCount.value
    || old.tooBig !== tooBig.value
    || old.full !== full.value
    || old.pos !== selectedKey.value
  ) {
    doForceUpdate();
  }
};

// /**
//  * Remove all selected files from the upload list
//  */
// const clearAll = () => {
//   uploadList.value = []
// };

/**
 * Handle when the focus item in the carousel changes
 *
 * @param {number} newKey Key for newly focused item
 *
 * @returns {boolean}
 */
const updateSelected = (newKey) => {
  const _max = (uploadList.value.length - 1);
  const oldKey = selectedKey.value;

  let _newKey = newKey;

  if (_newKey < 0) {
    _newKey = (props.noloop === false)
      ? _max
      : 0;
  } else if (_newKey > _max) {
    _newKey = (props.noloop === false)
      ? 0
      : _max;
  }

  if (oldKey !== _newKey) {
    if (typeof uploadList.value[oldKey] !== 'undefined') {
      uploadList.value[oldKey].selected = false;
    }

    uploadList.value[_newKey].selected = true;

    selected.value = uploadList.value[_newKey];
    selectedKey.value = _newKey;
    // doForceUpdate();

    return true;
  }

  return false;
};

/**
 * Move the focus file postion back one
 */
const decrement = () => {
  updateSelected(selectedKey.value - 1);
};

/**
 * Delete selected file from the list of files user has selected
 * (and remove it from the file carousel).
 *
 * @param {string} fileName Name of file to be removed from the list.
 */
const deleteFile = (fileName) => {
  uploadList.value = uploadList.value.filter((file) => file.name !== fileName);

  selectingFiles.value = false;
  checkForIssues(true);

  if (selectedKey.value >= uploadList.value.length) {
    selectedKey.value = uploadList.value.length - 1;
  }
};

/**
 * Handle the user opening the file input dialogue
 *
 * @param {Event} event
 */
const fileInputClick = () => {
  selectingFiles.value = true;
};

/**
 * Handle when replace file input triggers file select dialogue
 * to open or close
 *
 * @param {boolean} event
 */
const fileOpenToggle = (event) => {
  if (event === true) {
    selectingFiles.value = true;
  } else if (selectingFiles.value === true) {
    setTimeout(fixEscapeRace(selectingFiles), 500);
  }
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

/**
 * Get a unique ID to use for a `<FileUploadImage>` component
 *
 * @param {string} fileName name of the file being rendered in the
 *                 component
 *
 * @returns {string} a string to use as an FileUploadImage ID
 */
const getImgID = (fileName) => {
  const suffix = fileName.replace(/[^a-z0-9_-]/ig, '-');
  return `${props.id}__${suffix}`;
};

/**
 * Get component specific unique ID for the file.
 *
 * (This may change over time if the file reordered)
 *
 * @returns {number} next unique id in list of IDs for this
 *                   component
 */
const getUID = () => {
  const output = nextUID.value;
  nextUID.value += 1;

  return output;
};

/**
 * Toggle the upload user interface open or closed.
 *
 * If closing the upload user interface, all selected files will
 * be removed from the upload list. Next time the user wants to
 * upload, they will have to start form scratch.
 */
const toggleActive = () => {
  active.value = !active.value;
  showConfirm.value = false;
  confirmText.value = '';

  if (active.value === false) {
    doAutofocus.value = true;
    uploadList.value = [];
  }
};

/**
 * Handle when user tries to close the upload dialogue interface
 *
 * * If no good files have been selected, or
 *   `cancel-confirm-text` is not set (or is empty), just close
 *   the dialogue.
 * * If one or more good files have been selected and
 *   `cancel-confirm-text` is set (and is not empty), show
 *   another dialogue asking the user to really confirm the want
 *   to give up.
 */
const handleCloseInner = () => {
  if (goodCount.value === 0 || props.cancelConfirmText === '') {
    toggleActive();
  } else {
    confirmText.value = props.cancelConfirmText;
    confirmUpload.value = false;
    showConfirm.value = true;

    // doForceUpdate();

    nextTick(() => {
      if (typeof continueBtn.value !== 'undefined' && continueBtn.value !== null) {
        continueBtn.value.focus();
      }
    });
  }
};

/**
 * Handle when user tries to close the upload dialogue interface
 *
 * Check if the button is disabled. If not, do what's needed to
 * close the dialogue
 *
 * @param {Event} event Click event
 */
const handleClose = (event) => {
  const btn = event.target;

  if (btn.disabled === false) {
    handleCloseInner();
  }
};

/**
 * Do all the stuff requred to prepare files for upload, then
 * send an event to let the client code know the upload is ready
 * to be processed.
 *
 * 1. Gather all the valid `File` objects into an array
 * 2. Dump all the (now) redundant data for each file
 * 3. Close the modal
 * 4. Send a "confirmupload" event to the parent component along
 *    with the list of `File` objects to be uploaded
 */
const handleConfirmInner = () => {
  // get list of File objects
  const files = uploadList.value
    .filter((data) => (data.file !== null && !data.badType && !tooBig.value && !data.surplus))
    .map((data) => data.file);

  // Clear all other file data
  uploadList.value = [];

  // Close modal
  active.value = false;
  showConfirm.value = false;

  // Send an event to the client
  emit('confirmupload', files);
};

/**
 * Handle when user clicks "Confirm and upload"
 *
 * * If there is no `upload-confirm-text`, just close the
 *   dialogue and do all the work required to send the files
 *   (see `handleConfirmInner()` for more info)
 * * If `upload-confirm-text` is set (and not empty), show
 *   another dialogue with confirmation information and a final
 *   conform button plus a cancel button to go back to the
 *   carousel interface.
 */
const handleConfirm = () => {
  if (props.uploadConfirmText === '') {
    handleConfirmInner();
  } else {
    confirmText.value = props.uploadConfirmText;
    confirmUpload.value = true;
    showConfirm.value = true;
  }
};

/**
 * Handle user clicking the cancel button in the final
 * confirmation screen
 */
const handleUnconfirm = () => {
  confirmText.value = '';
  showConfirm.value = false;
};

/**
 * Move the focus file postion along one
 */
const increment = () => {
  updateSelected(selectedKey.value + 1);
};

/**
 * Handle user keyboard interactions
 *
 * @param {KeyboardEvent} event
 */
const handleKeyUp = (event) => {
  if (active.value === true && webCamOpen.value === false) {
    // Only process keyboard events while active.

    const _max = (uploadList.value.length - 1);
    const oldKey = selectedKey.value;
    let newKey = oldKey;

    if (showConfirm.value === false) {
      // Process keyboard events
      switch (event.key) { // eslint-disable-line default-case
        case 'ArrowRight':
        case 'ArrowDown':
          increment();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          decrement();
          break;

        case 'PageUp':
          if (oldKey === 0) {
            newKey = _max;
          } else if (oldKey > 10) {
            newKey = oldKey - 10;
          } else {
            newKey = 0;
          }
          updateSelected(newKey);
          break;

        case 'PageDown':
          if (oldKey === _max) {
            newKey = 0;
          } else if (oldKey < (_max - 10)) {
            newKey = oldKey + 10;
          } else {
            newKey = _max;
          }
          updateSelected(newKey);
          break;

        case 'Home':
          updateSelected(0);
          break;

        case 'End':
          updateSelected(_max);
          break;

        case 'Escape':
          if (selectingFiles.value === false) {
            handleCloseInner();
          }
          break;
      }
    } else if (event.key === 'Escape' && selectingFiles.value === false) {
      // Where in the confirmation UI. We need to do things a bit
      // differently.
      // They've pressed the Escape key. Cancel the confirmation
      // UI so they can go back to what they were doing before.
      showConfirm.value = false;
      confirmText.value = '';
    }
  }
};

/**
 * Check whether or not a file is an image (based on it's
 * declared mime type)
 *
 * @param {string} type MIME type of a file
 *
 * @returns {boolean}
 */
const isImage = (type) => {
  for (let a = 0; a < allowedTypes.value.length; a += 1) {
    if (allowedTypes.value[a].mime === type
      && allowedTypes.value[a].type === 'image'
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Change the order of the files in the list so that the
 * selected file is moved to the left of where it was.
 *
 * This will change its position in the file carousel
 *
 * @param {string} fileName name of file passed from FileUploadImage
 */
const moveFileLeft = (fileName) => {
  uploadList.value = moveFile(uploadList.value, fileName, -1);

  decrement();
  checkForIssues(true);

  nextTick(() => {
    if (typeof continueBtn.value !== 'undefined' && continueBtn.value !== null) {
      continueBtn.value.focus();
    }
  });
};

/**
 * Change the order of the files in the list so that the
 * selected file is moved to the right of where it was.
 *
 * This will change its position in the file carousel
 *
 * @param {string} fileName name of file passed from FileUploadImage
 */
const moveFileRight = (fileName) => {
  uploadList.value = moveFile(uploadList.value, fileName, 1);
  increment();
  checkForIssues();
};

/**
 * Move the focus image in the carousel one step to the right
 */
const next = () => {
  increment();
};

/**
 * Move the focus image in the carousel one step to the left
 */
const previous = () => {
  decrement();
};

const finaliseFileProcessing = (data, file, newKey, now, force = false) => {
  data.file = file; // eslint-disable-line no-param-reassign
  data.key = newKey; // eslint-disable-line no-param-reassign
  data.ready = true; // eslint-disable-line no-param-reassign
  data.updated = now; // eslint-disable-line no-param-reassign

  addFileToList(data);
  checkForIssues(true);

  if (force === true) {
    doForceUpdate();
  }
};

/**
 * Process a single file selected by the user
 *
 * First check if it's bad, then (if it's good), check if its
 * an image. If it's an image, make sure it's not too big by
 * resizing it. Finally, add it to the list of files to show
 * the user.
 *
 * @param {fileData} data All the needed metadata about a file
 *                   (possibly including an old version of the
 *                   file itself)
 * @param {File}     file File to be processed then added to
 *                   the metadata
 */
const processFileInner = async (data, file) => {
  const tmp = Date.now();
  const now = (data.updated !== tmp)
    ? tmp
    : tmp + 1;
  const newKey = `${data.name}-${now}`;

  if (data.badType === false) {
    if (isImage(data.type)) { // imageReducer
      if (noResize.value === false) {
        const _imgReduce = new imageReducer(); // eslint-disable-line new-cap
        // const imgReduce = new imageBlobReduce();

        _imgReduce.toBlob(file, { max: 1500 })
          .then(async (blob) => {
            // Convert image blob to file object
            const newFile = new File(
              // Blob must be wrapped within array for file object
              // constructor
              [blob],
              file.name,
              {
                type: blob.type,
                lastModified: Date.now(),
              },
            );

            data.ext = getFileExt(newFile); // eslint-disable-line no-param-reassign
            // data.file = newFile; // eslint-disable-line no-param-reassign
            data.isPortrait = true; // eslint-disable-line no-param-reassign
            // data.key = newKey; // eslint-disable-line no-param-reassign
            // data.ready = true; // eslint-disable-line no-param-reassign
            data.size = newFile.size; // eslint-disable-line no-param-reassign
            data.src = URL.createObjectURL(newFile); // eslint-disable-line no-param-reassign
            data.tooBig = newFile.size > singleMax.value; // eslint-disable-line no-param-reassign
            // data.updated = now; // eslint-disable-line no-param-reassign

            finaliseFileProcessing(data, newFile, newKey, now, true);
            // addFileToList(data);
            // checkForIssues(true);
            // doForceUpdate();
          })
          .catch((error) => {
            if (error.toString().includes('Pica: cannot use getImageData on canvas')) {
              // Bummer!!
              // Browser is blocking our ability to resize images
              // using the canvas API

              // Make sure we don't waste time trying to resize
              // other images.
              noResize.value = true;

              // Get a data URL for the uploaded images.
              data.src = URL.createObjectURL(file); // eslint-disable-line no-param-reassign

              // Just put what we've got into the carousel and the
              // upload list
              finaliseFileProcessing(data, file, newKey, now, true);
            }
          });
      } else {
        // We already know that resizing is not possible.
        // We'll just put what we've got into the carousel
        finaliseFileProcessing(data, file, newKey, now, true);
      }
    } else {
      // data.file = file; // eslint-disable-line no-param-reassign
      // data.key = newKey; // eslint-disable-line no-param-reassign
      // data.ready = true; // eslint-disable-line no-param-reassign
      // data.updated = now; // eslint-disable-line no-param-reassign
      // addFileToList(data);
      // checkForIssues(true);

      finaliseFileProcessing(data, file, newKey, now, false);
    }
  } else {
    checkForIssues(true);
  }
};

/**
 * Process a single new file the user has selected
 *
 * @param {File}    file       New file to be added to the list of
 *                             files the user has selected
 * @param {boolean} fromCamera whether or not the file's source is
 *                             the local file system or the device's
 *                             camera
 */
const processNewFile = (file, fromCamera = false) => {
  // let ext = '';
  // try {
  //   ext = getFileExt(file);
  // } catch
  const now = Date.now();

  const tmp = {
    badType: isBadType(file.type, allowedTypes.value),
    ext: getFileExt(file),
    file: null,
    fromCamera,
    id: getUID(),
    isPortrait: false,
    lastModified: file.lastModified,
    key: `${file.name}-${now}`,
    name: file.name,
    originalSize: file.size,
    ready: false,
    reload: false,
    selected: false,
    size: file.size,
    src: '',
    surplus: false,
    tooBig: file.size > singleMax.value,
    type: file.type,
    updated: now,
  };

  addFileToList(tmp);
  selectedKey.value = (uploadList.value.length - 1);

  processFileInner(tmp, file);
};

/**
 * Process all files user has selected using a file input field
 *
 * @param {Event} e File input change event
 */
const processSelectedFiles = (e) => {
  const { files } = e.target;

  selectingFiles.value = false;

  // Put the focus at the start of the latest additional files
  const newIndex = (uploadList.value.length > 0)
    ? uploadList.value.length
    : 0;

  if (files !== null) {
    for (let a = 0; a < (files).length; a += 1) {
      processNewFile(files[a]);
    }

    // Make sure the focus is in the right place
    selectedKey.value = newIndex;
  }

  if (doAutofocus.value === true) {
    // const previousID = getID('previous');
    nextTick(() => {
      doAutofocus.value = false;
      if (typeof previousBtn.value !== 'undefined' && previousBtn.value !== null) {
        previousBtn.value.focus();
      }
    });
  }
};

const processCapturedPhoto = (file) => {
  // Put the focus at the start of the latest additional files
  const newIndex = (uploadList.value.length > 0)
    ? uploadList.value.length
    : 0;

  webCamOpen.value = false;

  processNewFile(file, true);

  // Make sure the focus is in the right place
  selectedKey.value = newIndex;

  if (doAutofocus.value === true) {
    // const previousID = getID('previous');
    nextTick(() => {
      doAutofocus.value = false;
      if (typeof previousBtn.value !== 'undefined' && previousBtn.value !== null) {
        previousBtn.value.focus();
      }
    });
  }
};

/**
 * Handle the web cam being activated and deactivated.
 *
 * @param {boolean} open
 */
const toggleWebCamStatus = (open) => {
  webCamOpen.value = open;
};

/**
 * Find an old file in the list of selected files and replace it
 * with the new one the user has selected.
 *
 * @param oldName Name of the file the new file will replace
 * @param newFile New file to replace old one.
 */
const replaceFile = ({ oldName, newFile }) => {
  let ok = false;

  for (let a = 0; a < uploadList.value.length; a += 1) {
    if (uploadList.value[a].name === oldName) {
      ok = true;

      uploadList.value[a].badType = isBadType(newFile.type, allowedTypes.value);
      uploadList.value[a].ext = getFileExt(newFile);
      uploadList.value[a].file = null;
      uploadList.value[a].lastModified = newFile.lastModified;
      uploadList.value[a].name = newFile.name;
      uploadList.value[a].ready = false;
      uploadList.value[a].size = newFile.size;
      uploadList.value[a].originalSize = newFile.size;
      uploadList.value[a].src = '';
      uploadList.value[a].tooBig = newFile.size > singleMax.value;
      uploadList.value[a].type = newFile.type;

      processFileInner(uploadList.value[a], newFile);
      break;
    }
  }

  if (ok === false) {
    throw new Error(`Could not find file ("${oldName}") to replace with "${newFile.name}"`);
  }
};

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() => {
  allowedTypes.value = getAllowedTypes(props.types);
  const genericTypes = [];
  const typeList = [];
  let helpMsg = '';
  let s = '.';
  let sep = '';
  accepted.value = '';
  ePre.value = getEpre('FileUpload', props.id);
  const tmp = ePre.value('onBeforeMount');

  for (let a = 0; a < allowedTypes.value.length; a += 1) {
    if (genericTypes.indexOf(allowedTypes.value[a].type) === -1) {
      genericTypes.push(allowedTypes.value[a].type);
    }

    typeList.push(allowedTypes.value[a].name);
    accepted.value += sep + allowedTypes.value[a].mime;
    sep = ', ';
  }

  maxPx.value = parseInt(props.maxPixels, 10);
  singleMax.value = humanFileSizeToBytes(props.maxSingle);
  totalMax.value = humanFileSizeToBytes(props.maxTotal);
  humanTypeList.value = humanImplode(typeList);
  genericTypeList.value = humanImplode(genericTypes);

  // --------------------------------------------------------------
  // START: Prepare file input label text
  min.value = parseInt(props.minFiles, 10);
  if (props.unlimited === true) {
    max.value = 999;
  } else {
    max.value = parseInt(props.maxFiles, 10);

    if (max.value < 1) {
      if (max.value === 0) {
        // User has set max to unlimited
        // Make max a rediculously high number so it's effectively
        // unlimited
        max.value = 999;
      } else {
        max.value = 1;

        // eslint-disable-next-line no-console
        console.error(`${tmp} invalid maxFiles set`);
      }
    }
  }

  if (min.value < 0) {
    min.value = 0;

    // eslint-disable-next-line no-console
    console.error(`${tmp} invalid minFiles set`);
  } else if (min.value > max.value) {
    // eslint-disable-next-line no-console
    console.error(`${tmp} invalid minFiles set (minFiles cannot be greater than maxFiles)`);
    min.value = max.value;
  }

  if (max.value > 100 && max.value !== 999) {
    // eslint-disable-next-line no-console
    console.warn(`${tmp} unwise value for maxFiles set`);
  }

  helpMsg = 'Choose ';

  if (max.value > 1) {
    helpMsg += (min.value > 1)
      ? `at least ${min.value} and no more than ${max.value}`
      : `up to ${max.value}`;
    s = 's.';
  } else {
    helpMsg += 'one';
  }

  // helpMsg += ` ${humanTypeList.value}`;
  helpMsg += ` file${s}`;
  uploadHelp.value = helpMsg;

  //  END:  Prepare file input label text
  // --------------------------------------------------------------
});

//  END:  Lifecycle methods
// --------------------------------------------------
</script>

<style lang="scss" src="./FileUpload.scss"></style>
