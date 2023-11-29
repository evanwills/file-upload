/**
 * This file contains a collection of ("pure") utility functions for
 * performing common actions that are shared across components
 */

/**
 * Get a function that returns the start of an error message
 * (or console group name) string for a given method
 *
 * @param {string} method Name of method that might throw an error
 *
 * @returns {string}
 */
export const getEpre = (componentName, componentID = '') => {
  const tail = (componentID !== '')
    ? ` (#${componentID})`
    : '';

  return (method, before = null) => {
    const t = typeof before;
    let suffix = '';

    if (t === 'boolean') {
      suffix = (before === true)
        ? ' (before)'
        : ' (after)';
    } else if (t === 'string') {
      const _before = before.trim();
      if (_before !== '') {
        suffix = ` ("${_before}")`;
      }
    }

    return `${componentName}.${method}()${tail}${suffix} `;
  };
};
