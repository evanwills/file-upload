<template>
  <div :id="id" class="file-upload" v-on:keyup="handleKeyUp($event)">
    <button
      v-on:click="toggleActive"
      :tabindex="active ? -1 : undefined"
      :disable="sending || active"
      accesskey="u"
      class="file-upload__open">
      {{ uploadBtnText }}
      <span class="visually-hidden">{{ genericTypeList }} files</span>
    </button>
    <button
      :class="activeClass('bg-close')"
      :tabindex="(!active || showConfirm) ? -1 : undefined"
      :disabled="(sending || showConfirm) ? true : undefined"
      v-on:click="handleClose($event)" >
      <span class="visually-hidden">
        Close upload {{ genericTypeList }} files
      </span>
    </button>

    <article v-if="showConfirm === false && sending === false" :class="getDialogueClass">
      <header>
        <slot v-if="isEmpty" name="header-empty">
          <h2 class="file-upload__head">{{ label }}</h2>
          <p v-if="helpTxt !== ''" class="file-upload__help">{{ helpTxt }}</p>
        </slot>
        <slot v-else name="header-viewing">
          <h2 class="file-upload__head">{{ label }}</h2>
          <p v-if="helpTxt !== ''" class="file-upload__help">{{ helpTxt }}</p>
        </slot>
      </header>
      <main v-if="!isEmpty" class="file-upload__carousel__wrap">
        <button
          v-if="!isEmpty"
          ref="previousBtn"
          class="file-upload__carousel__btn file-upload__carousel__btn--previous"
          accesskey="p"
          :disabled="(noloop === true && selectedKey === 0)"
          v-on:click="previous">
          <span class="visually-hidden">Previous</span>
        </button>
        <div class="file-upload__carousel__outer" v-on:keydown="">
          <ul class="file-upload__carousel" :style="getCarouselStyle">
            <li v-for="(file, index) in uploadList"
               :key="`file-${file.name}--${file.reload ? 1 : 0}`"
                class="file-upload__carousel__item">
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
                :pos="index"
                :total="uploadList.length"
                v-on:delete="deleteFile"
                v-on:replace="replaceFile"
                v-on:moveleft="moveFileLeft"
                v-on:moveright="moveFileRight"
                v-on:fileOpen="fileOpenToggle($event)"
                v-on:keyup="handleKeyUp($event)"></FileUploadImage>
            </li>
          </ul>
        </div>
        <button v-if="(uploadList.length > 1)"
                class="file-upload__carousel__btn file-upload__carousel__btn--next"
                accesskey="n"
                :disabled="(noloop === true && selectedKey === max)"
                v-on:click="next">
          <span class="visually-hidden">Next</span>
        </button>
      </main>
      <footer>
        <p v-if="uploadList.length === 0" class="file-upload__first-label">
          <label :for="getID('main-input')"
                  class="file-upload__label">
            {{ uploadHelp }}
            <input
              :accept="accepted"
              accesskey="a"
              class="file-upload__input visually-hidden" :id="getID('main-input')"
              :multiple="(max > 1)"
              type="file"
              v-on:change="processSelectedFiles"
              v-on:click="fileInputClick"
              v-on:focus="assumeClosed" />
          </label>
          <WebCamera
            use
            v-on:usephoto="processCapturedPhoto" />
        </p>
        <p v-else-if="uploadList.length > max || badCount > 0"
           class="file-upload__bad-list-msg">
          {{ getBadListMsg }}
        </p>
        <p v-if="uploadList.length > 0 && full === false && badCount === 0"
           class="file-upload__add-confirm">
          <label v-if="goodCount < max"
                :for="getID('extra-input')"
                class="file-upload__add-btn">
            Add another file
            <input
              :accept="accepted"
              accesskey="a"
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
            v-on:usephoto="processCapturedPhoto" />
          <button
            v-if="canConfirm === true"
            v-on:click="handleConfirm"
            accesskey="s"
            class="file-upload__confirm--btn">
            {{ getConfirmUploadBtnTxt }}
          </button>
        </p>
      </footer>
      <button
        class="file-upload__main-close"
        v-on:click="handleClose"
        :tabindex="active ? undefined : -1">
        <span class="visually-hidden">
          Close upload {{ genericTypeList }} files
        </span>
      </button>
    </article>

    <article v-if="showConfirm === false && sending === true" :class="getDialogueClass">
      <header>
        <h2 class="file-upload__head">{{ label }}</h2>
        <p>Your files are being sent to the server</p>
      </header>
    </article>

    <article v-if="showConfirm === true" :class="getDialogueClass">
      <header>
        <h2 class="file-upload__head">{{ label }}</h2>
      </header>
      <p class="file-upload__confirm-txt">{{ confirmText }}</p>
      <footer>
        <p class="file-upload__confirm-btns">
          <button
            v-if="confirmUpload === true"
            ref="continueBtn"
            @click="handleConfirmInner"
            class="file-upload__confirm-btn__confirm">
            {{ confirmBtnTxt }}
          </button>
          <button
            v-else @click="toggleActive"
            ref="continueBtn"
            class="file-upload__confirm-btn__confirm">
            {{ cancelBtnTxt }}
          </button>
          <button @click="handleUnconfirm" class="file-upload__confirm-btn__cancel">Cancel</button>
        </p>
      </footer>
    </article>
  </div>
</template>

<script lang="ts" setup>
import imageReducer from 'image-blob-reduce';
// import imageBlobReduce, { ImageBlobReduce } from 'image-blob-reduce';
import { computed, nextTick, onBeforeMount, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { TFileData, TFileUploadState, TMimeType, TReplaceData } from '../../types/FileUpload.d';
import { ImageBlobReduce } from "../../types/ImageBlobReduce.d"
import { defaultTypes, getAllowedTypes, getFieldID, getFileExt, imgIsPortrait, isBadType, moveFile, humanImplode, humanFileSizeToBytes } from './FileUpload.utils';
import FileUploadImage from './FileUploadImage.vue';
import WebCamera from './WebCamera.vue';
// import  ImageBlobReduce from '@types/image-blob-reduce';

// --------------------------------------------------
// START: Emitted events

const emit = defineEmits<{
  (e: 'confirmupload', files: Array<File|null>) : void,
  (e: 'fileuploadclosed' ) : void,
}>();

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
   * @property {string} helpTxt
   */
  cancelConfirmText: { type: String, required: false, default: '' },

  /**
   * Text for the button shown to the user asking them to confirm
   * they want to upload their selected files.
   * (after they have clicked the confirm and upload dialogue button)
   */
  confirmBtnTxt: { type: String, required: false, default: 'Send files' },

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
   * Whether or not the selected files are being sent to the server
   *
   * Renders a loading spinner while waiting for a response from
   * the server
   *
   * @property {boolean} sending
   */
  sending: { type: Boolean, required: false, default: false },

  /**
   * List of file extensions matching file types the server will
   * accept
   *
   * @property {string}
   */
  types: {
    type: String,
    required: false,
    default: 'png jpg webp pdf docx doc'
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
   * @property {string} helpTxt
   */
  uploadConfirmText: { type: String, required: false, default: '' },
});

//  END:  Properties/attributes
// --------------------------------------------------
// START: Local state

/**
 * List of accepted mime types of files user is allowed to upload
 */
const accepted : Ref<string> = ref('');

/**
 * Whether or not the main file upload UI is active
 */
const active : Ref<boolean> = ref(false);

/**
 * List of file MIME types user can upload
 */
const allowedTypes : Ref<TMimeType[]> = ref(defaultTypes);

/**
 * Number of invalid files user has selected
 * (they may be wrong type or too large)
 */
const badCount : Ref<number> = ref(0);

/**
 * Whether or not the user can confirm their selection of files
 * and send them to the server
 *
 * > __Note:__ Only TRUE if there are no bad files, and total
 * >           upload size is within maximum upload limit.
 * >           OR
 * >           `auto-exclue` attribute is present
 */
const canConfirm : Ref<boolean> = ref(false);

/**
 * Number of pixels wide the window is
 */
const carouselOffset : Ref<number> = ref(0);

/**
 * Text to render when user is asked to either confirm or cancel
 * upload
 */
const confirmText : Ref<string> = ref('');

/**
 * Whether or not the confirmation screen is for confirming upload
 * or confirming abandonment of upload
 */
const confirmUpload : Ref<boolean> = ref(true);

/**
 * Whether or not whether or not to set the focus on "Previous"
 * button when the carousel opens
 */
const doAutofocus : Ref<boolean> = ref(true);

/**
 * Whether or not the user has already selected the maximum number
 * of (valid) files they can
 */
const full : Ref<boolean> = ref(false);

/**
 * List of generic file types to show in hidden button text
 */
const genericTypeList = ref('');

/**
 * Number of valid files user has selected
 * (files that are small enough and of the right type)
 */
const goodCount : Ref<number> = ref(0);

/**
 * List of human readable file types to show user
 */
const humanTypeList : Ref<string> = ref('');

/**
 * Object used to reduce image file sizes
 */
const imgReduce : Ref<ImageBlobReduce | null> = ref(null);

/**
 * Maximum number of files user may upload
 */
const max : Ref<number> = ref(1);

/**
 * Maximum number of pixels (in either X or Y dimension) an image
 * should be after processing
 */
const maxPx : Ref<number> = ref(1500);

/**
 * Minimum number of files user may upload
 */
const min : Ref<number> = ref(1);

/**
 * Unique ID for files (is incremented each time a file is selected)
 */
const nextUID : Ref<number> = ref(0);

/**
 * How many images are currently being processed
 */
const processingCount : Ref<number> = ref(0);

/**
 * The object representing the file currently in prime position
 * in the carousel
 */
const selected : Ref<TFileData | null>= ref(null);

/**
 * The index of the file currently in prime position in the
 * carousel array.
 */
const selectedKey : Ref<number> = ref(-1);

/**
 * Whether or not files are being selected
 */
const selectingFiles : Ref<boolean> = ref(false);

/**
 * Whether or not to render the confirmation screen
 */
const singleMax : Ref<number> = ref(5242880);

/**
 * Whether or not to render the confirmation screen
 */
const showConfirm : Ref<boolean> = ref(false);

/**
 * Whether the total number of bytes is greater than the allowed maximum
 */
const tooBig : Ref<boolean> = ref(false);

/**
 * Maximum number of bytes the combined size of all selected
 * file can be
 */
const totalMax : Ref<number> = ref(15728640);

/**
 * Generated help text to guide users in how many and which types
 * of files can be uploaded
 */
const uploadHelp : Ref<string> = ref('');

/**
 * List of files user has selected to upload
 */
const uploadList : Ref<TFileData[]> = ref([]);

const previousBtn : Ref<HTMLButtonElement|null> = ref(null);
const continueBtn : Ref<HTMLButtonElement|null> = ref(null);

//  END:  Local state
// --------------------------------------------------
// START: Computed properties

/**
 * Get inline carousel styles
 *
 * @returns Inline CSS for styling carousel
 */
const getCarouselStyle : ComputedRef<string> = computed(() : string => {
  return `--carousel-items: ${uploadList.value.length}; --carousel-pos: ${selectedKey.value};`;
});

/**
 * Get message to report on bad files if there are issues with
 * one or more files.
 *
 * @returns Message if there are issues. Empty string otherwise.
 */
const getBadListMsg : ComputedRef<string> = computed(() : string => {
  const excess = goodCount.value - max.value;

  let output = '';
  let also = 'You';

  if (tooBig.value === true) {
    output = `The total upload size for your selected files is greater than ${props.maxTotal}. You will need to remove one or more files to get under the ${props.maxTotal} upload limit.`
  } else {
    if (badCount.value > 0) {
      if (badCount.value === 1) {
        output = 'You have one invalid file (marked with a red notice block). You must remove or replace it before you can upload your files.';
      } else {
        output = `You have ${badCount.value} invalid files (each marked with a red notice blocks). You must remove or replace all of them before you can upload your files.`;
      }
      also = ' You also';
    }

    if (excess > 0) {
      if (excess === 1) {
        output += `${also} have one too many files selected (the excess file is marked with a red notice block) You must remove it before you can upload your files.`;
      } else {
        output = `You have ${excess} too many files (each marked with a red notice blocks). You must remove them before you can upload your files.`;
      }
    }
  }
  return output;
});

/**
 * Text in button used to confirm the user is happy with their
 * selected files and is ready to send them to the server.
 *
 * @returns Button text for confirming upload is ready
 */
const getConfirmUploadBtnTxt : ComputedRef<string> = computed(() : string => {
  return (props.uploadConfirmText === '')
    ? 'Confirm and upload'
    : 'Upload';
});

/**
 * Get a class name (or names) for styling the main upload
 * dialogue/modal
 *
 * @returns dialogue/modal classes
 */
const getDialogueClass : ComputedRef<string> = computed(() : string => {
  const clsName: string = 'file-upload__dialogue';
  let output: string = clsName;

  if (active.value === true) {
    output += ' ' + clsName + '--active';
  }

  if (showConfirm.value === true) {
    output += ' ' + clsName + '--confirm';
  } else {
    output += ' ' + clsName + '--';
    output += (uploadList.value.length === 0)
      ? 'none'
      : 'some';
  }

  return output;
});

const isEmpty : ComputedRef<boolean> = computed(() : boolean => uploadList.value.length > 0);

//  END:  Computed properties
// --------------------------------------------------
// START: Local methods

/**
 * Get list of classes to use on an element
 *
 * @param cls1 primary class for the element
 * @param cls2 secondary class used for the element
 *
 * @returns space separated list of class names
 */
const activeClass = (cls1: string, cls2?: string) : string => {
  const output: string[] = ['file-upload__' + cls1];

  if (typeof cls2 === 'string') {
    output.push('file-upload__' + cls2);
  }

  if (active.value === true) {
    for (let a = 0; a < output.length; a += 1) {
      output[a] = output[a] + ' ' + output[a] + '--active';
    }
  }

  return output.join(' ');
};

/**
 * Add a new file to the list or replace an existing file in
 * the list of files the user has selected for uploading.
 *
 * @param data matadata about the file to be uploaded
 */
const addFileToList = (data: TFileData): void => {
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
 * Handle the user closing the file selection dialogue and
 * prevent "Esc" key press from closing the whole upload modal UI
 *
 * This is a hack to get around a race condition where, if the
 * file upload dialogue is open and user clicks the "Esc" key,
 * the FileUpload keyboard handling fires causing the whole
 * FileUpload modal to close.
 *
 * By adding a half second delay, to setting selectingFiles to
 * FALSE, the file selection dialogue can close while the main
 * FileUpload modal stays open.
 *
 * @param event
 */
const assumeClosed = (event: Event) : void => {
  if (selectingFiles.value === true) {
    setTimeout(fixEscapeRace(selectingFiles), 500);
  }
};

/**
 * Go through the list of selected files and check if there are
 * any issues posed by the group of files as a whole.
 */
const checkForIssues = (forceUpdate: boolean = false) : void => {
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
    if (uploadList.value[a].badType === false &&
        uploadList.value[a].tooBig === false
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
    (goodCount.value > 0 && tooBig.value === false) &&
    (
      (badCount.value === 0 && full.value === false)
      || props.autoExclude === true
    )
  );

  // if (forceUpdate === true ||
  //     old.good !== goodCount.value ||
  //     old.bad !== badCount.value ||
  //     old.tooBig !== tooBig.value ||
  //     old.full !== full.value ||
  //     old.pos !== selectedKey.value
  // ) {
  //   this.$forceUpdate();
  // }
};

/**
 * Remove all selected files from the upload list
 */
const clearAll = () : void => {
  uploadList.value = []
};

/**
 * Move the focus file postion back one
 */
const decrement = () : void => {
  updateSelected(selectedKey.value - 1);
};

/**
 * Delete selected file from the list of files user has selected
 * (and remove it from the file carousel).
 *
 * @param fileName Name of file to be removed from the list.
 */
const deleteFile = (fileName: string) : void => {
  uploadList.value = uploadList.value.filter((file : TFileData) => file.name !== fileName);

  selectingFiles.value = false;
  checkForIssues(true);

  if (selectedKey.value >= uploadList.value.length) {
    selectedKey.value = uploadList.value.length - 1;
  }
};

/**
 * Handle the user opening the file input dialogue
 *
 * @param event
 */
const fileInputClick = (event: Event) : void => {
  selectingFiles.value = true;
};

/**
 * Handle when replace file input triggers file select dialogue
 * to open or close
 */
const fileOpenToggle = (event: boolean) : void => {
  if (event === true) {
    selectingFiles.value = true;
  } else {
    if (selectingFiles.value === true) {
      setTimeout(fixEscapeRace(selectingFiles), 500);
    }
  }
};

/**
 * Get a callback function to pass to setTimeout()
 */
const fixEscapeRace = (_selectingFiles : Ref<boolean>) : Function => {
  return () : void => {
    _selectingFiles.value = false;
  }
};

/**
 * Get a unique ID to user as the value for a label's `for`
 * attribute and an ID for the associated input field.
 *
 * @param suffix string to append to parent ID
 *
 * @returns a string to use as an input field ID
 */
const getID = (suffix: string): string => {
  return getFieldID(props.id, suffix);
};

/**
 * Get a unique ID to use for a `<FileUploadImage>` component
 *
 * @param fileName name of the file being rendered in the
 *                 component
 */
const getImgID = (fileName : string) : string => {
  const suffix = fileName.replace(/[^a-z0-9_-]/ig, '-')
  return props.id + '__' + suffix;
};

/**
 * Get component specific unique ID for the file.
 *
 * (This may change over time if the file reordered)
 *
 * @returns {number} next unique id in list of IDs for this
 *                   component
 */
const getUID = () : number => {
  const output = nextUID.value;
  nextUID.value += 1;

  return output;
};

/**
 * Handle when user tries to close the upload dialogue interface
 *
 * Check if the button is disabled. If not, do what's needed to
 * close the dialogue
 *
 * @param event Click event
 */
const handleClose = (event: Event) : void =>{
  const btn = event.target as HTMLButtonElement;
  console.group('handleClose()');

  if (btn.disabled === false) {
    console.log('about to try and close');
    handleCloseInner();
  }
  console.groupEnd();
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
 *
 * @param event Click event
 */
const handleCloseInner = () : void => {
  console.group('handleClose()');
  if (goodCount.value === 0 || props.cancelConfirmText === '') {
    toggleActive();
  } else {
    confirmText.value = props.cancelConfirmText;
    confirmUpload.value = false,
    showConfirm.value = true;

    // this.$forceUpdate();

    nextTick(function () {
      if (typeof continueBtn.value !== 'undefined' && continueBtn.value !== null) {
        (continueBtn.value as HTMLButtonElement).focus();
      }
    });
  }
  console.groupEnd();
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
const handleConfirm = () : void => {
  if (props.uploadConfirmText === '') {
    handleConfirmInner();
  } else {
    confirmText.value = props.uploadConfirmText;
    confirmUpload.value = true,
    showConfirm.value = true;
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
const handleConfirmInner = () : void => {
  // get list of File objects
  const files = uploadList.value
    .filter(data => (data.file !== null && !data.badType && !tooBig.value && !data.surplus))
    .map(data => data.file);

  // Clear all other file data
  uploadList.value = [];

  // Close modal
  active.value = false;
  showConfirm.value = false;

  // Send an event to the client
  emit('confirmupload', files);
};

/**
 * Handle user clicking the cancel button in the final
 * confirmation screen
 */
const handleUnconfirm = () : void => {
  confirmText.value = '';
  showConfirm.value = false;
};

/**
 * Handle user keyboard interactions
 *
 * @param event
 */
const handleKeyUp = (event: KeyboardEvent) : void => {
  console.group('handleKeyUp()');
  console.log('event.key:', event.key);
  if (active.value === true) {
    // Only process keyboard events while active.

    const max = (uploadList.value.length - 1);
    const oldKey = selectedKey.value;
    let newKey = oldKey;

    if (showConfirm.value === false) {
      // Process keyboard events
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          increment();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          decrement();
          break;

        case 'PageUp':
          newKey = (oldKey === 0)
            ? max
            : (oldKey > 10)
              ? oldKey - 10
              : 0;
          updateSelected(newKey);
          break;

        case 'PageDown':
          newKey = (oldKey === max)
            ? 0
            : (oldKey < (max - 10))
              ? oldKey + 10
              : max;
          updateSelected(newKey);
          break;

        case 'Home':
          updateSelected(0);
          break;

        case 'End':
          updateSelected(max);
          break;

        case 'Escape':
          if (selectingFiles.value === false) {
            handleCloseInner();
          }
          break;
      }
    } else {
      // Where in the confirmation UI.We need to do things a bit
      // differently.

      if (event.key === 'Escape' && selectingFiles.value === false) {
        // They've pressed the Escape key. Cancel the confirmation
        // UI so they can go back to what they were doing before.
        showConfirm.value = false;
        confirmText.value = '';
      }
    }
  }
  console.groupEnd();
};

/**
 * Move the focus file postion along one
 */
const increment = () : void => {
  updateSelected(selectedKey.value + 1);
};

/**
 * Check whether or not a file is an image (based on it's
 * declared mime type)
 *
 * @param type MIME type of a file
 */
const isImage = (type: string) : boolean => {
  for (let a = 0; a < allowedTypes.value.length; a += 1) {
    if (allowedTypes.value[a].mime === type &&
        allowedTypes.value[a].type === 'image'
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
 * @param fileName name of file passed from FileUploadImage
 */
const moveFileLeft = (fileName: string) : void => {
  uploadList.value = moveFile(uploadList.value, fileName, -1);
  decrement();
  checkForIssues(true);
  nextTick(function () {
    if (typeof continueBtn.value !== 'undefined' && continueBtn.value !== null) {
      (continueBtn.value as HTMLButtonElement).focus();
    }
  });
};

/**
 * Change the order of the files in the list so that the
 * selected file is moved to the right of where it was.
 *
 * This will change its position in the file carousel
 *
 * @param fileName name of file passed from FileUploadImage
 */
const moveFileRight = (fileName: string) : void => {
  uploadList.value = moveFile(uploadList.value, fileName, 1);
  increment();
  checkForIssues();
};

/**
 * Move the focus image in the carousel one step to the right
 */
const next = () : void => {
  increment();
};

/**
 * Move the focus image in the carousel one step to the left
 */
const previous = () : void => {
  decrement();
};

/**
 * Process a single file selected by the user
 *
 * First check if it's bad, then (if it's good), check if its
 * an image. If it's an image, make sure it's not too big by
 * resizing it. Finally, add it to the list of files to show
 * the user.
 *
 * @param data All the needed metadata about a file (possibly
 *             including an old version of the file itself)
 * @param file File to be processed then added to the metadata
 */
const processFileInner = async (data: TFileData, file: File) => {
  if (data.badType === false) {
    if (isImage(data.type)) { // imageReducer
      const imgReduce = new imageReducer();
      // const imgReduce = new imageBlobReduce();

      imgReduce.toBlob(file, { max: 1500 })
        .then(async (blob: Blob) => {
        // Convert image blob to file object
        const newFile = new File(
          // Blob must be wrapped within array for file object
          // constructor
          [blob], file.name, {
              type: blob.type,
              lastModified: Date.now(),
          }
        );

        data.ext = getFileExt(newFile);
        data.file = newFile;
        data.isPortrait = true;
        data.ready = true;
        data.size = newFile.size;
        data.src = URL.createObjectURL(newFile);
        data.tooBig = newFile.size > singleMax.value;

        addFileToList(data);
        checkForIssues(true);
      });
    } else {
      data.file = file;
      data.ready = true;
      addFileToList(data);
      checkForIssues(true);
    }
  } else {
    checkForIssues(true);
  }
};

/**
 * Process a single new file the user has selected
 *
 * @param file New file to be added to the list of files the
 *             user has selected
 */
const processNewFile = (file: File, fromCamera: boolean = false) : void => {
  // let ext = '';
  // try {
  //   ext = getFileExt(file);
  // } catch
  const tmp: TFileData = {
    badType: isBadType(file.type, allowedTypes.value),
    ext: getFileExt(file),
    file: null,
    id: getUID(),
    lastModified: file.lastModified,
    name: file.name,
    originalSize: file.size,
    isPortrait: false,
    ready: false,
    reload: false,
    selected: false,
    size: file.size,
    src: '',
    surplus: false,
    tooBig: file.size > singleMax.value,
    type: file.type,
    fromCamera: fromCamera,
  };

  addFileToList(tmp);
  selectedKey.value = (uploadList.value.length - 1);

  processFileInner(tmp, file);
};

/**
 * Process all files user has selected using a file input field
 *
 * @param e File input change event
 */
const processSelectedFiles = (e: Event) : void => {
  const files = (e.target as HTMLInputElement).files;

  selectingFiles.value = false;

  // Put the focus at the start of the latest additional files
  const newIndex = (uploadList.value.length > 0)
    ? uploadList.value.length
    : 0;

  if (typeof files !== null) {
    for (let a = 0; a < (files as FileList).length; a += 1) {
      processNewFile((files as FileList)[a]);
    }

    // Make sure the focus is in the right place
    selectedKey.value = newIndex;
  }

  if (doAutofocus.value === true) {
    // const previousID = getID('previous');
    nextTick(function () {
      doAutofocus.value = false;
      if (typeof previousBtn.value !== 'undefined' && previousBtn.value !== null) {
        (previousBtn.value as HTMLButtonElement).focus();
      }
    });
  }
};

const processCapturedPhoto = (file: File) : void => {
  // Put the focus at the start of the latest additional files
  const newIndex = (uploadList.value.length > 0)
    ? uploadList.value.length
    : 0;

  processNewFile(file, true);

  // Make sure the focus is in the right place
  selectedKey.value = newIndex;

  if (doAutofocus.value === true) {
    // const previousID = getID('previous');
    nextTick(function () {
      doAutofocus.value = false;
      if (typeof previousBtn.value !== 'undefined' && previousBtn.value !== null) {
        (previousBtn.value as HTMLButtonElement).focus();
      }
    });
  }
};

/**
 * Find an old file in the list of selected files and replace it
 * with the new one the user has selected.
 *
 * @param oldName Name of the file the new file will replace
 * @param newFile New file to replace old one.
 */
const replaceFile = ({ oldName, newFile } : TReplaceData) : void => {
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
    };

  }

  if (ok === false) {
    throw new Error('could not find file ("' + oldName + '") to replace with "' + newFile.name + '"');
  }
};

/**
 * Toggle the upload user interface open or closed.
 *
 * If closing the upload user interface, all selected files will
 * be removed from the upload list. Next time the user wants to
 * upload, they will have to start form scratch.
 */
const toggleActive = () : void => {
  active.value = !active.value;
  showConfirm.value = false;
  confirmText.value = '';

  if (active.value === false) {
    doAutofocus.value = true;
    uploadList.value = [];
  }
};

/**
 * Handle when the focus item in the carousel changes
 *
 * @param oldKey Previus key for focused item
 * @param newKey Key for newly focused item
 * @param max Total number of items in the carousel.
 */
const updateSelected = (newKey: number) : boolean => {
  const max = (uploadList.value.length - 1);
  const oldKey = selectedKey.value;

  let _newKey = newKey;

  if (_newKey < 0) {
    _newKey = (props.noloop === false)
      ? max
      : 0;
  } else if (_newKey > max) {
    _newKey = (props.noloop === false)
      ? 0
      : max;
  }

  if (oldKey !== _newKey) {
    if (typeof uploadList.value[oldKey] !== 'undefined') {
      uploadList.value[oldKey].selected = false;
    }

    uploadList.value[_newKey].selected = true;

    selected.value = uploadList.value[_newKey];
    selectedKey.value = _newKey;
    // this.$forceUpdate();

    return true;
  }

  return false;
};

//  END:  Local methods
// --------------------------------------------------
// START: Lifecycle methods

onBeforeMount(() : void => {
  allowedTypes.value = getAllowedTypes(props.types);
  const genericTypes: string[] = [];
  const typeList: string[] = [];
  let helpMsg: string = '';
  let s: string = '.';
  let sep = '';
  accepted.value = '';

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
  min.value = parseInt(props.minFiles);
  if (props.unlimited === true) {
    max.value = 999
  } else {
    max.value = parseInt(props.maxFiles);

    if (max.value < 1) {
      if (max.value === 0) {
        // User has set max to unlimited
        // Make max a rediculously high number so it's effectively
        // unlimited
        max.value = 999;
      } else {
        max.value = 1;
        console.error('invalid maxFiles set');
      }
    }
  }

  if (min.value < 0) {
    min.value = 0;
    console.error('invalid minFiles set');
  } else if (min.value > max.value) {
    console.error('invalid minFiles set (minFiles cannot be greater than maxFiles)');
    min.value = max.value;
  }

  if (max.value > 100 && max.value !== 999) {
    console.warn('unwise value for maxFiles set');
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
