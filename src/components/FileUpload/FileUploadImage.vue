<script lang="ts">
import { getFieldID } from './FileUpload.utils';
import { fileUploadImgState } from './FileUpload';

export default {
  props: {
    accepted: { type: String, required: true },
    canMove: { type: Boolean, required: false, default: false },
    // fileData: { required: true },
    id: { type: String, required: true },
    pos: { type: Number, required: true },
    total: { type: Number, required: true },
    fileSize: { type: Number, required: true },
    fileSrc: { type: String, required: true },
    fileType: { type: String, required: true },
    fileName: { type: String, required: true },
    tooBig: { type: Boolean, required: true },
    surplus: { type: Boolean, required: true },
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
    // } else if (this.surplus === true) {
      this.wrapClass = 'file-upload-img__surplus'
    // }
  },
}

</script>

<template>
  <figure :class="wrapClass">
    <img :src="fileSrc" :alt="alt" />
    <button v-if="total > 1" v-on:click="deleteClick">Delete</button>
    <label v-if="surplus === false">
      Replace
      <input type="file" class="file-upload__input visually-hidden" :id="getID('extra-input')" :accept="accepted" v-on:change="replaceClick" />
    </label>
    <button v-if="isBad === false && canMove === true && pos > 0"
      v-on:click="moveLeftClick">Move left</button>
    <button v-if="isBad === false && canMove === true && pos < total" v-on:click="moveRightClick">Move right</button>
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
