/**
 * @import {Construct, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
 */

import {ok as assert} from 'devlop'
import {codes} from 'micromark-util-symbol'
import {factoryAttributes} from './factory-attributes.js'
import {factoryLabel} from './factory-label.js'

const spanAttributes = {tokenize: tokenizeSpanAttributes, partial: true}

/** @type {Construct} */
export const directiveSpan = {
  tokenize: tokenizeDirectiveSpan
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeDirectiveSpan(effects, ok, nok) {
  const self = this

  return start

  /** @type {State} */
  function start(code) {
    assert(code === codes.leftSquareBracket, 'expected `[`')
    effects.enter('directiveText')
    return effects.attempt(
      {tokenize: tokenizeSpanLabel, partial: true},
      afterLabel,
      nok
    )(code)
  }

  /** @type {State} */
  function afterLabel(code) {
    // Must be followed by `{`
    if (code === codes.leftCurlyBrace) {
      return effects.attempt(spanAttributes, afterAttributes, nok)(code)
    }
    return nok(code)
  }

  /** @type {State} */
  function afterAttributes(code) {
    effects.exit('directiveText')
    return ok(code)
  }
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeSpanLabel(effects, ok, nok) {
  return factoryLabel(
    effects,
    ok,
    nok,
    'directiveTextLabel',
    'directiveTextLabelMarker',
    'directiveTextLabelString'
  )
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeSpanAttributes(effects, ok, nok) {
  return factoryAttributes(
    effects,
    ok,
    nok,
    'directiveTextAttributes',
    'directiveTextAttributesMarker',
    'directiveTextAttribute',
    'directiveTextAttributeId',
    'directiveTextAttributeClass',
    'directiveTextAttributeName',
    'directiveTextAttributeInitializerMarker',
    'directiveTextAttributeValueLiteral',
    'directiveTextAttributeValue',
    'directiveTextAttributeValueMarker',
    'directiveTextAttributeValueData'
  )
}
