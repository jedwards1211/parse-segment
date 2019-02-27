// @flow

import Segment from './Segment'
import SegmentParseError from './SegmentParseError'

export default class SegmentParser {
  segment: Segment
  index: number

  constructor(segment: Segment) {
    this.segment = segment
    this.index = 0
  }

  skip(rx: RegExp): boolean {
    rx.lastIndex = this.index
    const match = rx.exec(this.segment.value)
    if (match && match.index === this.index) {
      this.index += match[0].length
      return true
    }
    return false
  }

  nextDelimited(rx: RegExp, messageIfMissing?: string): Segment {
    if (!rx.global) rx = new RegExp(rx, rx.flags + 'g')
    rx.lastIndex = this.index
    const match = rx.exec(this.segment.value)
    if (!match) {
      if (messageIfMissing == null) {
        const segment = this.segment.substring(this.index)
        this.index = this.segment.length
        return segment
      }
      throw new SegmentParseError(
        messageIfMissing,
        this.segment.substring(this.segment.length)
      )
    }
    const segment = this.segment.substring(this.index, match.index)
    this.index = match.index + match[0].length
    return segment
  }

  match(
    rx: RegExp,
    messageIfMissing: string
  ): RegExp$matchResult & { segment: Segment } {
    if (!rx.global) rx = new RegExp(rx, rx.flags + 'g')
    rx.lastIndex = this.index
    const match = rx.exec(this.segment.value)
    if (!match || match.index !== this.index) {
      throw new SegmentParseError(
        messageIfMissing,
        this.segment.charAt(this.index)
      )
    }
    const nextIndex = this.index + match[0].length
    const segment = this.segment.substring(this.index, nextIndex)
    this.index = nextIndex
    return Object.assign((match: any), { segment })
  }

  expect(str: string, messageIfMissing: string = `expected ${str}`) {
    if (
      this.segment.value.substring(this.index, this.index + str.length) !== str
    ) {
      throw new SegmentParseError(
        messageIfMissing,
        this.segment.charAt(this.index)
      )
    }
    this.index += str.length
  }

  expectIgnoreCase(str: string, messageIfMissing: string = `expected ${str}`) {
    if (
      this.segment.value
        .substring(this.index, this.index + str.length)
        .toLowerCase() !== str.toLowerCase()
    ) {
      throw new SegmentParseError(
        messageIfMissing,
        this.segment.charAt(this.index)
      )
    }
    this.index += str.length
  }
}
