<script lang="ts">
import { fileData, fileUploadState, replaceData } from './FileUpload.d';
import { defaultTypes, getAllowedTypes, getFieldID, getFileExt, isBadType, moveFile, humanImplode, humanFileSizeToBytes } from './FileUpload.utils';
import  ImageBlobReduce from 'image-blob-reduce';
import FileUploadImage from './FileUploadImage.vue';
// import  ImageBlobReduce from '@types/image-blob-reduce';

export default {
  props: {
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
     * >           IDs to make sure those elements can be reused
     * >           else where in the code without duplication.
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
    types: { type: String, required: false, default: 'png jpg webp pdf docx doc' },
  },

  data: function (): fileUploadState {
    return {
      accepted: '',
      active: false,
      allowedTypes: defaultTypes,
      badCount: 0,
      canConfirm: false,
      carouselOffset: 0,
      focusIndex: 0,
      full: false,
      genericTypeList: '',
      goodCount: 0,
      humanTypeList: '',
      min: 1,
      max: 1,
      maxPx: 1500,
      nextUID: 0,
      processingCount: 0,
      singleMax: 5242880,
      tooBig: false,
      totalMax: 15728640,
      uploadHelp: '',
      uploadList: [],
    };
  },

  methods: {
    /**
     * Get list of classes to use on an element
     *
     * @param cls1 primary class for the element
     * @param cls2 secondary class used for the element
     *
     *
     */
    activeClass: function (cls1: string, cls2?: string): string {
      const output: string[] = ['file-upload__' + cls1];

      if (typeof cls2 === 'string') {
        output.push('file-upload__' + cls2);
      }

      if (this.active === true) {
        for (let a = 0; a < output.length; a += 1) {
          output[a] = output[a] + ' ' + output[a] + '--active';
        }
      }

      return output.join(' ');
    },

    /**
     * Add a new file to the list or replace an existing file in
     * the list of files the user has selected for uploading.
     *
     * @param data matadata about the file to be uploaded
     */
    addFileToList: function (data: fileData): void {
      let done = false;
      for (let a = 0; a < this.uploadList.length; a += 1) {
        if (this.uploadList[a].name === data.name) {
          this.uploadList[a] = data;
          done = true;
        }
      }

      if (done === false) {
        this.uploadList.push(data);
      }
    },

    /**
     * Get a class name (or names) for styling the image carousel
     *
     * @returns image carousel classes
     */
    carouselClass: function (): string {
      const tmp = 'file-upload__carousel';
      return `${tmp} ${tmp}--${this.uploadList.length} ${tmp}--${this.uploadList.length}-${this.focusIndex}`;
    },

    /**
     * Go through the list of selected files and check if there are
     * any issues posed by the group of files as a whole.
     */
    checkForIssues: function (forceUpdate: boolean = false): void {
      const old = {
        good: this.goodCount,
        bad: this.badCount,
        full: this.full,
        tooBig: this.tooBig,
      };

      let bad = 0;
      let good = 0;
      let totalBytes = 0;
      for (let a = 0; a < this.uploadList.length; a += 1) {
        if (this.uploadList[a].badType === false &&
            this.uploadList[a].tooBig === false
        ) {
          const oldSurp = this.uploadList[a].surplus
          good += 1;
          this.uploadList[a].surplus = (good > this.max);
          this.uploadList[a].reload = (oldSurp !== this.uploadList[a].surplus);
          totalBytes += this.uploadList[a].size;
        } else {
          bad += 1;
        }
      }

      this.goodCount = good;
      this.badCount = bad;
      this.full = (good >= this.max);
      this.tooBig = (totalBytes > this.totalMax);

      this.canConfirm = (
        (this.goodCount > 0 && this.tooBig === false) &&
        (
          (this.badCount === 0 && this.full === false)
          || this.autoExclude === true
        )
      );

      if (forceUpdate === true) {
        if (old.good !== this.goodCount || old.bad !== this.badCount || old.tooBig !== this.tooBig || old.full !== this.full) {
          this.$forceUpdate();
        }
      }

      // console.log('this:', this);
      // console.log('this.uploadList:', this.uploadList);
    },

    /**
     * Remove all selected files from the upload list
     */
    clearAll: function (): void {
      // console.group('clearAll')
      // console.groupEnd();

      this.uploadList = []
    },

    /**
     * Get a class name (or names) for styling the main upload
     * dialogue/modal
     *
     * @returns dialogue/modal classes
     */
    dialogueClass: function (): string {
      const mode: string = (this.uploadList.length === 0)
        ? 'none'
        : 'some';
      const clsName: string = 'file-upload__dialogue';
      let output: string = clsName;

      if (this.active === true) {
        output += ' ' + clsName + '--active';
      }

      output += ' ' + clsName + '--' + mode;

      return output;
    },

    /**
     * Delete selected file from the list of files user has selected
     * (and remove it from the file carousel).
     *
     * @param fileName Name of file to be removed from the list.
     */
    deleteFile: function (fileName: string): void {
      // console.group('FileUpload - deleteFile()')
      // console.log('fileName:', fileName);

      // console.groupEnd();
      this.uploadList = this.uploadList.filter((file : fileData) => file.name !== fileName);

      this.checkForIssues(true);

      if (this.focusIndex >= this.uploadList.length) {
        this.focusIndex = this.uploadList.length - 1;
      }
      // this.checkForIssues();
    },

    /**
     *
     */
    getBadListMsg: function () : string {
      const excess = this.goodCount - this.max;

      let output = '';
      let also = 'You';

      if (this.tooBig === true) {
        output = `The total upload size for your selected files is greater than ${this.maxTotal}. You will need to remove one or more files to get under the ${this.maxTotal} upload limit.`
      } else {
        if (this.badCount > 0) {
          if (this.badCount === 1) {
            output = 'You have one invalid file (marked with a red notice block). You must remove or replace it before you can upload your files.';
          } else {
            output = `You have ${this.badCount} invalid files (each marked with a red notice blocks). You must remove or replace all of them before you can upload your files.`;
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
    },

    /**
     * Get inline carousel styles
     *
     * @returns Inline CSS for styling carousel
     */
    getCarouselOffset: function () : string {
      return `--carousel-offset: calc(${this.carouselOffset}px - 2rem);`;
    },

    /**
     * Get inline carousel styles
     *
     * @returns Inline CSS for styling carousel
     */
    getCarouselStyle: function () : string {
      return `--carousel-items: ${this.uploadList.length}; --carousel-pos: ${this.focusIndex};`;
    },

    /**
     * Get a unique ID to user as the value for a label's `for`
     * attribute and an ID for the associated input field.
     *
     * @param suffix string to append to parent ID
     *
     * @returns a string to use as an input field ID
     */
    getID: function (suffix: string): string {
      return getFieldID(this.id, suffix);
    },

    /**
     * Get a unique ID to use for a `<FileUploadImage>` component
     *
     * @param fileName name of the file being rendered in the
     *                 component
     */
    getImgID: function (fileName : string) : string {
      const suffix = fileName.replace(/[^a-z0-9_-]/ig, '-')
      return this.id + '__' + suffix;
    },

    /**
     * Get component specific unique ID for the file.
     *
     * (This may change over time if the file reordered)
     *
     * @returns {number} next unique id in list of IDs for this
     *                   component
     */
    getUID: function (): number {
      const output = this.nextUID;
      this.nextUID += 1;

      return output;
    },

    /**
     * Handle when user clicks "Confirm and upload"
     *
     * 1. Gather all the valid `File` objects into an array
     * 2. Dump all the (now) redundant data for each file
     * 3. Close the modal
     * 4. Send a "confirmupload" event to the parent component along
     *    with the list of `File` objects to be uploaded
     */
    handleConfirm: function () : void {
      // get list of File objects
      const files = this.uploadList.filter(data => (!data.badType && !this.tooBig && !data.surplus)).map(data => data.file);

      // Clear all other file data
      this.uploadList = [];

      // Close modal
      this.active = false;

      // Send an event to the client
      this.$emit('confirm-upload', files);
    },

    /**
     * Check whether or not a file is an image (based on it's
     * declared mime type)
     *
     * @param type MIME type of a file
     */
    isImage: function (type: string): boolean {
      for (let a = 0; a < this.allowedTypes.length; a += 1) {
        if (this.allowedTypes[a].mime === type &&
            this.allowedTypes[a].type === 'image'
        ) {
          return true;
        }
      }
      return false;
    },

    /**
     * Change the order of the files in the list so that the
     * selected file is moved to the left of where it was.
     *
     * This will change its position in the file carousel
     *
     * @param fileName name of file passed from FileUploadImage
     */
    moveFileLeft: function (fileName: string): void {
      // console.group('FileUpload - moveFileLeft()')
      // console.log('fileName:', fileName);
      // console.log('this.uploadList (before):', this.uploadList);

      this.uploadList = moveFile(this.uploadList, fileName, -1);
      this.checkForIssues();
      // console.log('this.uploadList (after):', this.uploadList);
      // console.groupEnd();
    },

    /**
     * Change the order of the files in the list so that the
     * selected file is moved to the right of where it was.
     *
     * This will change its position in the file carousel
     *
     * @param fileName name of file passed from FileUploadImage
     */
    moveFileRight: function (fileName: string): void {
      // console.group('FileUpload - moveFileRight()')
      // console.log('fileName:', fileName);
      // console.log('this.uploadList (before):', this.uploadList);

      this.uploadList = moveFile(this.uploadList, fileName, 1);
      this.checkForIssues();

      // console.log('this.uploadList (after):', this.uploadList);
      // console.groupEnd();
    },

    /**
     * Move the focus image in the carousel one step to the right
     */
    next: function (): void {
      if (this.focusIndex < (this.uploadList.length - 1)) {
        this.focusIndex += 1;
      } else {
        // Wrap focus around to beginning
        this.focusIndex = 0;
      }
    },

    /**
     * Move the focus image in the carousel one step to the left
     */
    previous: function (): void {
      if (this.focusIndex > 0) {
        this.focusIndex -= 1;
      } else {
        // Wrap focus around to end
        this.focusIndex = (this.uploadList.length - 1);
      }
    },

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
    processFileInner: function (data: fileData, file: File) {
      if (data.badType === false) {
        if (this.isImage(data.type)) {
          const imgReduce = new ImageBlobReduce();

          imgReduce.toBlob(file, { max: 1500 })
            .then((blob: Blob) => {
            // Convert image blob to file object
            const newFile = new File(
            // Blob must be wrapped within array for file object
            // constructor
            [blob], file.name, {
                type: blob.type,
                lastModified: Date.now(),
            });

            data.file = newFile;
            data.src = URL.createObjectURL(newFile);
            data.ready = true;
            data.size = newFile.size;
            data.tooBig = newFile.size > this.singleMax;
            data.ext = getFileExt(newFile);

            // console.group('processFileInner()')
            // console.log('data.size:', data.size)
            // console.log('newFile.size:', newFile.size)
            // console.log('this.singleMax:', this.singleMax)
            // console.log('data.tooBig:', data.tooBig)
            // console.groupEnd();

            this.addFileToList(data);
            this.checkForIssues(true);
            this.$forceUpdate();
          });
        } else {
          data.file = file;
          data.ready = true;
          this.addFileToList(data);
          this.checkForIssues(true);
        }
      }
    },

    /**
     * Process a single new file the user has selected
     *
     * @param file New file to be added to the list of files the
     *             user has selected
     */
    processNewFile: function (file: File): void {
      // let ext = '';
      // try {
      //   ext = getFileExt(file);
      // } catch
      const tmp: fileData = {
        badType: isBadType(file.type, this.allowedTypes),
        ext: getFileExt(file),
        file: null,
        id: this.getUID(),
        lastModified: file.lastModified,
        name: file.name,
        originalSize: file.size,
        ready: false,
        reload: false,
        size: file.size,
        src: '',
        surplus: false,
        tooBig: file.size > this.singleMax,
        type: file.type
      };

      this.addFileToList(tmp);
      this.focusIndex = (this.uploadList.length - 1);

      this.processFileInner(tmp, file);
    },

    /**
     * Process all files user has selected using a file input field
     *
     * @param e File input change event
     */
    processSelectedFiles: function (e: Event): void {
      const files = (e.target as HTMLInputElement).files;
      // console.log('event:', e);
      // console.log('event.target:', e.target);
      // console.log('files:', files);
      // const selectedFiles = event.target.files;

      // Put the focus at the start of the latest additional files
      const newIndex = (this.uploadList.length > 0)
        ? this.uploadList.length
        : 0;

      if (typeof files !== null) {
        for (let a = 0; a < (files as FileList).length; a += 1) {
          this.processNewFile((files as FileList)[a]);
        }

        // Make sure the focus is in the right place
        this.focusIndex = newIndex;
      }
    },


    /**
     * Find an old file in the list of selected files and replace it
     * with the new one the user has selected.
     *
     * @param oldName Name of the file the new file will replace
     * @param newFile New file to replace old one.
     */
    replaceFile: function ({ oldName, newFile } : replaceData): void {
      // console.group('FileUpload - replaceFile()')
      // console.log('oldName:', oldName);
      // console.log('newFile:', newFile);
      // console.log('this.uploadList.length:', this.uploadList.length);

      let ok = false;

      for (let a = 0; a < this.uploadList.length; a += 1) {
        // console.log('oldName:', oldName);
        // console.log('this.uploadList[' + a + ']:', this.uploadList[a])
        // console.log('this.uploadList[' + a + '].name:', this.uploadList[a].name)

        if (this.uploadList[a].name === oldName) {
          ok = true;

          this.uploadList[a].badType = (this.accepted.indexOf(newFile.type) === 0);
          this.uploadList[a].file = null;
          this.uploadList[a].lastModified = newFile.lastModified;
          this.uploadList[a].name = newFile.name;
          this.uploadList[a].ready = false;
          this.uploadList[a].size = newFile.size;
          this.uploadList[a].originalSize = newFile.size;
          this.uploadList[a].src = '';
          this.uploadList[a].ext = getFileExt(newFile);
          this.uploadList[a].tooBig = newFile.size > this.singleMax;
          this.uploadList[a].type = newFile.type;

          this.processFileInner(this.uploadList[a], newFile);
          break;
        };

      }

      if (ok === false) {
        throw new Error('could not find file ("' + oldName + '") to replace with "' + newFile.name + '"');
      }

      // console.groupEnd();
    },

    /**
     * Toggle the upload user interface open or closed.
     *
     * If closing the upload user interface, all selected files will
     * be removed from the upload list. Next time the user wants to
     * upload, they will have to start form scratch.
     */
    toggleActive: function (): void {
      this.active = !this.active;

      if (this.active === false) {
        this.uploadList = [];
      }
    },

    updateCarouselOffset: function () {
      // console.group('updateCarouselOffset()')
      // console.log('this.carouselOffset (before):', this.carouselOffset)
      const body = document.getElementsByTagName('body');
      this.carouselOffset = Math.floor(body[0].clientWidth / 2);
      // console.log('this.carouselOffset (after):', this.carouselOffset)
      // console.groupEnd();
    },
  },

  mounted: function (): void {
    // console.group('mounted()')
    this.allowedTypes = getAllowedTypes(this.types);
    const genericTypes: string[] = [];
    const typeList: string[] = [];
    let helpMsg: string = '';
    let s: string = '.';
    let sep = '';
    this.accepted = '';

    for (let a = 0; a < this.allowedTypes.length; a += 1) {
      if (genericTypes.indexOf(this.allowedTypes[a].type) === -1) {
        genericTypes.push(this.allowedTypes[a].type);
      }

      typeList.push(this.allowedTypes[a].name);
      this.accepted += sep + this.allowedTypes[a].mime;
      sep = ', ';
    }

    this.maxPx = parseInt(this.maxPixels);
    this.singleMax = humanFileSizeToBytes(this.maxSingle);
    // console.log('this.singleMax:', this.singleMax);
    this.totalMax = humanFileSizeToBytes(this.maxTotal);
    // console.log('this.totalMax:', this.maxTotal);
    this.humanTypeList = humanImplode(typeList);
    this.genericTypeList = humanImplode(genericTypes);
    // console.log('human file types:', this.humanTypeList);
    // console.log('generic file types:', this.genericTypeList);

    // --------------------------------------------------------------
    // START: Prepare file input label text
    this.min = parseInt(this.minFiles);
    this.max = parseInt(this.maxFiles);

    if (this.max < 1) {
      this.max = 1;
      console.error('invalid maxFiles set');
    }

    if (this.min < 1) {
      this.min = 1;
      console.error('invalid minFiles set');
    } else if (this.min > this.max) {
      console.error('invalid minFiles set (minFiles cannot be greater than maxFiles)');
      this.min = this.max;
    }

    if (this.max > 100) {
      console.warn('unwise value for maxFiles set');
    }

    helpMsg = 'Choose ';

    if (this.max > 1) {
      helpMsg += (this.min > 1)
        ? `at least ${this.min} and no more than ${this.max}`
        : `up to ${this.max}`;
      s = 's.';
    } else {
      helpMsg += 'one';
    }

    // helpMsg += ` ${this.humanTypeList}`;
    helpMsg += ` file${s}`;
    this.uploadHelp = helpMsg;

    //  END:  Prepare file input label text
    // --------------------------------------------------------------
    // START: Get carousel offset

    this.updateCarouselOffset();

    window.addEventListener('resize', this.updateCarouselOffset, true);

    //  END:  Get carousel offset
    // --------------------------------------------------------------
    // console.log('this:', this);
    // console.log('this.id:', this.id);
    // console.groupEnd();
  },
  components: { FileUploadImage }
}
</script>

<template>
  <div :id="id" class="file-upload">
    <button v-on:click="toggleActive" :tabindex="active ? -1 : undefined">
      Upload <span class="visually-hidden">{{ genericTypeList }} files</span>
    </button>
    <button :class="activeClass('bg-close')" v-on:click="toggleActive" :tabindex="active ? undefined : -1">
      <span class="visually-hidden">
        Close upload {{ genericTypeList }} files
      </span>
    </button>
    <article :class="dialogueClass()">
      <header>
        <h2 class="file-upload__head">{{ label }}</h2>
        <p v-if="helpTxt !== ''">{{ helpTxt }}</p>
      </header>
      <main v-if="uploadList.length > 0" class="file-upload__carousel__wrap">
        <button v-if="(uploadList.length > 1)" class="file-upload__carousel_btn file-upload__carousel_btn--previous" v-on:click="previous"><span class="visually-hidden">Previous</span></button>
        <div class="file-upload__carousel__outer" :style="getCarouselOffset()">
          <ul class="file-upload__carousel" :style="getCarouselStyle()">
            <li v-for="(file, index) in uploadList" :key="`file-${file.name}--${file.reload ? 1 : 0}`" class="file-upload__carousel__item">
              <FileUploadImage :accepted="accepted"
                              :id="getImgID(file.name)"
                              :pos="index"
                              :total="uploadList.length"
                              :file-src="file.src"
                              :file-name="file.name"
                              :file-size="file.size"
                              :file-type="file.type"
                              :ext="file.ext"
                              :is-bad-type="file.badType"
                              :is-focused="focusIndex === index"
                              :is-too-big="file.tooBig"
                              :is-surplus="file.surplus"
                              :is-ready="file.ready"
                              :can-move="reorder"
                              @delete="deleteFile"
                              @replace="replaceFile"
                              @moveleft="moveFileLeft"
                              @moveright="moveFileRight"></FileUploadImage>
              <!-- <img :src="file.src" :alt="file.name" /> -->
            </li>
          </ul>
        </div>
        <button v-if="(uploadList.length > 1)" class="file-upload__carousel_btn file-upload__carousel_btn--next" v-on:click="next"><span class="visually-hidden">Next</span></button>
      </main>
      <footer>
        <p v-if="uploadList.length === 0">
          <label :for="getID('main-input')" class="file-upload__label">{{ uploadHelp }}</label>
          <input type="file" class="file-upload__input visually-hidden" :id="getID('main-input')" :multiple="(max > 1) ? true : false" :accept="accepted" v-on:change="processSelectedFiles" />
        </p>
        <p v-else-if="goodCount > 0 && (uploadList.length > max || badCount > 0)" class="file-upload__bad-list-msg">
          {{ getBadListMsg() }}
        </p>
        <p v-if="uploadList.length > 0 && full === false" class="file-upload__add-confirm">
          <label v-if="full === false" :for="getID('extra-input')" class="file-upload__add-btn">Add another file</label>
          <input v-if="full === false" type="file" class="file-upload__input visually-hidden" :id="getID('extra-input')" :multiple="(max > 1 && (max - uploadList.length) > 1) ? true : false" :accept="accepted" v-on:change="processSelectedFiles" />
          <button v-if="goodCount > 0 && uploadList.length <= max" v-on:click="handleConfirm" class="file-upload__confirm--btn">Confirm and upload</button>
        </p>
      </footer>
      <button class="file-upload__main-close" v-on:click="toggleActive" :tabindex="active ? undefined : -1">
        <span class="visually-hidden">
          Close upload {{ genericTypeList }} files
        </span>
      </button>
    </article>
  </div>
</template>

<style>

/**
 * Copied from Bootstrap 5.x
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

.file-upload__bg-close {
  background-color: rgba(0, 0, 0, 0.75);
  border: none;
  display: inline-block;
  height: 100%;
  left: 50%;
  opacity: 0;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform ease-in-out 0.3s 0.2s, opacity ease-in-out 0.3s 0.2s;
  width: 100%;
}
.file-upload__bg-close--active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  transition: transform ease-in-out 0.3s, opacity ease-in-out 0.3s;
}

.file-upload__dialogue {
  align-content: stretch;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0.25rem 0.25rem 1rem rgba(255, 255, 150, 0.8);
  box-sizing: border-box;
  color: #000;
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 4rem);
  max-height: calc(100% - 4rem);
  left: 50%;
  opacity: 0;
  padding: 0;
  position: fixed;
  text-align: left;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform ease-in-out 0.3s, opacity ease-in-out 0.3s;
  width: 30rem;
}
.file-upload__dialogue--active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  transition: transform ease-in-out 0.3s 0.2s, opacity ease-in-out 0.3s 0.2s;
}
.file-upload__dialogue--some {
  height: calc(100% - 4rem);
  /* overflow: hidden; */
  width: calc(100% - 4rem);
}
.file-upload__dialogue > header {
  padding: 2rem 2rem 1rem 2rem;
}
.file-upload__dialogue > main {
  align-items: stretch;
  /* background-color: #009; */
  /* display: flex; */
  flex-grow: 1;
  overflow: hidden auto;
  position: relative;
}
.file-upload__dialogue > main::before,
.file-upload__dialogue > main::after {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,1) 0%,
    rgba(255,255,255,0) 100%
  );
  bottom: 0;
  content: '';
  display: block;
  position: absolute;
  top: 0;
  width: 3rem;
  z-index: 10000;
}
.file-upload__dialogue > main::before {
  left: 0;
}
.file-upload__dialogue > main::after {
  right: 0;
  transform: rotate(180deg);
}
.file-upload__dialogue > footer {
  padding: 0 1rem 1rem 1rem;
}
.file-upload__main-close {
  background-color: #fff;
  border: 0.25rem solid #090;
  border-radius: 50%;
  color: #000;
  display: inline-block;
  font-size: 0.5rem;
  height: 2rem;
  line-height: 1rem;
  position: absolute;
  right: -0.75rem;
  top: -0.75rem;
  width: 2rem;
}
.file-upload__main-close::after {
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
.file-upload__head {
  margin: 0 0 1rem;
  text-align: center;
}
.file-upload__label {
  background-color: #009;
  border-radius: 0.75rem;
  color: #fff;
  display: block;
  max-width: 80%;
  margin: 0 auto;
  padding: 0.5rem 1rem 0.75rem;
  text-align: center;
}
.file-upload__input {
  display: block;
}
.file-upload footer > p {
  margin: 1rem 0 0;
}
.file-upload__add-confirm {
  display: flex;
  justify-content: space-between;
  /* justify-content: space-between; */
  column-gap: 0.5rem;
}
.file-upload__carousel__wrap {
  position: relative;
}
.file-upload__carousel__outer {
  position: relative;
}
.file-upload__carousel {
  align-content: stretch;
  align-items: stretch;
  box-sizing: border-box;
  /* column-gap: 2rem; */
  display: flex;
  flex-wrap: nowrap;
  list-style: none;
  margin: 0;
  padding: 0;
  /* transform: translateX(2.5rem); */
  /* border: 0.05rem solid #000; */
  white-space: nowrap;
  transition: transform ease-in-out 0.3s;
  width: calc(100% * var(--carousel-items));
  transform: translateX(calc(var(--carousel-pos) * calc(-100% / var(--carousel-items))));
}

.file-upload__carousel li {
  /* align-content: stretch; */
  /* align-items: center; */
  box-sizing: border-box;
  /* border: 0.05rem solid #000; */
  display: flex;
  /* display: inline-block; */
  flex-direction: column;
  /* flex-grow: 1; */
  padding: 0 1rem;
  margin: 0;
  width: 70%;
  /* max-width: 30rem; */
}

.file-upload__carousel_btn {
  background-color: transparent;
  /* border: 0.3rem solid #090; */
  border-radius: 50%;
  display: block;
  font-size: 0.5rem;
  height: 1.75rem;
  /* line-height: 1rem; */
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1.75rem;
  z-index: 20000;
  transform-origin: 50% 50%;
}
.file-upload__carousel_btn::after {
  position: absolute;
  top: 0;
  left: 0;
  content: '';
  border: 0.3rem solid #090;
  width: 1rem;
  height: 1rem;
  border-left: none;
  border-top: none;
}
.file-upload__carousel_btn--next {
  right: 0;
}
.file-upload__carousel_btn--next::after {
  transform: translate(-10%, 15%) rotate(-45deg);
}
.file-upload__carousel_btn--previous {
  left: 0;
}
.file-upload__carousel_btn--previous::after {
  transform: translate(40%, 15%) rotate(135deg);
}
.file-upload__add-btn {
  background-color: #000;
  border-radius: 0.5rem;
  color: #fff;
  padding: 0.6em 1.2em;
  text-align: center;
}
.file-upload__bad-list-msg {
  padding: 1.5rem;
  background-color: #c00;
  color: #fff;
  font-weight: bold;
  border-radius: 1rem;
}

@media screen and (min-width: 30rem) {
  .file-upload__dialogue {
    max-width: calc(100% - 15rem);
    max-height: calc(100% - 15rem);
  }
  .file-upload__dialogue > main::before,
  .file-upload__dialogue > main::after {
    width: 8rem;
  }
  .file-upload__dialogue > footer {
    padding: 0 2rem 2rem 2rem;
  }
  .file-upload__add-confirm {
    column-gap: 2rem;
  }
  .file-upload__carousel__outer {
    left: calc(var(--carousel-offset) - 16.5rem);
  }
  .file-upload__carousel {
    --carousel-steps: calc(-100% / var(--carousel-items));
    width: calc(22rem * var(--carousel-items));
    /* transform: translateX(calc(calc(var(--carousel-pos) * var(--carousel-steps)) + calc(var(--carousel-steps) / -1.6))); */
  }
  .file-upload__carousel li {
    width: 22rem;
  }
}

@media screen and (min-width: 40rem) {
  .file-upload__add-confirm {
    justify-content: flex-end;
  }
}

</style>
