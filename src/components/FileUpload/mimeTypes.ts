
import { mimeList } from './FileUpload.d';


/**
 * List of possible acceptible file types user can upload
 *
 * List is used to validate contents of props.types property
 *
 * * __key:__ the file extension string
 * * __value:__ the file MIME type - used when validating an selected file
 *
 * @var {object} fileTypes
 */
export const fileTypes : mimeList = {
  png: {
    mime: 'image/png',
    name: 'PNG',
    type: 'image'
  },
  jpg: {
    mime: 'image/jpeg',
    name: 'JPEG',
    type: 'image'
  },
  jpeg: {
    mime: 'image/jpeg',
    name: 'JPEG',
    type: 'image'
  },
  webp: {
    mime: 'image/webp',
    name: 'WebP',
    type: 'image'
  },
  pdf: {
    mime: 'application/pdf',
    name: 'PDF',
    type: 'document',
  },
  doc: {
    mime: 'application/msword',
    name: 'Old Microsoft Word',
    type: 'document',
  },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    name: 'Microsoft Word',
    type: 'document',
  },
  rtf: {
    mime: 'application/rtf',
    name: 'Rich Text Format',
    type: 'document',
  },
  svg: {
    mime: 'image/svg+xml',
    name: 'SVG',
    type: 'image',
  },
  txt: {
    mime: 'text/plain',
    name: 'Text',
    type: 'document',
  },

  aac: {
    mime: 'audio/aac',
    name: 'AAC',
    type: 'audio',
  },
  avi: {
    mime: 'video/x-msvideo',
    name: 'AVI',
    type: 'video',
  },
  azw: {
    mime: 'application/vnd.amazon.ebook',
    name: 'Kindle',
    type: 'document',
  },
  bmp: {
    mime: 'image/bmp',
    name: 'Bitmap',
    type: 'image',
  },
  csv: {
    mime: 'text/csv',
    name: 'CSV',
    type: 'document',
  },
  epub: {
    mime: 'application/epub+zip',
    name: 'EPub',
    type: 'document',
  },
  gif: {
    mime: 'image/gif',
    name: 'Gif',
    type: 'image',
  },
  ico: {
    mime: 'image/vnd.microsoft.icon',
    name: 'Icon',
    type: 'image',
  },
  mid: {
    mime: 'audio/midi',
    name: 'MIDI',
    type: 'audio',
  },
  midi: {
    mime: 'audio/x-midi',
    name: 'MIDI',
    type: 'audio',
  },
  mp3: {
    mime: 'audio/mpeg',
    name: 'MP3',
    type: 'audio',
  },
  mp4: {
    mime: 'video/mp4',
    name: 'MP4',
    type: 'video',
  },
  mpeg: {
    mime: 'video/mpeg',
    name: 'MPEG',
    type: 'video',
  },
  oga: {
    mime: 'audio/ogg',
    name: 'Ogg audio',
    type: 'audio',
  },
  ogv: {
    mime: 'video/ogg',
    name: 'Ogg video',
    type: 'video',
  },
  opus: {
    mime: 'audio/opus',
    name: 'Opus',
    type: 'audio',
  },
  ppt: {
    mime: 'application/vnd.ms-powerpoint',
    name: 'Powerpoint (old)',
    type: 'document',
  },
  pptx: {
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    name: 'Powerpoint',
    type: 'document',
  },
  tif: {
    mime: 'image/tiff',
    name: 'tif',
    type: 'image',
  },
  tiff: {
    mime: 'image/tiff',
    name: 'tiff',
    type: 'image',
  },
  wav: {
    mime: 'audio/wav',
    name: 'wav',
    type: 'audio',
  },
  weba: {
    mime: 'audio/webm',
    name: 'weba',
    type: 'audio',
  },
  webm: {
    mime: 'video/webm',
    name: 'webm',
    type: 'video',
  },
  xls: {
    mime: 'application/vnd.ms-excel',
    name: 'Excel (old)',
    type: 'document',
  },
  xlsx: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'Excel',
    type: 'document',
  },
}
