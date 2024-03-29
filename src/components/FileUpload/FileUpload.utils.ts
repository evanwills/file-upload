import mimeTypes from './mimeTypes';
import { TFileData, TMimeType, TMimeTypeList } from '../../types/FileUpload.d';
import imageReducer from 'image-blob-reduce';
import imageBlobReduce from '../../types/ImageBlobReduce.d';
import { Pica } from '../../types/Pica.d';

export const defaultTypes : TMimeType[] = [
  mimeTypes.png,
  mimeTypes.jpg,
  mimeTypes.webp,
  mimeTypes.pdf,
  mimeTypes.docx,
  mimeTypes.doc,
];

/**
 * Get list of allowed file types separated list of file extensions
 *
 * @param types Space separated list of file extensions
 *
 * @returns List of allowed file types user can upload
 */
export const getAllowedTypes = (types: string) : TMimeType[] => {
  /**
   * List of good file extensions
   *
   * @var good
   */
  const good : string[] = [];
  /**
   * List of allowed file type metadata objects
   */
  const output : TMimeType[] = [];
  const bad : string[] = [];
  const typeList = types.replace(/[\t\n\r\s :;|,]+/g, ' ').trim().split(' ');

  const allowedMime : TMimeTypeList = {};
  const extensions = Object.keys(mimeTypes);

  for (let a = 0; a < extensions.length; a += 1) {
    allowedMime[mimeTypes[extensions[a]].mime] = mimeTypes[extensions[a]];
  }

  if (typeList.length > 0) {
    for (let a = 0; a < typeList.length; a += 1) {
      const ext = typeList[a].toLowerCase().replace(/[^a-z0-9]+/, '').substring(0, 4);

      if (typeof mimeTypes[typeList[a]] !== 'undefined') {
        if (good.indexOf(ext) === -1) {
          // only push new mime types
          good.push(ext);
          output.push(mimeTypes[typeList[a]]);
        }
      } else if (typeof allowedMime[typeList[a]] !== 'undefined') {
        if (good.indexOf(allowedMime[typeList[a]].mime) === -1) {
          good.push(allowedMime[typeList[a]].ext);
          output.push(allowedMime[typeList[a]]);
        }
      } else if (bad.indexOf(typeList[a]) === -1) {
        bad.push(typeList[a]);
      }
    }

    if (good.length === 0) {
      // eslint-disable-next-line no-console
      console.error(
        'Bad file mime types specified in <file-upload> component: '
        + `"${bad.join('", "')}"`,
      );

      return defaultTypes;
    }
    return output;
  }
  return defaultTypes;
};

export const getFileExt = (file: File) : string => {
  const keys = file;
  for (let a = 0; a < keys.length; a += 1) {
    if (file.type === mimeTypes[keys[a]].mime) {
      return mimeTypes[keys[a]].ext;
    }
  }

  return file.name.replace(/^.*?\.(?=[^.]+$)/i, '');
  // throw new Error('Could not find allowed type matching "' + file.type + '"');
};

/**
 * Get a unique ID to user as the value for a label's `for`
 * attribute and an ID for the associated input field.
 *
 * @param id     parent ID to append to prepend output ID
 * @param suffix string to append to parent ID
 *
 * @returns a string to use as an input field ID
 */
export const getFieldID = (id: string, suffix: string) : string => `${id}--${suffix}`;

/**
 * Get singleton ImageBlobReduce object.
 *
 * If `jpegLevel` is greater than 0, add extra config to force
 * output to JPEG compression level
 *
 * @returns an ImageBlobReduce object that's ready to use
 */
export const getImgBlobReduce = (
  imgReduce : imageBlobReduce.ImageBlobReduce|null,
  jpgLevel : number = 0
) : imageBlobReduce.ImageBlobReduce => {
  if (imgReduce !== null) {
    return imgReduce;
  }

  const output = new imageReducer(); // eslint-disable-line new-cap

  if (jpgLevel > 0) {
    output._create_blob = async (env: imageBlobReduce.Env) => env.pica.toBlob(
      env.out_canvas as HTMLCanvasElement,
      'image/jpeg',
      jpgLevel,
    ).then((blob: Blob) : imageBlobReduce.Env => {
      env.out_blob = blob; // eslint-disable-line no-param-reassign
      return env;
    });
  }

  return output;
};

/**
 * Convert human readable file size into bytes so it can be compared
 * to File.size values
 *
 * @param humanSize Human readable file size
 *
 * @returns file size in Bytes
 */
export const humanFileSizeToBytes = (humanSize: string) : number => {
  const units = ['B', 'KB', 'MB', 'GB'];
  const bits = humanSize.match(/([0-9.]+)([KMG]?B)?/);
  const output = (2 * (1024 * 2024));
  const errorMsg = 'Invalid file size found. Could not convert '
    + `"${humanSize}" to Bytes`;

  if (bits === null) {
    // eslint-disable-next-line no-console
    console.error(errorMsg);
    return output;
  }

  const num = parseFloat(bits[1]);
  const unit = (typeof bits[2] === 'string' && bits[2] !== '')
    ? bits[2]
    : 'B';

  const i = units.indexOf(unit);

  if (i > -1 && num > 0) {
    return Math.round(num * (1024 ** i));
  }

  // eslint-disable-next-line no-console
  console.error(errorMsg);
  return (2 * (1024 ** 2));
};

export const humanImplode = (input : string[], last : string = 'or') : string => input
  .join(', ')
  .replace(/, (?=[^,]+$)/i, ` ${last} `);

export const imgIsPortrait = (newImg: File) : Promise<boolean> => new Promise((resolve) => {
  const img = document.createElement('img');
  img.onloadeddata = () => {
    resolve(img.height > img.width);
  };

  img.src = URL.createObjectURL(newImg);
});

/**
 * Check whether a file has a bad MIME type (and so cannot be uploaded)
 *
 * @param type         Mime type of file being tested
 * @param allowedTypes List of allowed mime types
 *
 * @returns FALSE if file can be uploaded. TRUE otherwise
 */
export const isBadType = (type : string, allowedTypes : TMimeType[]) : boolean => {
  for (let a = 0; a < allowedTypes.length; a += 1) {
    if (allowedTypes[a].mime === type) {
      return false;
    }
  }

  return true;
};

/**
 * Move a file up or down the list of user selected files
 *
 * @param uploadFiles List of user selected files
 * @param fileName    Name of the file to be matched
 * @param next        Amount to increment the current index by
 *
 * @returns Index of the file matched by name
 */
export const moveFile = (uploadFiles :TFileData[], fileName : string, next: number) :TFileData[] => {
  for (let a = 0; a < uploadFiles.length; a += 1) {
    if (uploadFiles[a].name === fileName) {
      const from = a;
      const to = a + next;
      const item = uploadFiles[from];
      uploadFiles.splice(from, 1);
      uploadFiles.splice(to, 0, item);

      return uploadFiles;
    }
  }

  throw new Error(
    `could not file in uploadFiles matching name "${fileName}}"`,
  );
};
