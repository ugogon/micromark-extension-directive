# micromark-extension-directive

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[micromark][] extensions to support [directives][prop] (`:cite[smith04]`,
`[text]{.class}`, `::: {.note}`, and such).

## Contents

* [What is this?](#what-is-this)
* [When to use this](#when-to-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`directive()`](#directive)
  * [`directiveHtml(options?)`](#directivehtmloptions)
  * [`Directive`](#directive-1)
  * [`Handle`](#handle)
  * [`HtmlOptions`](#htmloptions)
* [Authoring](#authoring)
* [HTML](#html)
* [CSS](#css)
* [Syntax](#syntax)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Related](#related)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package contains two extensions that add support for directive syntax in
markdown to [`micromark`][micromark].

## When to use this

This project is useful when you want to solve the need for an infinite number
of potential extensions to markdown in a single markdown-esque way.

You can use these extensions when you are working with [`micromark`][micromark]
already.

When you need a syntax tree, you can combine this package with
[`mdast-util-directive`][mdast-util-directive].

All these packages are used [`remark-directive`][remark-directive], which
focusses on making it easier to transform content by abstracting these
internals away.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

[npm][]:

```sh
npm install micromark-extension-directive
```

In Deno with [`esm.sh`][esmsh]:

```js
import {directive, directiveHtml} from 'https://esm.sh/micromark-extension-directive@3'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {directive, directiveHtml} from 'https://esm.sh/micromark-extension-directive@3?bundle'
</script>
```

## Use

Say our document `example.md` contains:

```markdown
A lovely language know as :abbr[HTML]{title="HyperText Markup Language"}.
```

…and our module `example.js` looks as follows:

```js
/**
 * @import {Handle} from 'micromark-extension-directive'
 * @import {CompileContext} from 'micromark-util-types'
 */

import fs from 'node:fs/promises'
import {micromark} from 'micromark'
import {directive, directiveHtml} from 'micromark-extension-directive'

const output = micromark(await fs.readFile('example.md'), {
  extensions: [directive()],
  htmlExtensions: [directiveHtml({abbr})]
})

console.log(output)

/**
 * @this {CompileContext}
 * @type {Handle}
 * @returns {undefined}
 */
function abbr(d) {
  if (d.type !== 'textDirective') return false

  this.tag('<abbr')

  if (d.attributes && 'title' in d.attributes) {
    this.tag(' title="' + this.encode(d.attributes.title) + '"')
  }

  this.tag('>')
  this.raw(d.label || '')
  this.tag('</abbr>')
}
```

…now running `node example.js` yields:

```html
<p>A lovely language know as <abbr title="HyperText Markup Language">HTML</abbr>.</p>
```

## API

This package exports the identifiers [`directive`][api-directive] and
[`directiveHtml`][api-directive-html].
There is no default export.

The export map supports the [`development` condition][development].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `directive()`

Create an extension for `micromark` to enable directive syntax.

###### Returns

Extension for `micromark` that can be passed in `extensions`, to enable
directive syntax ([`Extension`][micromark-extension]).

### `directiveHtml(options?)`

Create an extension for `micromark` to support directives when serializing to
HTML.

> 👉 **Note**: this uses KaTeX to render math.

###### Parameters

* `options` ([`HtmlOptions`][api-html-options], default: `{}`)
  — configuration

###### Returns

Extension for `micromark` that can be passed in `htmlExtensions`, to
support directives when serializing to HTML
([`HtmlExtension`][micromark-html-extension]).

### `Directive`

Structure representing a directive (TypeScript type).

###### Fields

* `type` (`'containerDirective'`, `'leafDirective'`, or `'textDirective'`)
  — kind
* `name` (`string`)
  — name of directive
* `label` (`string` or `undefined`)
  — compiled HTML content that was in `[brackets]`
* `attributes` (`Record<string, string>` or `undefined`)
  — object w/ HTML attributes
* `content` (`string` or `undefined`)
  — compiled HTML content inside container directive

### `Handle`

Handle a directive (TypeScript type).

###### Parameters

* `this` ([`CompileContext`][micromark-compile-context])
  — current context
* `directive` ([`Directive`][api-directive-type])
  — directive

###### Returns

Signal whether the directive was handled (`boolean`, default: `true`).
Yield `false` to let the fallback (a special handle for `'*'`) handle it.

### `HtmlOptions`

Configuration (TypeScript type).

> 👉 **Note**: the special field `'*'` can be used to specify a fallback handle
> to handle all otherwise unhandled directives.

###### Type

```ts
type HtmlOptions = Record<string, Handle>
```

## Authoring

When authoring markdown with directives, keep in mind that they don’t work in
most places.
On your own site it can be great!

## HTML

You can define how directives are turned into HTML.
If directives are not handled, they do not emit anything.

## CSS

How to display directives is left as an exercise for the reader.

## Syntax

The syntax looks like this:

```markdown
Directives in text can form with a single colon, such as :cite[smith04].
Their syntax is `:name[label]{attributes}`.

Leafs (block without content) can form by using two colons:

::youtube[Video of a cat in a box]{vid=01ab2cd3efg}

Their syntax is `::name[label]{attributes}` on its own line.

Containers (blocks with content) can form by using three colons:

:::spoiler
He dies.
:::

The `name` part is required for leaf and text directives.  The first character
must be a letter, other characters can be alphanumerical, `-`, and `_`.
`-` or `_` cannot end a name.

The `[label]` part is optional (`:x` and `:x[]` are equivalent)†.
When used, it can include text constructs such as emphasis and so on: `x[a *b*
c]`.

The `{attributes}` part is optional (`:x` and `:x{}` are equivalent)†.
When used, it is handled like HTML attributes, such as that `{a}`, `{a=""}`,
, `{a=''}` but also `{a=b}`, `{a="b"}`, and `{a='b'}` are equivalent.
Shortcuts are available for `id=` (`{#readme}` for `{id=readme}`) and
`class` (`{.big}` for `{class=big}`).
When multiple ids are found, the last is used; when multiple classes are found,
they are combined: `{.red class=green .blue}` is equivalent to
`{.red .green .blue}` and `{class="red green blue"}`.

† there is one case where a name must be followed by an empty label or empty
attributes: a *text* directive that only has a name, cannot be followed by a
colon. So, `:red:` doesn't work. Use either `:red[]` or `:red{}` instead.
The reason for this is to allow GitHub emoji (gemoji) and directives to coexist.

Containers can be nested by using different numbers of colons:

::::spoiler
He dies.

:::spoiler
She is born.
:::

::::

The closing fence must have exactly the same number of colons as its
corresponding opening fence.
If no closing is found, the container runs to the end of its parent container
(block quote, list item, document, or other container).

::::spoiler
These three are not enough to close
:::
So this line is also part of the container.
::::
```

### Pandoc extensions

This implementation also supports several [Pandoc][]-compatible extensions:

#### Nameless containers (fenced divs)

Container directives can omit the name when they include a label or attributes.
This matches Pandoc's [fenced divs][] syntax:

```markdown
::: {.note}
This is a note.
:::

::: {#myid .warning}
This is a warning.
:::
```

The label or attributes are required — bare `:::` without `[…]` or `{…}`
is not recognized as a nameless container.

#### Nameless text directives

Text directives can omit the name. A colon followed directly by a label
and attributes creates a nameless text directive:

```markdown
:[Underline]{.underline}
```

#### Bracketed spans

Square brackets followed immediately by attributes create a bracketed span,
matching Pandoc's [`bracketed_spans`][bracketed-spans] extension.
No colon prefix is needed:

```markdown
[This is underlined]{.underline}

[Important text]{#notice .highlight}
```

Bracketed spans produce the same AST nodes as nameless text directives.
Regular links (`[text](url)`) still work — bracketed spans only activate
when `{…}` follows the closing bracket.

### Strictness

Note that while other implementations are sometimes loose in what they allow,
this implementation mimics CommonMark as closely as possible:

* Whitespace is not allowed between colons and name (~~`: a`~~), name and
  label (~~`:a []`~~), name and attributes (~~`:a {}`~~), or label and
  attributes (~~`:a[] {}`~~) — because it's not allowed in links either
  (~~`[] ()`~~)
* No trailing colons allowed on the opening fence of a container
  (~~`:::a:::`~~) — because it's not allowed in fenced code either
* The label and attributes in a leaf or container cannot include line endings
  (~~`::a[b\nc]`~~) — because it's not allowed in fenced code either

[pandoc]: https://pandoc.org
[fenced-divs]: https://pandoc.org/MANUAL.html#divs-and-spans
[bracketed-spans]: https://pandoc.org/MANUAL.html#divs-and-spans

## Types

This package is fully typed with [TypeScript][].
It exports the additional types [`Directive`][api-directive-type],
[`Handle`][api-handle], and [`HtmlOptions`][api-html-options].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line,
`micromark-extension-directive@^3`, compatible with Node.js 16.

This package works with `micromark` version `3` and later.

## Security

This package is safe assuming that you write safe handlers.
Any vulnerability in your code could open you to a
[cross-site scripting (XSS)][xss] attack.

## Related

* [`remark-directive`][remark-directive]
  — remark plugin to support directives
* [`mdast-util-directive`][mdast-util-directive]
  — mdast utility to support directives

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-directive/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-directive/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-directive.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-directive

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-directive.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-directive

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=micromark-extension-directive

[size]: https://bundlejs.com/?q=micromark-extension-directive

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/main/contributing.md

[support]: https://github.com/micromark/.github/blob/main/support.md

[coc]: https://github.com/micromark/.github/blob/main/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[development]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[micromark]: https://github.com/micromark/micromark

[micromark-html-extension]: https://github.com/micromark/micromark#htmlextension

[micromark-extension]: https://github.com/micromark/micromark#syntaxextension

[micromark-compile-context]: https://github.com/micromark/micromark/blob/41e3c4c/packages/micromark-util-types/index.js#L457

[mdast-util-directive]: https://github.com/syntax-tree/mdast-util-directive

[remark-directive]: https://github.com/remarkjs/remark-directive

[prop]: https://talk.commonmark.org/t/generic-directives-plugins-syntax/444

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[api-directive]: #directive

[api-directive-html]: #directivehtmloptions

[api-directive-type]: #directive-1

[api-handle]: #handle

[api-html-options]: #htmloptions
