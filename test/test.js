/**
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 * @typedef {import('micromark-extension-directive').HtmlOptions} HtmlOptions
 * @typedef {import('micromark-extension-directive').Handle} Handle
 */

import {micromark} from 'micromark'
import {htmlVoidElements} from 'html-void-elements'
import {directive, directiveHtml} from 'micromark-extension-directive'

/**
 * @this {import('micromark-util-types').CompileContext}
 * @type {import('micromark-extension-directive').Handle}
 * @returns {undefined}
 */
function a(d) {
  // If (d.type !== 'textDirective') return false
  console.log(d)
  this.tag('<' + d.name + '>\n')
  this.raw(d.content || '')
  this.tag('</' + d.name + '>')
}

/**
 * @param {HtmlOptions | null | undefined} [options={}]
 *   HTML configuration (default: `{}`).
 */
function options(options) {
  return {
    allowDangerousHtml: true,
    extensions: [directive()],
    htmlExtensions: [directiveHtml(options)]
  }
}

console.log(
  micromark(
    `

:::::::::::::::::::::::::::::::::::::::::::::::::::slide

* This is a list:

:::::::::::::::::::::::::::::::::::::::::::::::::::
    `,
    options({'*': a})
  )
)
