type Options = {
  value: string
  source: any
  sourceIndex?: number | null
  sourceSegment?: Segment | null
  startLine?: number
  startCol?: number
  _endLine?: number
  _endCol?: number
}

export default class Segment {
  readonly value: string
  readonly source: any
  readonly sourceIndex: number
  readonly sourceSegment: Segment | null | undefined
  readonly startLine: number
  readonly startCol: number

  constructor(options: Options)

  get length(): number
  get endLine(): number
  get endCol(): number

  charAt(index: number): Segment
  charCodeAt(index: number): number
  codePointAt(index: number): number
  endsWith(search: string, length?: number): boolean
  indexOf(search: string, fromIndex?: number): number
  includes(search: string, position?: number): boolean
  lastIndexOf(search: string, fromIndex?: number): number
  localeCompare(
    that: string,
    locales?: string | Array<string>,
    options?: Intl.CollatorOptions
  ): number
  match(regexp: RegExp): RegExpMatchArray | null
  search(regexp: RegExp): number
  slice(beginIndex: number, endIndex?: number): Segment
  startsWith(search: string, position?: number): boolean
  substring(beginIndex: number, endIndex?: number): Segment
  split(
    separator: RegExp | Array<string> | string,
    limit?: number
  ): Array<Segment>
  toString(): string
  valueOf(): string
  trimStart(): Segment
  trimEnd(): Segment
  trim(): Segment
  underlineInContext(): string
}
