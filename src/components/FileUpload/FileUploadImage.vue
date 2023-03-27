<script lang="ts">
import { getFieldID } from './FileUpload.utils';
import { fileUploadImgState } from './FileUpload';

export default {
  props: {
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
     * File name of image/file
     *
     * @property {string} fileName
     */
    fileName: { type: String, required: true },
  },

  data: function () : fileUploadImgState {
    return {
      isBad: false,
      wrapClass: '',
      alt: '',
      _ext: '',
      _fileName: '',
    }
  },

  methods: {
    deleteClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      // console.group('Image - delete()')
      // console.log('event:', e);
      // console.log('event.target:', e.target);
      // console.log('btn:', btn);
      // console.groupEnd();
      this.$emit('delete', this.fileName);
    },
    moveLeftClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      // console.group('Image - moveLeft()')
      // console.log('event:', e);
      // console.log('event.target:', e.target);
      // console.log('btn:', btn);
      // console.groupEnd();
      this.$emit('moveleft', this.fileName);
    },
    moveRightClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      // console.group('Image - moveRight()')
      // console.log('event:', e);
      // console.log('event.target:', e.target);
      // console.log('btn:', btn);
      // console.groupEnd();
      this.$emit('moveright', this.fileName);
    },
    replaceClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      // console.group('Image - replace()')
      // console.log('event:', e);
      // console.log('event.target:', e.target);
      // console.log('btn:', btn);
      // console.groupEnd();
      const files = (e.target as HTMLInputElement).files;

      if (typeof files !== null) {
        this.$emit(
          'replace',
          {
            oldName: this.fileName,
            newFile: (files as FileList)[0],
          }
        );
      }
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

    getBtnBlockClass: function () : string {
      const tmp = 'file-upload-img__btn-block';

      return (this.isFocused)
        ? `${tmp} ${tmp}--show`
        : tmp;
    },

    getPlaceholderClass: function () : string {
      const tmp = 'file-upload-img__placeholder';

      return (this.isReady === false)
        ? `${tmp} ${tmp}--processing`
        : tmp;
    },

    makeWrapable: function () : string {
      return this.fileName.replace(/(?=[^a-z0-9]+)/ig, '\u200B')
    }
  },

  mounted: function () : void {
    const tmp = 'file-upload-img';
    // console.group('FileUploadImage.mounted()')
    // console.log('this.ext:', this.ext)
    // console.log('this.fileType:', this.fileType)
    // console.log('this.isTooBig:', this.isTooBig)
    // console.log('this.isBadType:', this.isBadType)
    // console.log('this.isSurplus:', this.isSurplus)
    if (this.isTooBig === true || this.isBadType === true) {
      this.isBad = true;

      this.wrapClass = `${tmp} ${tmp}--bad`;
    } else if (this.isSurplus === true) {
      this.wrapClass = `${tmp} ${tmp}--surplus`;
    } else {
      this.wrapClass = tmp;
    }

    this._ext = (this.isReady === false)
      ? `Processing ${this.ext} image`
      : this.ext;
    this._fileName = this.fileName.replace(/([^a-z0-9]+)/ig, '$1&ZeroWidthSpace;')
    // console.log('this.isBad:', this.isBad)
    // console.log('this.wrapClass:', this.wrapClass)
    // console.groupEnd();
  },
}

</script>

<template>
  <figure :class="wrapClass">
    <figcaption :class="(fileSrc !== '') ? 'file-upload-img--img' : 'file-upload-img--file'">
      <span  class="file-upload-img__pos">{{ (pos + 1) }}</span>
      <span class="file-upload-img__file-name" v-html="_fileName"></span>
      <p v-if="isTooBig === true" class="file-upload-img__bad">This file is too large to be uploaded. Please replace it with a smaller version or delete it from the upload list</p>
      <p v-if="isBadType === true" class="file-upload-img__bad-msg">You cannot upload a <code>.{{ ext }}</code> type file. Please delete or replace it.</p>
      <p v-if="isSurplus === true" class="file-upload-img__bad-msg">There are already too many files in the list. Either move this file up the list or delete it.</p>
    </figcaption>

    <div v-if="fileSrc !== ''" class="file-upload-img__img">
      <img :src="fileSrc" :alt="alt" :class="isPortrait === true ? 'portrait' : ''" />
    </div>
    <div v-else :class="getPlaceholderClass()">
      <span class="file-upload-img__placeholder__ext"><span>{{ ext }}</span></span>
      <span class="file-upload-img__placeholder__name" v-html="_fileName"></span>
    </div>

    <span v-if="isReady || isBad" :class="getBtnBlockClass()">
      <button v-if="canMove === true && isBad === false && pos > 0"
              v-on:click="moveLeftClick"
              class="file-upload-img__btn file-upload-img__btn--move file-upload-img__btn--left"
              :tabindex="(isFocused === false) ? -1 : undefined">
        <span class="visually-hidden">Move left</span>
      </button>
      <button v-if="canMove === true && isBad === false && pos < (total - 1)"
              v-on:click="moveRightClick"
              class="file-upload-img__btn file-upload-img__btn--move file-upload-img__btn--right"
              :tabindex="(isFocused === false) ? -1 : undefined">
        <span class="visually-hidden">Move right</span>
      </button>
      <label v-if="isSurplus === false" class="file-upload-img__btn file-upload-img__btn--replace">
        <span class="visually-hidden">Replace</span>
        <input type="file"
               class="visually-hidden"
               :id="getID('extra-input')"
               :accept="accepted"
               v-on:change="replaceClick"
               :tabindex="(isFocused === false) ? -1 : undefined" />
      </label>
      <button v-if="total > 1 || isBad"
              v-on:click="deleteClick"
              class="file-upload-img__btn file-upload-img__btn--delete"
              :tabindex="(isFocused === false) ? -1 : undefined">
        <span class="visually-hidden">Delete</span>
      </button>
    </span>
  </figure>
</template>

<style>
.file-upload-img {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  /* height: 100%; */
  height: calc(var(--file-upload-img-max) + 5.5rem);
  margin: 0;
  overflow-y: auto;
  padding: 1rem 1rem 0.5rem;
  position: relative;
}
.file-upload-img--bad::before {
  border-color: #c00;
}
.file-upload-img__img {
  flex-grow: 1;
  position: relative;
  order: 2;
  box-shadow: 0 0 0.75rem rgba(0, 0, 0, 0.2);
}
.file-upload-img__img > img {
  display: block;
  height: 100%;
  /* max-width: calc(100% - 2rem); */
  margin: 0 auto;
  height: calc(var(--file-upload-img-max) + 0.5rem);
  /* max-height: var(--file-upload-img-max); */
  /* max-width: var(--file-upload-img-max); */
  object-fit: scale-down;
  position: relative;
  text-align: center;
  width: calc(var(--file-upload-img-max));
}
.file-upload-img > figcaption {
  position: absolute;
  top: 1rem;
  left: 0;
  right: 0;
  z-index: 1;
}
.file-upload-img--file .file-upload-img__bad-msg {
  margin: 1.25rem 2.8rem 0;
}
.file-upload-img__btn-block {
  bottom: 0;
  box-sizing: border-box;
  column-gap: 0.3rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  opacity: 0;
  order: 1;
  padding: 0 0 0.5rem;
  row-gap: 0.5rem;
  transition: opacity ease-in-out 0.3s;
  white-space: normal;
  text-align: center;
  width: 100%;
}
.file-upload-img__btn-block--show {
  opacity: 1;
}
.file-upload-img__btn {
  border-radius: 0;
  flex-grow: 1;
  padding: 0.6rem;
  text-align: center;
  /* width: 3rem; */
  position: relative;
  height: 3rem;
}
.file-upload-img__btn::before {
  position: absolute;
  font-size: 1.5rem;
  line-height: 0.9rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
}
.file-upload-img__btn--delete {
  background-color: #c00;
  color: #fff;
}
.file-upload-img__btn--delete::before {
  content: '\00425';
  transform: translate(-50%, -55%) scaleX(125%);
}
.file-upload-img__btn--replace {
  background-color: #00b;
  /* border-radius: 0.5rem; */
  color: #fff;
  padding: 0 0.6rem;
  order: -1;
}
.file-upload-img__btn--replace::before {
  content: '\021BB';
  font-size: 2rem;
  line-height: 0.9rem;
  transform: translate(-50%, -75%);
}
.file-upload-img__btn--replace:focus-within {
  outline: 0.2rem solid #00b;
  /* outline-offset: 0.1rem; */
}
.file-upload-img__btn--left {
  order: -2;
}
.file-upload-img__btn--left::before {
  content: '\021D0';
}
.file-upload-img__btn--right {
  order: 1;
}
.file-upload-img__btn--right::before {
  content: '\021D2';
}
.file-upload-img__btn--move::before {
  transform: translate(-50%, -65%) scale(125%);
}
.file-upload-img__placeholder {
  align-items: stretch;
  background-color: #eee;
  border: 0.3rem solid #aaa;
  /* border-radius: 0.5rem; */
  color: #888;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  height: calc(var(--file-upload-img-max) - 1rem);
  margin: 0 auto;
  order: 2;
  overflow-wrap: anywhere;
  padding-bottom: 1rem;
  text-align: center;
  width: 72%;
  white-space: normal;
  word-break: break-all;
}
.file-upload-img__placeholder__ext  {
  align-self: center;
  /* display: block; */
  flex-grow: 1;
  font-size: 1.0625rem;
  font-weight: bold;
  margin: 0 auto;
  overflow-wrap: anywhere;
  padding: 0.5rem;
  position: relative;
}
.file-upload-img__placeholder__ext > span  {
  display: block;
  position: relative;
  top: 50%;
  /* left: 50%; */
  transform: translateY(-50%);
}
.file-upload-img__bad-msg {
  background-color: rgba(185, 0, 0, 0.7);
  color: #fff;
  /* border-radius: 1rem; */
  max-width: 20rem;
  margin: 1rem 2rem 0.5rem;
  padding: 1rem 1.25rem;
  white-space: normal;
}
.file-upload-img__pos {
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
.file-upload-img__file-name {
  /* background-color: rgba(255, 255, 255, 0.7); */
  display: block;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  hyphens: auto;
  margin: -1.35rem 0.5rem;
  overflow-wrap: anywhere;
  padding: 0 0.5rem;
  text-align: center;
  word-break: break-all;
  white-space: normal;
}
.file-upload-img--file .file-upload-img__file-name {
  display: none;
}

@media screen and (min-width: 30rem) {
  .file-upload-img__img, .file-upload-img__placeholder {
    /* max-height: 20rem; */
    order: 1;
  }
  .file-upload-img__btn-block {
    order: 2;
    padding: 0.5rem 0 0;
    column-gap: 1rem;
  }
}

@media screen and (min-height: 26rem) and (min-width: 26rem) {
  .file-upload-img__placeholder__ext {
    font-size: 1.125rem
  }
}
@media screen and (min-height: 30rem) and (min-width: 30rem) {
  .file-upload-img__placeholder__ext {
    font-size: 1.1875rem
  }
}
@media screen and (min-height: 34rem) and (min-width: 34rem) {
  .file-upload-img__placeholder__ext {
    font-size: 1.25rem
  }
  .file-upload-img__placeholder__name {
    font-size: 1rem
  }
}
@media screen and (min-height: 38rem) and (min-width: 36rem) {
  .file-upload-img__placeholder__ext {
    font-size: 1.5rem
  }
}
@media screen and (min-height: 42rem) and (min-width: 42rem) {
  .file-upload-img__placeholder__ext {
    font-size: 2rem
  }
}
@media screen and (min-height: 46rem) and (min-width: 44rem) {
}
@media screen and (min-height: 50rem) and (min-width: 50rem) {
}
@media screen and (min-height: 54rem) and (min-width: 54rem) {
}
</style>
