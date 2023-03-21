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

      return (this.isReady)
        ? `${tmp} ${tmp}--processing`
        : tmp;
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
    <figcaption>
      <span  class="file-upload-img__pos">{{ (pos + 1) }}</span>
      <span class="visually-hidden">{{ fileName }}</span>
      <p v-if="isTooBig === true" class="file-upload-img__bad">This file is too large to be uploaded. Please replace it with a smaller version or delete it from the upload list</p>
      <p v-if="isBadType === true" class="file-upload-img__bad-msg">You cannot upload a <code>.{{ ext }}</code> type file. Please delete or replace it.</p>
      <p v-if="isSurplus === true" class="file-upload-img__bad-msg">There are already too many files in the list. Either move this file up the list or delete it.</p>
    </figcaption>
    <img v-if="fileSrc !== ''" :src="fileSrc" :alt="alt" />
    <div v-else :class="getPlaceholderClass()">
      <span>{{ ext }}</span>
      <span v-html="_fileName"></span>
    </div>
    <span v-if="isReady || isBad" :class="getBtnBlockClass()">
      <button v-if="canMove === true && isBad === false && pos > 0"
        v-on:click="moveLeftClick" class="file-upload-img__left" :tabindex="(isFocused === false) ? -1 : undefined">Move left</button>
      <button v-if="canMove === true && isBad === false && pos < (total - 1)" v-on:click="moveRightClick" class="file-upload-img__right" :tabindex="(isFocused === false) ? -1 : undefined">Move right</button>
      <label v-if="isSurplus === false" class="file-upload-img__replace">
        Replace
        <input type="file" class="visually-hidden" :id="getID('extra-input')" :accept="accepted" v-on:change="replaceClick" :tabindex="(isFocused === false) ? -1 : undefined" />
      </label>
      <button v-if="total > 1 || isBad" v-on:click="deleteClick" class="file-upload-img__delete" :tabindex="(isFocused === false) ? -1 : undefined">Delete</button>
    </span>
  </figure>
</template>

<style>
.file-upload-img {
  box-sizing: border-box;
  display: flex;
  margin: 0;
  overflow-y: auto;
  padding: 0;
  position: relative;
  flex-direction: column;
  height: 100%;
}
.file-upload-img--bad {
  padding: 0 0 2rem;
}
.file-upload-img > img {
  display: block;
  height: auto;
  max-width: calc(100% - 2rem);
  margin: 0 auto;
  text-align: center;
  width: auto;
}
.file-upload-img > figcaption {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

}
.file-upload-img__btn-block {
  bottom: 0;
  box-sizing: border-box;
  column-gap: 1rem;
  display: flex;
  /* display: block; */
  flex-wrap: wrap;
  justify-content: center;
  /* left: 50%; */
  opacity: 0;
  padding: 0.5rem 0;
  row-gap: 0.5rem;
  transition: opacity ease-in-out 0.3s;
  /* transform: translateX(-50%); */
  /* position: absolute; */
  white-space: normal;
  text-align: center;
  width: 100%;
}
.file-upload-img__btn-block--show {
  opacity: 1;
}
.file-upload-img__bad img {
  position: relative;
}
.file-upload-img__bad img::after {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 0, 0, 0.8);
}
.file-upload-img__replace {
  background-color: #000;
  border-radius: 0.5rem;
  color: #fff;
  padding: 0.6em 1.2em;
  order: -1;
}
.file-upload-img__replace:focus-within {
  outline: 0.2rem solid #00b;
  /* outline-offset: 0.1rem; */
}
.file-upload-img__left {
  order: -2;
}
.file-upload-img__right {
  order: 1;
}
.file-upload-img__placeholder {
  background-color: #eee;
  border: 0.3rem solid #aaa;
  border-radius: 0.5rem;
  color: #888;
  font-family: 'Courier New', Courier, monospace;
  margin: 0 auto;
  padding-bottom: 1rem;
  text-align: center;
  width: 80%;
  white-space: normal;
}
.file-upload-img__placeholder > span:first-child  {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 5rem 0.5rem 2rem;
  margin: 0 auto;
}
.file-upload-img__bad-msg {
  background-color: rgba(185, 0, 0, 0.7);
  color: #fff;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  margin: 0 2rem 0.5rem;
  white-space: normal;
  max-width: 20rem;
}
.file-upload-img__pos {
  position: absolute;
  text-align: center;
  width: 1.6rem;
  height: 1.6rem;
  background-color: #009;
  border-radius: 50%;
  color: #fff;
  top: 0rem;
  left: 0rem;
  font-size: 0.8rem;
  line-height: 1.4rem;
  border: 0.15rem solid #fff;
}

@media screen and (min-width: 30rem) {
  .file-upload-img > img {
    height: auto;
    max-height: 20rem;
    max-width: 20rem;
    width: auto;
  }
  .file-upload-img__placeholder > span:first-child {
    font-size: 2rem;
    padding: 7rem 1rem 4rem;
  }
}
</style>
