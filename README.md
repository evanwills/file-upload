# FileUpload

* [Introduction](#introduction)
* [User interface](#user-interface)
* [Attributes](#attributes)
* [Accessibility](#accessibility)
  * [Access keys](#access-keys)
  * [Keyboard shortcuts](#keyboard-shortcuts)
* [Events](#events)
* [Dependencies](#dependencies)
* [Vue, Typescript & Vite](#vue-3--typescript--vite)

----

## Introduction

`FileUpload` is a [Vue.js](https://v3.vuejs.org/) component that 
provides a fancy user interface for uploading one or more files of 
specified types and (for images) having the images resized in the 
browser before they're sent to the server.

> __Note:__ `FileUpload` does not handle anything to do with sending 
>           the files to the server.
>
> When the user confirms they are happy with their selection, a 
> [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList)
> object containing all the valid selected files is created  and made
> available and a `confirmupload` event is emitted. It is then up to 
> the parent component to handle sending the files to the server.

----

## User interface

1. The user clicks on the Upload button. 
2. A modal pops up over the page with some basic info what they 
   should upload and with with a "Choose files" button.
3. User chooses one or more files.
4. A carousel is displayed showing the selected files.
   * If the file is an image and is larger than allowed, it will be
     resized. While it is being resized, a placeholder image is shown
     with some animation to indicate something is happening.
   * Once the image has been resized, it will be displayed.
   * For valid non-image files a placeholder will be shown
   * For files/images that are too large or a forbidden type 
     (or both) a placeholder will be shown indicating that there is
     a  problem and what the poblem is.
5. The carousel can be moved left and right so a different file/image 
   is in focus.
6. When an image/file has focus in the carousel, extra controls are 
   shown for that image/file:
   * (If enabled) the image/file can be moved left or right relative 
     to its neighbour.
   * The image/file can be replaced with a different image/file from 
     the file system.
   * The image/file can be deleted. (removed from the upload list.)
7. (unless `auto-exclude` is set) The user will be required to remove any files that are over-sized, a forbidden file type or in excess of the maximum number of files allowed. Or if the maximum total upload size is exceeded.
8. Once all bad files are removed the user can click the "Confirm and upload" button.

---

## Attributes

### `id`

|  Required  |    Type    |   Default:   | Variable name |
|------------|------------|--------------|---------------|
| _required_ | _{string}_ | _no default_ |     `id`      |

Prepended to the IDs of component's buttons and input fields to make 
it easy to add accessibility features to those buttons and input 
fields. It gives the user the ability to preview their selection and 
(if multiple files are selected change their order in the list). 
It also allows selected files to be removed and new files added 
before selection is confirmed.

### `label`

|  Required  |    Type    |   Default:   | Variable name |
|------------|------------|--------------|---------------|
| _required_ | _{string}_ | _no default_ |    `label`    |

Used as title for the file upload modal block

### `auto-exclude`

|  Required  |    Type     | Default | Variable name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` | `autoExclude` |

Whether or not to auto exclude bad files from the confirmed list of 
files. By default, the user must conciously remove any bad files 
before they can upload anything to the server. By setting 
`auto-exclude` to `TRUE`, the component automatically strips any 
disallowed files from the list it sends to the server.

### `confirm-cancel`

|  Required  |    Type     | Default | Variable name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` | `confirmCancel` |

Whether or not the user should be asked to confirm that they really 
want to cancel the upload before all the data is dumped.

### `help-txt`

|  Required  |    Type    |  Default:  | Variable name |
|------------|------------|------------|---------------|
| _optional_ | _{string}_ | "" (empty) |   `helpTxt`   |

Help text to show end user to help them select appropriate files they
should upload.

### `max-files`

|  Required  |    Type    | Default | Variable name |
|------------|------------|---------|---------------|
| _optional_ | _{number}_ |   `1`   |  `maxFiles`   |

Maximum number of valid files a user can upload at one time. 
(Can be any positive integer.)

If `max-files` is set to 0, `max-files` will be forced to 999 
(effectively unlimited).

> __Note:__ __`max-files` is overridden by `unlimited`.

If you want to allow users to upload more than 999 files in one go, 
do __*NOT*__ use `unlimited`.<br />
Instead, you must specify using `max-files` e.g. 
```
max-files="1234"
``` 
Which will allow the user to upload 1,234 files (instead of the 
default maximum of 999).

> __Note:__ *I think it's a really bad idea to allow a user to*
>           *upload more than about 20 files at once but I can see*
>           *there are plenty of usecases where that might be* 
>           *appropriate.*

### `min-files`

|  Required  |    Type    | Default | Variable name |
|------------|------------|---------|---------------|
| _optional_ | _{number}_ |   `1`   |  `minFiles`   |

Minimum number of valid files a user must upload at one time.

### `max-pixels`

|  Required  |    Type    | Default | Variable name |
|------------|------------|---------|---------------|
| _optional_ | _{number}_ | `1500`  |  `maxPixels`  |

Maximum number of pixels (in either X or Y dimension) an image
should be after processing

### `max-single`

|  Required  |    Type    | Default | Variable name |
|------------|------------|---------|---------------|
| _optional_ | _{string}_ | "`5MB`" |  `maxSingle`  |


Maximum file size a single file can be

> __Note:__ If no unit is specified, Bytes are assumed

### `max-total`

|  Required  |    Type    | Default  | Variable name |
|------------|------------|----------|---------------|
| _optional_ | _{string}_ | "`15MB`" |  `maxTotal`   |

Maximum total size a all files user can upload.

> __Note:__ If no unit is specified, Bytes are assumed

### `reorder`

|  Required  |    Type     | Default | Variable name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` |   `reorder`   |

Whether or not user can reorder files displayed in the file/image carousel

### `types`

|  Required  |    Type    |            Default            | Variable name |
|------------|------------|-------------------------------|---------------|
| _optional_ | _{string}_ | "`png jpg webp pdf docx doc`" |    `types`    |

List of file types (file extensions) the server will accept. (list will be split on white space and/or punctuation)

### `unlimited`

|  Required  |    Type     | Default | Variable name |
|------------|-------------|---------|---------------|
| _optional_ | _{boolean}_ | `FALSE` |  `unlimited`  |

Whether or not the user can upload an unlimited number *(999)* of
files.

> __Note:__ __`unlimited` overrides `max-files`.__ <br />
>
> If you want to allow users to upload more than 999 files in one
> go, do __*NOT*__ use `unlimited`.

----

## Accessibility

Effort has been made to make this component both keyboard navigation and screen reader frienly.

### Access keys

#### `a` - Add one or more files to be uploaded

> __Note:__ you can only add files if there are no bad files and the file 
>           count limit or total file size limit has not been reached.

#### `s` - Send files to the server

Send the selected (valid) files to the server

> __Note:__ This just sends an event to notify the client code that 
>           files are ready to be sent. The client code is 
>           responsible for handling sending data to the server.

#### `p` - *Previous image*: Move the crousel to the previous image 

*`Left`* arrow key and *`Up`* arrow key do the same thing within the carousel.


#### `n` - *Next image*: Move the crousel to the next image 

*`Right`* arrow key and *`down`* arrow key do the same thing within the carousel.

> From within the carousel, you can also use the following keybard keys 
> * *`Page Down`* - move up to 10 images to the right.
> * *`Shift`* + *`Right` arrow* - move up to 10 images to the right.
> * *`End`* - moves to the last image/file in the carousel

#### `b` - *Move file left*

Swap the image/file's position with it left neighbour. 

This is useful when the order of the files/images is important

#### `f` - *Move file right*

Swap the image/file's position with it right neighbour. 

This is useful when the order of the files/images is important.

#### `r` - *Replace file*

If the user decides that the selected file is not right this allows 
them to replace the file with a different file of their choosing, 
from their file system.

#### `d` - *Delete file*

If the user decides that the selected file is wanted this allows 
them remove it from the list of files to be uploaded.

### Keyboard shortcuts

#### `Escape` - *Cancel upload*

Close the upload dialogue and cancel the upload without sending anything to the server.

#### `Page Up` - Jump carousel left

Move carousel focus up to ten images to the left (or start if it's less than 10 images away)
> __Note:__ Both of the following do the same thing
> *  *`Shift`* + *`Left` arrow*
> *  *`Shift`* + *`Up` arrow*

#### `Home` - Jump to carousel start

move to the first image/file in the carousel

#### `Page Down` - Jump carousel right

Move carousel focus up to ten images to the left (or start if it's less than 10 images away)

> __Note:__ Both of the following do the same thing
> *  *`Shift`* + *`Right` arrow*
> *  *`Shift`* + *`Down` arrow*

#### `End` - Jump to carousel end

move to the first image/file in the carousel

----

## Events

The FileUpload component only emits two custom events.

### `confirmupload` - Confirm Upload

User has confirmed that they are happy with their selection wants to 
proceed with file upload to the server.

### `fileuploadclosed` - File Upload dialogue has closed

User wishes to abandon their upload without sending anything to the server.

----

## Dependencies

Other than Vue.JS, FileUpload only has one other depenency.

FileUpload depends on [`image-blob-reduce`](https://github.com/nodeca/image-blob-reduce) to efficiently handle resizing images in the browser.

> __Note:__ `image-blob-reduce` depends on [`pica`](https://github.com/nodeca/pica)

---

## Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
