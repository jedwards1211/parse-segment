# parse-segment

[![CircleCI](https://circleci.com/gh/jedwards1211/parse-segment.svg?style=svg)](https://circleci.com/gh/jedwards1211/parse-segment)
[![Coverage Status](https://codecov.io/gh/jedwards1211/parse-segment/branch/master/graph/badge.svg)](https://codecov.io/gh/jedwards1211/parse-segment)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/parse-segment.svg)](https://badge.fury.io/js/parse-segment)

string wrapper that keeps track of its original location in a file

# Example

```js
import { Segment } from 'parse-segment'

const data = new Segment({
  value: `no matter how you slice
this, it still knows where
it came from
`,
  source: 'foo.txt',
})

console.log(data.substring(32, 39).trim().underlineInContext())
```

Output:

```
this, it still knows where
         ^^^^^
```

# API

## `Segment`

Represents a string value plus information about its location in a source file.
`Segment` has the same methods as JS strings, but its methods instances of
`Segment` that retain their location information:

- `charAt`
- `charCodeAt`
- `codePointAt`
- `endsWith`
- `indexOf`
- `includes`
- `lastIndexOf`
- `localeCompare`
- `match`
- `search`
- `slice`
- `startsWith`
- `substring`
- `split`
- `trimStart`
- `trimEnd`
- `trim`

However, methods that change the text beyond slicing it up, like `toUpperCase`, `replace`, etc. are excluded.

### `new Segment(options)`

#### `options.value: string` (**required**)

The string text

#### `options.source: any` (**required**)

Where the text came from, for example, a file path or URL

#### `options.startLine: number` (_optional_, default: 0)

The line on which the segment begins, starting with 0.

#### `options.startCol: number` (_optional_, default: 0)

The column on which the segment begins, starting with 0.

### `.value: string`

The string text

### `.source: any`

Where the text came from, for example, a file path or URL

### `.startLine: number`

The line on which the segment begins, starting with 0.

### `.startCol: number`

The column on which the segment begins, starting with 0.

### `.endLine: number`

The line on which the segment ends, starting with 0.

### `.endCol: number`

The column on which the segment ends, starting with 0.

### `.length: number`

The length of the text

### `.underlineInContext(): string`

Returns the lines of text on which this segment occurs,
interleaved with lines containing ^^^^ underlining the
portion the segment represents.

## `SegmentParser`

A handy class for parsing text as a `Segment` and throwing contextual errors if necessary.

### `new SegmentParser(segment: Segment)`

Creates a parser on `segment` starting at `index` `0`.

### `.segment: Segment`

The `Segment` being parsed.

### `.index: number`

The current parse position within `segment`.

### `.skip(rx: RegExp)`

Moves `index` past the next occurrence of `rx`. Returns `true` if anything was
skipped, `false` otherwise.

### `.match(rx: RegExp, messageIfMissing: string): RegExp$matchResult & { segment: Segment }`

Checks if `segment` has a match for `rx` at the current `index`. If so, returns it and moves `index` past it.
If not, throws a `SegmentParseError` with `messageIfMissing`.

### `.nextDelimited(rx: RegExp, messageIfMissing?: string): Segment`

Moves the `index` past the next match for `rx`, and returns the sub-`Segment`
from the starting `index` up to the match. For example, `.nextDelimited(/\r\n?|\n/mg)`
will return the rest of the current line and move to the next line. If
`messageIfMissing` is given, will throw a `SegmentParseError` if no match for `rx`
is found beyond the current `index`. Otherwise, it will return the sub-`Segment`
from the current `index` all the way to the end.

### `.expect(str: String, messageIfMissing: string): void`

Checks if `segment` contains `str` at the current `index`. If so, moves `index` past it.
If not, throws a `SegmentParseError` with `messageIfMissing`.

### `.expectIgnoreCase(str: String, messageIfMissing: string): void`

Same as `.expect`, but performs a case-insensitive comparison.

### `.currentChar(): string`

Returns a string containing only the character at the current `index`.

### `.isAtEnd(): boolean`

Returns `true` if the current `index` is at the end of the `segment`, `false`
otherwise.

### `.isAtEndOfLine(): boolean`

Returns `true` if the current `index` is at the end of a line, `false`
otherwise.
