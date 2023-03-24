# FileUpload

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

> __Note:__ __`max-files` is overridden by `unlimited`.<br />
>
> If you want to allow users to upload more than 999 files in one
> go, do __*NOT*__ use `unlimited`.

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
