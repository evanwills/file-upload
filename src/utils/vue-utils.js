/**
 * This file contains a collection of ("pure") utility functions for
 * performing common (vue specific) actions that are shared across
 * components.
 */

/**
 * Safely open a possibly already open dialogue model
 *
 * __Note:__ Older versions of chrome/Chromium have a bug where they
 *           throw an error if a modal is already open and you try
 *           and open it again.
 *
 * @param {HTMLDialogElement} modal
 */
export const doShowModal = (modal) => {
  if (modal !== null && modal.open !== true) {
    modal.showModal();
  }
};

/**
 * Safely close an open dialogue model
 *
 * __Note:__ Older versions of chrome/Chromium have a bug where they
 *           throw an error if a modal is already open and you try
 *           and open it again. It's possible that this bug would
 *           effect closing a modal too.
 *
 * @param {HTMLDialogElement} modal
 */
export const doCloseModal = (modal) => {
  if (modal !== null && modal.open === true) {
    modal.close();
  }
};

/**
 * Check whether a blur event should trigger a `lostfocus` event
 *
 * @param {InputEvent}      event     onBlur event object
 * @param {VueComponent}    context   Vue component's `this` value
 * @param {string}          inputType Input field type
 * @param {number}          start     Where, in the related field's
 *                                    ID to start matching the field
 *                                    ID
 * @param {string}          fieldID   ID of the field that triggered
 *                                    the blur event
 * @param {string|string[]} tag       Name of tag (or list of tag
 *                                    names) that expected for the
 *                                    related target's tagName
 *                                    property
 *
 * @returns {boolean} TRUE if focus has moved away from the
 *                    triggering input field. FALSE otherwise.
 */
export const focusLost = (
  event,
  fieldID,
  inputType = 'radio',
  start = 0,
  tag = 'INPUT',
) => {
  const { relatedTarget } = event;
  const len = fieldID.length + start;

  if (typeof relatedTarget === 'undefined' || relatedTarget === null) {
    // If related target is undefined, then this was probably called
    // as a blur by clicking outside the input component/field.

    return true;
  }

  const { id, tagName, type } = relatedTarget;

  let okTag = false;

  const _tags = Array.isArray(tag)
    ? tag
    : [tag];

  for (let a = 0; a < _tags.length; a += 1) {
    if (_tags[a].toUpperCase() === tagName) {
      okTag = (tagName !== 'INPUT' || type === inputType);
      break;
    }
  }

  return (okTag === false
        || typeof id !== 'string'
        || id.substring(start, len) !== fieldID);
};

export const getVuexDispatcher = (store, action) => async (data) => store.dispatch(action, data);

/**
 * Check whether a property is a non-empty string
 *
 * @param {[index: string]: string|any} props    List of props from
 *                                               a given component
 * @param {string}                      propName Name of the prop to
 *                                               be tested
 *
 * @returns {boolean} TRUE if property is a string and is non-empty.
 *                    FALSE otherwise.
 */
export const propHasContent = (props, propName) => (typeof props[propName] === 'string' && props[propName].trim() !== '');

/**
 * Check whether a slot has any content
 *
 * @param {[index: string]: VNode} slots    List of slots from a
 *                                          given component
 * @param {string}                 slotName Name of the slot to be
 *                                          tested
 *
 * @returns {boolean} TRUE if slot exists and is non is non-empty.
 *                    FALSE otherwise.
 */
export const slotHasContent = (slots, slotName) => (typeof slots !== 'undefined' && slots !== null && !!slots[slotName]);

/**
 * Check whether a component has some content.
 *
 * @param {[index: string]: VNode}      slots    List of slots from a
 *                                               given component
 * @param {[index: string]: string|any} props    List of props from
 *                                               a given component
 * @param {string}                      slotName Name of the slot to
 *                                               be tested
 * @param {string}                      propName Name of the prop to
 *                                               be tested
 *                 > __Note:__ if prop name is null, slotName will
 *                 >           be used for both props and slots
 *
 * @returns {boolean} TRUE if either the slot or the prop is
 *                    non-empty. FALSE otherwise
 */
export const hasContent = (slots, props, slotName, propName) => {
  const _propName = (typeof propName === 'string')
    ? propName
    : slotName;

  return (slotHasContent(slots, slotName) || propHasContent(props, _propName));
};
