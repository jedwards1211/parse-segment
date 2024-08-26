export type SegmentOptions = {
  value: string
  source: any
  sourceIndex?: number | null | undefined
  sourceSegment?: Segment | null | undefined
  startLine?: number
  startCol?: number
  _endLine?: number
  _endCol?: number
}
const LINE_BREAK = /\r\n?|\n/gm
export default class Segment {
  readonly value: string
  readonly source: any
  readonly sourceIndex: number
  readonly sourceSegment: Segment | null | undefined
  readonly startLine: number
  readonly startCol: number
  _endLine: number
  _endCol: number
  _lastSubstringIndex: number
  _lastSubstringLine: number
  _lastSubstringCol: number
  constructor({
    sourceSegment,
    sourceIndex,
    value,
    source,
    startLine,
    startCol,
  }: SegmentOptions) {
    this.value = value
    this.source = source
    this.sourceSegment = sourceSegment
    this.sourceIndex = sourceIndex != null ? sourceIndex : -1
    this.startLine = this._lastSubstringLine = startLine || 0
    this.startCol = this._lastSubstringCol = startCol || 0
    this._endLine = this._endCol = -1
    this._lastSubstringIndex = 0
  }
  get length(): number {
    return this.value.length
  }
  _computeEnd() {
    this._endLine = this.startLine
    this._endCol = this.startCol + this.length - 1
    LINE_BREAK.lastIndex = 0
    let match
    while (
      (match = LINE_BREAK.exec(this.value)) &&
      match.index + match[0].length < this.length
    ) {
      this._endLine++
      this._endCol = this.length - match.index - match[0].length - 1
    }
  }
  get endLine(): number {
    if (this._endLine < 0) this._computeEnd()
    return this._endLine
  }
  get endCol(): number {
    if (this._endCol < 0) this._computeEnd()
    return this._endCol
  }
  charAt(index: number): Segment {
    return this.substring(index, Math.min(index + 1, this.length))
  }
  charCodeAt(index: number): number {
    return this.value.charCodeAt(index)
  }
  codePointAt(index: number): number | undefined {
    return this.value.codePointAt(index)
  }
  endsWith(search: string, length?: number): boolean {
    return this.value.endsWith(search, length)
  }
  indexOf(search: string, fromIndex?: number): number {
    return this.value.indexOf(search, fromIndex)
  }
  includes(search: string, position?: number): boolean {
    return this.value.includes(search, position)
  }
  lastIndexOf(search: string, fromIndex?: number): number {
    return this.value.lastIndexOf(search, fromIndex)
  }
  localeCompare(
    that: string,
    locales?: string | Array<string>,
    options?: Intl.CollatorOptions
  ): number {
    return this.value.localeCompare(that, locales, options)
  }
  match(regexp: RegExp): RegExpMatchArray | null {
    return this.value.match(regexp)
  }
  search(regexp: RegExp): number {
    return this.value.search(regexp)
  }
  slice(beginIndex: number, endIndex: number = this.length): Segment {
    return this.substring(
      beginIndex < 0 ? this.length + beginIndex : beginIndex,
      endIndex < 0 ? this.length + endIndex : endIndex
    )
  }
  startsWith(search: string, position?: number): boolean {
    return this.value.startsWith(search, position)
  }
  substring(beginIndex: number, endIndex: number = this.length): Segment {
    const { sourceSegment, sourceIndex, source, startLine, startCol, value } =
      this
    if (beginIndex < this._lastSubstringIndex) {
      this._lastSubstringIndex = 0
      this._lastSubstringLine = startLine
      this._lastSubstringCol = startCol
    }
    let newStartLine = this._lastSubstringLine
    let newStartCol =
      this._lastSubstringCol + beginIndex - this._lastSubstringIndex
    LINE_BREAK.lastIndex = this._lastSubstringIndex
    let match
    while ((match = LINE_BREAK.exec(value)) && match.index < beginIndex) {
      newStartLine++
      newStartCol = beginIndex - match.index - match[0].length
      this._lastSubstringIndex = match.index + match[0].length
      this._lastSubstringLine++
      this._lastSubstringCol = 0
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
    const result: Array<Segment> = []
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
  toString(): string {
    return this.value
  }
  valueOf(): string {
    return this.value
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
    const from = startMatch ? startMatch.index + startMatch[0].length : 0
    const to = endMatch ? endMatch.index : this.length
    return to < from ? this.substring(0, 0) : this.substring(from, to)
  }
  underlineInContext(): string {
    const chunks: Array<string> = []
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let context: Segment = this
    const { sourceSegment, sourceIndex, startLine, startCol, endLine, endCol } =
      this
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
    for (const line of lines) {
      if (line.startLine < startLine || line.startLine > endLine) {
        continue
      }
      chunks.push(line.value)
      chunks.push('\n')
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
        chunks.push('\n')
      }
    }
    return chunks.join('')
  }
}
