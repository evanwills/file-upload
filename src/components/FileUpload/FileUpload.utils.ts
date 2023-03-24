import { fileTypes } from './mimeTypes';
import { fileData, mimeType } from './FileUpload.d';

export const defaultTypes : mimeType[] = [
  fileTypes.png,
  fileTypes.jpg,
  fileTypes.webp,
  fileTypes.pdf,
  fileTypes.docx,
  fileTypes.doc,
];

/**
 * Get list of allowed file types separated list of file extensions
 *
 * @param types Space separated list of file extensions
 *
 * @returns List of allowed file types user can upload
 */
export const getAllowedTypes = (types: string) : mimeType[] => {
  const good : string[] = [];
  const output : mimeType[] = [];
  const bad : string[] = [];
  // console.group('getAllowedTypes()')
  // console.log('types:', types);

  const typeList = types.replace(/[\t\n\r\s :;|,]+/g, ' ').trim().split(' ');
  // console.log('typeList:', typeList)

  if (typeList.length > 0) {
    for (let a = 0; a < typeList.length; a += 1) {
      const ext = typeList[a].toLowerCase().replace(/[^a-z0-9]+/, '').substring(0, 4);

      if (typeof fileTypes[typeList[a]] !== 'undefined') {
        if (good.indexOf(ext) === -1) {
          good.push(ext);
          output.push(fileTypes[typeList[a]])
        }
      } else {
        if (bad.indexOf(typeList[a]) === -1) {
          bad.push(typeList[a]);
        }
      }
    }

    // console.log('output:', output)
    // console.log('good:', good)
    // console.log('bad:', bad)

    if (good.length === 0) {
      console.error(
        'Bad file mime types specified in <file-upload> component: "' + bad.join('", "') + '"'
      );
      // console.groupEnd()
      return defaultTypes;
    } else {
      // console.groupEnd()
      return output;
    }
  } else {
    // console.groupEnd()
    return defaultTypes;
  }
};

export const getFileExt = (file: File) : string => {
  for (const prop in fileTypes) {
    if (file.type === fileTypes[prop].mime) {
      return fileTypes[prop].name;
    }
  }

  return file.name.replace(/^.*?\.(?=[^.]+$)/i, '');
  throw new Error('Could not find allowed type matching "' + file.type + '"')
}

/**
 * Get a unique ID to user as the value for a label's `for`
 * attribute and an ID for the associated input field.
 *
 * @param id     parent ID to append to prepend output ID
 * @param suffix string to append to parent ID
 *
 * @returns a string to use as an input field ID
 */
export const getFieldID = (id: string, suffix: string) : string => {
  return `${id}--${suffix}`;
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
  const bits = humanSize.match(/([0-9.]+)([KMG]?B)?/)
  const output = (2 * (1024 ^ 2));
  const errorMsg = 'Invalid file size found. Could not convert "' +
                   humanSize + '" to Bytes';

  if (bits === null) {
    console.error(errorMsg);
    return output;
  } else {
    const num = parseFloat(bits[1]);
    const unit = (typeof bits[2] === 'string' && bits[2] !== '')
      ? bits[2]
      : 'B';

    const i = units.indexOf(unit);

    if (i > -1 && num > 0) {
      return Math.round(num * (1024 ** i));
    } else {
      console.error(errorMsg);
      return (2 * (1024 ** 2));
    }
  }
};

export const humanImplode = (input : string[], last : string = 'or') : string => {
  return input.join(', ').replace(/, (?=[^,]+$)/i, ` ${last} `);
}

export const imgIsPortrait = (newImg: File) : Promise<boolean> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.onloadeddata = () => {
      resolve(img.height > img.width);
    }
    img.src = URL.createObjectURL(newImg);
  })
}

/**
 * Check whether a file has a bad MIME type (and so cannot be uploaded)
 *
 * @param type         Mime type of file being tested
 * @param allowedTypes List of allowed mime types
 *
 * @returns FALSE if file can be uploaded. TRUE otherwise
 */
export const isBadType = (type : string, allowedTypes : mimeType[]) : boolean => {
  for (let a = 0; a < allowedTypes.length; a += 1) {
    if (allowedTypes[a].mime === type) {
      return false;
    }
  }
  return true;
}

/**
 * Move a file up or down the list of user selected files
 *
 * @param uploadFiles List of user selected files
 * @param fileName    Name of the file to be matched
 * @param next        Amount to increment the current index by
 *
 * @returns Index of the file matched by name
 */
export const moveFile = (uploadFiles : fileData[], fileName : string, next: number) : fileData[] => {
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
    'could not file in uploadFiles matching name "' + fileName + '"'
  );
}
