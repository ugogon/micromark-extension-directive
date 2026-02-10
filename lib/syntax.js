/**
 * @import {Extension} from 'micromark-util-types'
 */

import { directiveContainer } from './directive-container.js';
import { directiveLeaf } from './directive-leaf.js';
import { directiveSpan } from './directive-span.js';
import { directiveText } from './directive-text.js';

/**
 * Create an extension for `micromark` to enable directive syntax.
 *
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions`, to
 *   enable directive syntax.
 */
export function directive() {
  return {
    text: {
      [58]: directiveText,
      [91]: directiveSpan
    },
    flow: {
      [58]: [directiveContainer, directiveLeaf]
    }
  };
}