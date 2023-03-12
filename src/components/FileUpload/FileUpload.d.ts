/**
 * Object for holding metadata about a file plus a File object (if
 * the file is OK to upload)
 *
 * @type {fileData}
 */
export type fileData = {
  /**
   * Whether or not the file type is allowed by the client
   *
   * @property {boolean} badType
   */
  badType: boolean,
  /**
   * File object to be uploaded
   *
   * @property {File|null} file
   */
  file: File|null,
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
   * Whether or not the file is ready to be uploaded.
   * Will be FALSE while images are being resized
   *
   * @property {boolean} ready
   */
  ready: boolean,
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

export type fileUploadState = {
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
   * @property {mimeType[]} allowedTypes
   */
  allowedTypes: mimeType[],
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
   * @property {boolean} canConfirm
   */
  canConfirm: boolean,
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
   * @property {number} badCount
   */
  goodCount: number,
  /**
   * List of human readable file types to show user
   *
   * @property {string} humanTypeList
   */
  humanTypeList: string,
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
   * @property {number} uid
   */
  nextUID: number,
  /**
   * The ID of the file in focus on the carousel
   *
   * @property {number} primnaryID
   */
  focusIndex: number,
  /**
   * How many images are currently being processed
   *
   * @property {number} processingCount
   */
  processingCount: number,
  /**
   * List of files user has selected to upload
   *
   * @property {fileData[]} uploadList
   */
  uploadList: fileData[],
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
}

export type fileUploadImgState = {
  isBad: boolean,
  wrapClass: string,
  alt: string,
}

/**
 * List of mime types available
 *
 * @var {object}
 */
export type mimeList = {
  [index: string]: mimeType
}

export type mimeType = {
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
  type: string
}

export type replaceData = {
  oldName: string,
  newFile: File
}
