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
  },

  data: function () : fileUploadImgState {
    return {
      isBad: false,
      wrapClass: '',
      alt: '',
    }
  },

  methods: {
    deleteClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      console.group('Image - delete()')
      console.log('event:', e);
      console.log('event.target:', e.target);
      console.log('btn:', btn);
      console.groupEnd();
      this.$emit('delete', this.fileName);
    },
    moveLeftClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      console.group('Image - moveLeft()')
      console.log('event:', e);
      console.log('event.target:', e.target);
      console.log('btn:', btn);
      console.groupEnd();
      this.$emit('moveleft', this.fileName);
    },
    moveRightClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      console.group('Image - moveRight()')
      console.log('event:', e);
      console.log('event.target:', e.target);
      console.log('btn:', btn);
      console.groupEnd();
      this.$emit('moveright', this.fileName);
    },
    replaceClick: function (e: Event) : void {
      const btn = (e.target as HTMLButtonElement);
      console.group('Image - replace()')
      console.log('event:', e);
      console.log('event.target:', e.target);
      console.log('btn:', btn);
      console.groupEnd();
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
  },

  mounted: function () : void {
    console.group('FileUploadImage.mounted()')
    console.groupEnd();
    // if (this.tooBig === true || this.badType === true) {
      this.isBad = true;

      this.wrapClass = 'file-upload-img__bad'
    // } else if (this.isSurplus === true) {
      this.wrapClass = 'file-upload-img__surplus'
    // }
  },
}

</script>

<template>
  <figure :class="wrapClass">
    <img v-if="fileSrc !== ''" :src="fileSrc" :alt="alt" />
    <span v-else class="file-upload-img__placeholder"></span>
    <button v-if="total > 1" v-on:click="deleteClick">Delete</button>
    <label v-if="isSurplus === false" class="file-upload-img__replace">
      Replace
      <input type="file" class="visually-hidden" :id="getID('extra-input')" :accept="accepted" v-on:change="replaceClick" />
    </label>
    <button v-if="isBad === false && canMove === true && pos > 0"
      v-on:click="moveLeftClick">Move left</button>
    <button v-if="isBad === false && canMove === true && pos < total" v-on:click="moveRightClick">Move right</button>
    <figcaption>
      <span class="visually-hidden"></span>
      <p v-if="isTooBig === true"></p>
    </figcaption>
  </figure>
</template>

<style>
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
</style>
