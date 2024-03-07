import { ImageBlobReduce } from "image-blob-reduce"
import { ImageBlobReduce } from "../../types/ImageBlobReduce.d"

/**
 * Object for holding metadata about a file plus a File object (if
 * the file is OK to upload)
 *
 * @type {TFileData}
 */
export type TFileData = {
  /**
   * Whether or not the file type is allowed by the client
   */
  badType: boolean,
  /**
   * File extention for file type being uploaded
   *
   * @property {string} ext
   */
  ext: string,
  /**
   * File object to be uploaded
   *
   * @property {File|null} file
   */
  file: File|null,
  /**
   * Whether or not the file came from device camera
   *
   * @property {boolean}
   */
  fromCamera: boolean,
  /**
   * Position within the list of selected files
   *
   * @property {number} id
   */
  id: number,
  /**
   * Date & time the file was last modified
   */
  lastModified: Date|number,
  /**
   * File name (from user's file system)
   *
   * @property {string} name
   */
  name: string,
  /**
   * The orgiinal file size (in Bytes) before processing
   *
   * @property {string} originalSize
   */
  originalSize: number,
  /**
   * Whether or not the (image) file has a portrait aspect ratio
   *
   * @property {boolean} ready
   */
  isPortrait: boolean,
  /**
   * Whether or not the file is ready to be uploaded.
   * Will be FALSE while images are being resized
   *
   * @property {boolean} ready
   */
  ready: boolean,
  /**
   * Whether or not to force a reload of the component
   *
   * @property {boolean} relaod
   */
  reload: boolean,
  /**
   * Whether or not this file has focus
   *
   * @property {boolean} Selected
   */
  selected: boolean,
  /**
   * Current file size (in Bytes)
   *
   * @property {string} size
   */
  size: number,
  /**
   * Data URL to provide to image tag
   *
   * @property {string} src
   */
  src: string,
  /**
   * Whether or not this file is surplus to needs
   * (i.e. user has already selected too many files to upload)
   *
   * @property {boolean} tooBig
   */
  surplus: boolean,
  /**
   * Whether or not the file size is larger than the permitted size
   * for that generic type
   *
   * @property {boolean} tooBig
   */
  tooBig: boolean,
  /**
   * File mime type (from uploaded file's `type` property)
   *
   * @property {string} name
   */
  type: string,
}

export type TFileUploadState = {
  /**
   * List of accepted mime types of files user is allowed to upload
   *
   * @property {string} accepted
   */
  accepted: string,
  /**
   * Whether or not the main file upload UI is active
   *
   * @property {boolean} active
   */
  active: boolean,
  /**
   * List of file MIME types user can upload
   *
   * @property {TMimeType[]} allowedTypes
   */
  allowedTypes: TMimeType[],
  /**
   * Number of invalid files user has selected
   * (they may be wrong type or too large)
   *
   * @property {number} badCount
   */
  badCount: number,
  /**
   * Whether or not the user can confirm their selection of files
   * and send them to the server
   *
   * > __Note:__ Only TRUE if there are no bad files, and total
   * >           upload size is within maximum upload limit.
   * >           OR
   * >           `auto-exclue` attribute is present
   *
   * @property {boolean} canConfirm
   */
  canConfirm: boolean,
  /**
   * Number of pixels wide the window is
   *
   * @property {number} carouselOffset
   */
  carouselOffset: number,
  /**
   * Text to render when user is asked to either confirm or cancel
   * upload
   *
   * @property {string} confirmText
   */
  confirmText: string
  /**
   * Whether or not the confirmation screen is for confirming upload
   * or confirming abandonment of upload
   *
   * @property {boolean} confirmUpload
   */
  confirmUpload: boolean,
  /**
   * Whether or not whether or not to set the focus on "Previous"
   * button when the carousel opens
   *
   * @property {boolean} doAutofocus
   */
  doAutofocus: boolean,
  /**
   * Whether or not the user has already selected the maximum number
   * of (valid) files they can
   *
   * @property {boolean} full
   */
  full: boolean,
  /**
   * List of generic file types to show in hidden button text
   *
   * @property {string} genericTypeList
   */
  genericTypeList: string,
  /**
   * Number of valid files user has selected
   * (files that are small enough and of the right type)
   *
   * @property {number} goodCount
   */
  goodCount: number,
  /**
   * List of human readable file types to show user
   *
   * @property {string} humanTypeList
   */
  humanTypeList: string,
  /**
   * Object used to reduce image file sizes
   *
   * @property {ImageBlobReduce|null} imgReduce
   */
  imgReduce: ImageBlobReduce|null,
  /**
   * Maximum number of files user may upload
   *
   * @property {number} max
   */
  max: number,
  /**
   * Maximum number of pixels (in either X or Y dimension) an image
   * should be after processing
   *
   * @property {number} maxPx
   */
  maxPx: number,
  /**
   * Minimum number of files user may upload
   *
   * @property {number} min
   */
  min: number,
  /**
   * Unique ID for files (is incremented each time a file is selected)
   *
   * @property {number} nextUID
   */
  nextUID: number,
  /**
   * How many images are currently being processed
   *
   * @property {number} processingCount
   */
  processingCount: number,
  /**
   * The object representing the file currently in prime position
   * in the carousel
   *
   * @property {fileData|null} selected
   */
  selected: fileData | null,
  /**
   * The index of the file currently in prime position in the
   * carousel array.
   *
   * @property {number} selectedKey
   */
  selectedKey: number,
  /**
   * Whether or not files are being selected
   *
   * @property {boolean} selectingFiles
   */
  selectingFiles: boolean,
  /**
   * Whether or not to render the confirmation screen
   *
   * @property {boolean} showConfirm
   */
  showConfirm: boolean,
  /**
   * Maximum number of bytes a single file can be
   *
   * @property {number} singleMax
   */
  singleMax: number,
  /**
   * Whether the total number of bytes is greater than the allowed maximum
   *
   * @property {boolean} tooBig
   */
  tooBig: boolean,
  /**
   * Maximum number of bytes the combined size of all selected
   * file can be
   *
   * @property {number} totalMax
   */
  totalMax: number,
  /**
   * Generated help text to guide users in how many and which types
   * of files can be uploaded
   *
   * @property {string} uploadHelp
   */
  uploadHelp: string,
  /**
   * List of files user has selected to upload
   *
   * @property {fileData[]} uploadList
   */
  uploadList: fileData[],
}

export type TFileUploadImgState = {
  isBad: boolean,
  wrapClass: string,
  alt: string,
  _ext: string,
  _fileName: string,
  _fileOpen: boolean,
}

/**
 * List of mime types available
 *
 * @var {object}
 */
export type TMimeTypeList = {
  [index: string]: TMimeType
}

export type TMimeType = {
  /**
   * File Extension
   *
   * @property {string} ext
   */
  ext: string,
  /**
   * File mime type
   *
   * @property {string} mime
   */
  mime: string,
  /**
   * Human readable name for file type
   *
   * @property {string} name
   */
  name: string,
  /**
   * generic type of file (e.g. image, audio, video, document, etc)
   *
   * @property {string} type
   */
  type: string,
}

export type TReplaceData = {
  oldName: string,
  newFile: File
}


export type TSvgData = {
  errorCount: number,
  error1a: string,
  error1b: string,
  error2a: string,
  error2b: string
}
