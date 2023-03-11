<script lang="ts">
import { fileData, fileUploadState, replaceData } from './FileUpload.d';
import { defaultTypes, humanImplode, getAllowedTypes, humanFileSizeToBytes, getFieldID } from './FileUpload.utils';
// import { ImageBlobReduce } from '../../../node_modules/image-blob-reduce/dist/ima';
// import { ImageBlobReduce } from '../../../node_modules/image-blob-reduce/dist/image-blob-reduce.esm.mjs';
import  ImageBlobReduce from 'image-blob-reduce';
import FileUploadImage from './FileUploadImage.vue';
// import  ImageBlobReduce from '@types/image-blob-reduce';




export default {
    props: {
        helpTxt: { type: String, required: false, default: "" },
        id: { type: String, required: true },
        label: { type: String, required: true },
        maxFiles: { type: String, required: false, default: "1" },
        // Maximum size (in MB)
        maxPixels: { type: String, required: false, default: "1500" },
        maxSingle: { type: String, required: false, default: "5MB" },
        maxTotal: { type: String, required: false, default: "15MB" },
        minFiles: { type: String, required: false, default: "1" },
        reorder: { type: Boolean, required: false, default: false },
        types: { type: String, required: false, default: "png jpg webp pdf docx doc" },
    },
    data: function (): fileUploadState {
        return {
            accepted: "",
            active: false,
            allowedTypes: defaultTypes,
            badCount: 0,
            full: false,
            genericTypeList: "",
            goodCount: 0,
            humanTypeList: "",
            min: 1,
            max: 1,
            maxPx: 1500,
            nextUID: 0,
            primaryID: 0,
            processingCount: 0,
            uploadList: [],
            uploadHelp: "",
            singleMax: 5242880,
            tooBig: false,
            totalMax: 15728640,
        };
    },
    methods: {
        toggleActive: function (): void {
            this.active = !this.active;
            if (this.active === false) {
                this.uploadList = [];
            }
        },
        updateTypes: function (): void {
            const types = getAllowedTypes(this.types);
        },
        activeClass: function (cls1: string, cls2?: string): string {
            const output: string[] = ["file-upload__" + cls1];
            if (typeof cls2 !== "undefined") {
                output.push("file-upload__" + cls2);
            }
            if (this.active === true) {
                for (let a = 0; a < output.length; a += 1) {
                    output[a] = output[a] + " " + output[a] + "--active";
                }
            }
            return output.join(" ");
        },
        dialogueClass: function (): string {
            const mode: string = (this.uploadList.length === 0)
                ? "none"
                : "some";
            const clsName: string = "file-upload__dialogue";
            let output: string = clsName;
            if (this.active === true) {
                output += " " + clsName + "--active";
            }
            output += " " + clsName + "--" + mode;
            return output;
        },
        carouselClass: function (): string {
            const tmp = "file-upload__carousel";
            return `${tmp} ${tmp}--${this.uploadList.length}`;
        },
        getUID: function (): number {
            const output = this.nextUID;
            this.nextUID += 1;
            return output;
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
        getFiles: function (e: Event): void {
            const files = (e.target as HTMLInputElement).files;
            console.log("event:", e);
            console.log("event.target:", e.target);
            console.log("files:", files);
            // const selectedFiles = event.target.files;
            if (typeof files !== null) {
                for (let a = 0; a < (files as FileList).length; a += 1) {
                    this.processNewFile((files as FileList)[a]);
                }
            }
        },

        replaceFile: function (oldFileName : string, newFile : File) : void {
          let ok = false;
          for (let a = 0; a < this.uploadList.length; a += 1) {
            if (this.uploadList[a].name === oldFileName) {
              ok = true;
              this.uploadList[a].badType = (this.accepted.indexOf(newFile.type) === 0);
              this.uploadList[a].file = null;
              this.uploadList[a].lastModified = newFile.lastModified;
              this.uploadList[a].name = newFile.name;
              this.uploadList[a].ready = false;
              this.uploadList[a].size = newFile.size;
              this.uploadList[a].originalSize = newFile.size;
              this.uploadList[a].src = this.getTmpSrc(newFile.type);
              this.uploadList[a].tooBig = newFile.size > this.singleMax;
              this.uploadList[a].type = newFile.type;
            };

            this.processFileInner(this.uploadList[a], newFile);
            break;
          }

          if (ok === false) {
            throw new Error('could not find file ("' + oldFileName + '") to replace with "' + newFile.name + '"');
          }
        },

        getImgID: function (fileName : string) : string {
          const suffix = fileName.replace(/[^a-z0-9_-]/ig, '-')
          return this.id + '__' + suffix;
        },

        getTmpSrc: function (type: string): string {
            return "";
        },

        isImage: function (type: string): boolean {
            for (let a = 0; a < this.allowedTypes.length; a += 1) {
                if (this.allowedTypes[a].mime === type && this.allowedTypes[a].type === "image") {
                    return true;
                }
            }
            return false;
        },
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
        checkForSurplus: function (): void {
            let bad = 0;
            let good = 0;
            let totalBytes = 0;
            for (let a = 0; a < this.uploadList.length; a += 1) {
                if (this.uploadList[a].badType === false && this.uploadList[a].tooBig === false) {
                    good += 1;
                    this.uploadList[a].surplus = (good > this.max);
                    totalBytes += this.uploadList[a].size;
                }
                else {
                    bad += 1;
                }
            }
            this.goodCount = good;
            this.badCount = bad;
            this.full = (good > this.max);
            this.tooBig = (totalBytes > this.totalMax);
            this.uploadList.sort((a: fileData, b: fileData): number => {
                if (a.id > b.id) {
                    return 1;
                }
                else if (a.id < b.id) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
            // console.log('this:', this);
            console.log("this.uploadList:", this.uploadList);
        },
        processNewFile: function (file: File): void {
            const tmp: fileData = {
                id: this.getUID(),
                badType: this.accepted.indexOf(file.type) === 0,
                file: null,
                lastModified: file.lastModified,
                name: file.name,
                ready: false,
                size: file.size,
                originalSize: file.size,
                src: this.getTmpSrc(file.type),
                surplus: false,
                tooBig: file.size > this.singleMax,
                type: file.type
            };

            this.addFileToList(tmp);
            this.processFileInner(tmp, file);
        },

        processFileInner: function (data: fileData, file: File) {
          if (data.badType === false) {
                if (this.isImage(data.type)) {
                    const reduce = new ImageBlobReduce();
                    reduce.toBlob(file, { max: 1500 })
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
                        this.addFileToList(data);
                        this.checkForSurplus();
                    });
                }
                else {
                    data.file = file;
                    data.ready = true;
                    this.addFileToList(data);
                    this.checkForSurplus();
                }
            }
        },
        deleteCatch: function (fileName: string): void {
          console.group('FileUpload - deleteCatch()')
          console.log('fileName:', fileName);

          console.groupEnd();
          this.uploadList = this.uploadList.filter((file : fileData) => file.name !== fileName)
        },
        replaceCatch: function (e: replaceData): void {
          console.group('FileUpload - replaceCatch()')
          console.log('event:', e);
          console.groupEnd();
          this.replaceFile(e.oldName, e.newFile);
        },
        moveLeftCatch: function (e: Event): void {
          console.group('FileUpload - moveLeftCatch()')
          console.log('event:', e);
          console.groupEnd();
        },
        moveRightCatch: function (e: Event): void {
          console.group('FileUpload - moveRightCatch()')
          console.log('event:', e);
          console.groupEnd();
        },
        next: function (e: Event): void {
          const btn = (e.target as HTMLButtonElement);
          console.group('next()')
          console.log('event:', e);
          console.log('event.target:', e.target);
          console.log('btn:', btn);
          console.groupEnd();
        },
        previous: function (e: Event): void {
          const btn = (e.target as HTMLButtonElement);
          console.group('previous()')
          console.log('event:', e);
          console.log('event.target:', e.target);
          console.log('btn:', btn);
          console.groupEnd();
        },
        clearAll: function (e: Event): void {
          const btn = (e.target as HTMLButtonElement);
          console.group('moveLeft')
          console.log('event:', e);
          console.log('event.target:', e.target);
          console.log('btn:', btn);
          console.groupEnd();
        },
    },
    mounted: function (): void {
        this.allowedTypes = getAllowedTypes(this.types);
        const genericTypes: string[] = [];
        const typeList: string[] = [];
        let helpMsg: string = "";
        let s: string = ".";
        let sep = "";
        this.accepted = "";
        for (let a = 0; a < this.allowedTypes.length; a += 1) {
            if (genericTypes.indexOf(this.allowedTypes[a].type) === -1) {
                genericTypes.push(this.allowedTypes[a].type);
            }
            typeList.push(this.allowedTypes[a].name);
            this.accepted += sep + this.allowedTypes[a].mime;
            sep = ", ";
        }
        this.maxPx = parseInt(this.maxPixels);
        this.singleMax = humanFileSizeToBytes(this.maxSingle);
        this.totalMax = humanFileSizeToBytes(this.maxTotal);
        this.humanTypeList = humanImplode(typeList);
        this.genericTypeList = humanImplode(genericTypes);
        console.log("human file types:", this.humanTypeList);
        console.log("generic file types:", this.genericTypeList);
        // --------------------------------------------------------------
        // START: Prepare file input label text
        this.min = parseInt(this.minFiles);
        this.max = parseInt(this.maxFiles);
        if (this.max < 1) {
            this.max = 1;
            console.error("invalid maxFiles set");
        }
        if (this.min < 1) {
            this.min = 1;
            console.error("invalid minFiles set");
        }
        else if (this.min > this.max) {
            console.error("invalid minFiles set (minFiles cannot be greater than maxFiles)");
            this.min = this.max;
        }
        if (this.max > 100) {
            console.warn("unwise value for maxFiles set");
        }
        helpMsg = "Choose ";
        if (this.max > 1) {
            helpMsg += (this.min > 1)
                ? `at least ${this.min} and no more than ${this.max}`
                : `up to ${this.max}`;
            s = "s.";
        }
        else {
            helpMsg += "one";
        }
        // helpMsg += ` ${this.humanTypeList}`;
        helpMsg += ` file${s}`;
        this.uploadHelp = helpMsg;
        // END: Prepare file input label text
        // --------------------------------------------------------------
        console.log("this:", this);
        console.log("this.id:", this.id);
    },
    components: { FileUploadImage }
}
</script>

<template>
  <div class="file-upload">
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
      <main v-if="uploadList.length > 0">
        <ul :class="carouselClass()">
          <li v-for="(file, index) in uploadList" :key="`file-${file.name}`" class="file-upload__carousel__item">
            <FileUploadImage :accepted="accepted"
                             :id="getImgID(file.name)"
                             :pos="index"
                             :total="(uploadList.length - 1)"
                             :file-src="file.src"
                             :file-name="file.name"
                             :file-size="file.size"
                             :file-type="file.type"
                             :is-bad="file.badType"
                             :too-big="file.tooBig"
                             :surplus="file.surplus"
                             @delete="deleteCatch"
                             @replace="replaceCatch"
                             @moveleft="moveLeftCatch"
                             @moveright="moveRightCatch"></FileUploadImage>
            <!-- <img :src="file.src" :alt="file.name" /> -->
          </li>
        </ul>
      </main>
      <footer>
        <p v-if="uploadList.length === 0">
          <label :for="getID('main-input')" class="file-upload__label">{{ uploadHelp }}</label>
          <input type="file" class="file-upload__input visually-hidden" :id="getID('main-input')" :multiple="(max > 1) ? true : false" :accept="accepted" v-on:change="getFiles" />
        </p>
        <p v-else-if="goodCount > 0 && uploadList.length <= max && badCount === 0" class="file-upload__add-confirm">
          <label v-if="full === false" :for="getID('extra-input')" class="file-upload__add-confirm__btn">Add another file</label>
          <input type="file" class="file-upload__input visually-hidden" :id="getID('extra-input')" :multiple="(max > 1) ? true : false" :accept="accepted" v-on:change="getFiles" />
          <button v-on:click="$emit('confirm-upload')" class="file-upload__add-confirm__btn">Confirm and upload</button>
        </p>
        <p v-else-if="goodCount > 0 && (uploadList.length > max || badCount > 0)">
          Please remove invalid and/or excess files from upload list
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
  overflow: hidden;
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
  width: 5rem;
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
  padding: 2rem 1rem 2rem 2rem;
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
  justify-content: flex-end;
  /* justify-content: space-between; */
  column-gap: 2rem;
}
.file-upload__carousel {
  align-content: stretch;
  align-items: stretch;
  column-gap: 2rem;
  display: flex;
  flex-wrap: nowrap;
  list-style: none;
  margin: 0 -2rem;
  padding: 0;
  transform: translateX(-25%);
  /* border: 0.05rem solid #000; */
  white-space: nowrap;
}

.file-upload__carousel li {
  align-content: stretch;
  align-items: center;
  /* border: 0.05rem solid #000; */
  display: flex;
  display: inline-block;
  flex-direction: column;
  flex-grow: 1;
  padding: 0;
  margin: 0 1rem;
  width: 100%;

}

.file-upload__carousel img {
  display: block;
  width: 100%;
  max-width: 30rem;
  text-align: center;
  margin: 0 auto;
}

.file-upload__carousel--1 { width: 100%; }
.file-upload__carousel--1 li { width: 100%; }
.file-upload__carousel--2 { width: 200%; }
.file-upload__carousel--2 li { width: 50%; }
.file-upload__carousel--3 { width: 300%; }
.file-upload__carousel--3 li { width: 33.33%; }
.file-upload__carousel--4 { width: 100%; }
.file-upload__carousel--4 li { width: 25%; }
.file-upload__carousel--5 { width: 500%; }
.file-upload__carousel--6 { width: 600%; }
.file-upload__carousel--7 { width: 700%; }
.file-upload__carousel--8 { width: 800%; }
.file-upload__carousel--9 { width: 900%; }
.file-upload__carousel--10 { width: 1000%; }
.file-upload__carousel--11 { width: 1100%; }
.file-upload__carousel--12 { width: 1200%; }
.file-upload__carousel--13 { width: 1300%; }
.file-upload__carousel--14 { width: 1400%; }
.file-upload__carousel--15 { width: 1500%; }
.file-upload__carousel--16 { width: 1600%; }
</style>
