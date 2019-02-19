/* @flow */

import { EOL } from 'os'

type Options = {
  value: string,
  source: any,
  sourceIndex?: ?number,
  sourceSegment?: ?Segment,
  startLine: number,
  startCol: number,
  _endLine?: number,
  _endCol?: number,
}

const LINE_BREAK = /\r\n?|\n/g

export default class Segment {
  +value: string
  +source: any
  +sourceIndex: number
  +sourceSegment: ?Segment
  +startLine: number
  +endLine: number
  +startCol: number
  +endCol: number

  constructor({
    sourceSegment,
    sourceIndex,
    value,
    source,
    startLine,
    startCol,
    _endLine,
    _endCol,
  }: Options) {
    let endLine
    let endCol
    if (_endLine != null && _endCol != null) {
      endLine = _endLine
      endCol = _endCol
    } else {
      endLine = startLine
      endCol = startCol + value.length - 1
      let match
      LINE_BREAK.lastIndex = 0
      while (
        (match = LINE_BREAK.exec(value)) &&
        match.index + match[0].length < value.length
      ) {
        endLine++
        endCol = value.length - match[0].length - match.index - 1
      }
      this.endLine = endLine
      this.endCol = endCol
    }
    Object.defineProperties((this: any), {
      value: {
        value,
        writable: false,
        configurable: false,
        enumerable: true,
      },
      sourceSegment: {
        value: sourceSegment,
        writable: false,
        configurable: false,
        enumerable: true,
      },
      sourceIndex: {
        value: sourceIndex != null ? sourceIndex : -1,
        writable: false,
        configurable: false,
        enumerable: true,
      },
      source: {
        value: source,
        writable: false,
        configurable: false,
        enumerable: true,
      },
      startLine: {
        value: startLine,
        writable: false,
        configurable: false,
        enumerable: true,
      },
      startCol: {
        value: startCol,
        writable: false,
        configurable: false,
        enumerable: true,
      },
      endLine: {
        value: endLine,
        writable: false,
        configurable: false,
        enumerable: true,
      },
      endCol: {
        value: endCol,
        writable: false,
        configurable: false,
        enumerable: true,
      },
    })
  }

  charAt(index: number): Segment {
    return this.substring(index, Math.min(index + 1, this.value.length))
  }

  substring(
    beginIndex: number,
    endIndex?: number = this.value.length
  ): Segment {
    const {
      sourceSegment,
      sourceIndex,
      source,
      startLine,
      startCol,
      endLine,
      value,
    } = this
    if (startLine == endLine) {
      return new Segment({
        sourceSegment: sourceSegment != null ? sourceSegment : this,
        sourceIndex: sourceIndex >= 0 ? sourceIndex + beginIndex : beginIndex,
        value: value.substring(beginIndex, endIndex),
        source,
        startLine,
        startCol: startCol + beginIndex,
        endLine,
        endCol: startCol + endIndex - 1,
      })
    }

    let newStartLine = startLine
    let newStartCol = startCol + beginIndex

    let toIndex = beginIndex
    if (
      toIndex < value.length &&
      toIndex > 0 &&
      value.charAt(toIndex) == '\n' &&
      value.charAt(toIndex - 1) == '\r'
    ) {
      toIndex--
    }

    LINE_BREAK.lastIndex = 0
    let match
    while ((match = LINE_BREAK.exec(value)) && match.index < beginIndex) {
      newStartLine++
      newStartCol = beginIndex - match.index - match[0].length
    }

    return new Segment({
      sourceSegment: sourceSegment != null ? sourceSegment : this,
      sourceIndex: sourceIndex >= 0 ? sourceIndex + beginIndex : beginIndex,
      value: value.substring(beginIndex, endIndex),
      source,
      startLine: newStartLine,
      startCol: newStartCol,
    })
  }

  split(
    separator: RegExp | Array<string> | string,
    limit?: number
  ): Array<Segment> {
    let result: Array<Segment> = []
    if (separator instanceof RegExp) {
      let lastIndex = 0
      let match
      separator.lastIndex = 0
      while (result.length !== limit && (match = separator.exec(this.value))) {
        result.push(this.substring(lastIndex, match.index))
        separator.lastIndex = lastIndex = match.index + match[0].length
        if (!separator.global) break
      }
      if (result.length !== limit) {
        result.push(this.substring(lastIndex))
      }
    } else {
      if (Array.isArray(separator)) separator = separator.join('')
      let lastIndex = 0
      let index
      while (
        result.length !== limit &&
        (index = this.value.indexOf(separator, lastIndex)) >= 0
      ) {
        result.push(this.substring(lastIndex, index))
        lastIndex = index + separator.length
      }
      if (result.length !== limit) {
        result.push(this.substring(lastIndex))
      }
    }
    return result
  }

  trimStart(): Segment {
    const startMatch = /^\s*/.exec(this.value)
    return this.substring(
      startMatch ? startMatch.index + startMatch[0].length : 0
    )
  }

  trimEnd(): Segment {
    const endMatch = /\s*$/.exec(this.value)
    return this.substring(0, endMatch ? endMatch.index : this.length)
  }

  trim(): Segment {
    const startMatch = /^\s*/.exec(this.value)
    const endMatch = /\s*$/.exec(this.value)
    return this.substring(
      startMatch ? startMatch.index + startMatch[0].length : 0,
      endMatch ? endMatch.index : this.length
    )
  }

  toString(): string {
    return this.value
  }

  get length(): number {
    return this.value.length
  }

  underlineInContext(): string {
    const chunks: Array<string> = []
    let context: Segment = this
    const {
      sourceSegment,
      sourceIndex,
      startLine,
      startCol,
      endLine,
      endCol,
    } = this
    if (sourceSegment != null) {
      // beginning of this segment's first line
      const start = sourceIndex - startCol
      LINE_BREAK.lastIndex = sourceIndex + this.length - endCol
      const match = LINE_BREAK.exec(this.value)
      // end of this segment's last line
      const end = match ? match.index : sourceSegment.length
      // full lines containing this segment
      context = sourceSegment.substring(start, end)
    }
    const lines: Array<Segment> = context.split(LINE_BREAK)

    for (const line: Segment of lines) {
      if (line.startLine < startLine || line.startLine > endLine) {
        continue
      }
      chunks.push(line.value)
      chunks.push(EOL)
      let k = 0
      if (startLine == line.startLine) {
        while (k < startCol) {
          // use the character from line if it's whitespace
          // so that we get tabs in the same place before the underline
          const c = line.charAt(k).value
          chunks.push(/^\s$/.test(c) ? c : ' ')
          k++
        }
      }
      if (line.startLine < endLine) {
        while (k < line.length) {
          chunks.push('^')
          k++
        }
      } else if (endLine == line.startLine) {
        if (endCol < startCol) {
          chunks.push('^')
        } else {
          while (k <= endCol) {
            chunks.push('^')
            k++
          }
        }
      }
      if (line.startLine < endLine) {
        chunks.push(EOL)
      }
    }
    return chunks.join('')
  }
}
