import { Comment } from 'vue';

const isVNodeEmpty = (vnode) => { // eslint-disable-line arrow-body-style
  return (!vnode || asArray(vnode).every((_vnode) => _vnode.type === Comment));
};


/**
 * Check if a slot is empty
 *
 * @param {Slot|null} slot
 * @param {Object}    props
 *
 * @returns {boolean}
 */
export const slotIsEmpty = (slot, props = {}) => isVNodeEmpty(slot?.(props));

/**
 * Check if a slot has empty
 *
 * @param {Slot|null} slot
 * @param {Object}    props
 *
 * @returns {boolean}
 */
export const slotHasContent = (slot, props = {}) => !slotIsEmpty(slot, props);

/**
 * Check whether there's some content to render for a given text block
 *
 * @param {Array<slot>|null|undefined} slots    List of slots available
 *                                              in a component
 * @param {string}                     slotName Name of the slot to
 *                                              be checked
 * @param {Array<any>}                 props    List of properties
 *                                              owned by a component
 * @param {string|null}                propName Name of the component
 *                                              property/attribute to
 *                                              be checked
 *
 * @returns {boolean} TRUE if either the slot or propertie is not empty.
 */
export const componentHasContent = (slots, slotName, props, propName = null) => {
  const _propName = (typeof propName === 'string')
    ? propName
    : slotName;

  if (_propName.trim() === '') {
    throw new Error(
      'Vue Utils componentHasContent() expects fourth parameter '
      + '`propName` to be a non-empty string or that second '
      + 'parameter `slotName` is a non-empty string.',
    );
  }

  return ((typeof slots !== 'undefined' && slots !== null && slotHasContent(slots[slotName]))
    || (typeof props[_propName] === 'string' && props[_propName].trim() !== ''));
};

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
 * Check whether there is content for an attribute and slot within
 * a Vue component.
 *
 * @param {import("vue").Component} component Component to be tested
 * @param {string} attr Name of attribute content might have
 *                      been added to
 * @param {string} slot Name of Slot that might contain content
 *
 * @returns {boolean} TRUE if slot or attribute has content.
 *                    FALSE otherwise
 */
export const hasContent = (component, attr, slot = '') => (
  (attr !== '' && typeof component[attr] === 'string' && component[attr].trim() !== '')
  || (slot !== '' && typeof component.$slots[slot] !== 'undefined' && component.$slots[slot].length > 0)
);
