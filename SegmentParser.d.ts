import Segment from './Segment'
import SegmentParseError from './SegmentParseError'

export default class SegmentParser {
  segment: Segment
  index: number

  constructor(segment: Segment)
  skip(rx: RegExp): boolean
  nextDelimited(rx: RegExp, messageIfMissing?: string): Segment
  match(
    rx: RegExp,
    messageIfMissing: string
  ): RegExpMatchArray & { segment: Segment }
  expect(str: string, messageIfMissing?: string)
  expectIgnoreCase(str: string, messageIfMissing?: string)
  currentChar(): string
  isAtEndOfLine(): boolean
  isAtEnd(): boolean
}
