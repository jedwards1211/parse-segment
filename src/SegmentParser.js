// @flow

import Segment from './Segment'
import SegmentParseError from './SegmentParseError'

export default class SegmentParser {
  segment: Segment
  prevIndex: number
  index: number

  constructor(segment: Segment) {
    this.segment = segment
    this.prevIndex = -1
    this.index = 0
  }

  prevSegment(): Segment {
    if (this.prevIndex < 0) {
      throw new Error('there is no previous segment')
    }
    return this.segment.substring(this.prevIndex, this.index)
  }

  skip(rx: RegExp) {
    rx.lastIndex = this.index
    const match = rx.exec(this.segment.value)
    if (match && match.index === this.index) {
      this.prevIndex = -1
      this.index += match[0].length
    }
  }

  match(rx: RegExp, messageIfMissing: string): RegExp$matchResult {
    if (!rx.global) rx = new RegExp(rx, rx.flags + 'g')
    rx.lastIndex = this.index
    const match = rx.exec(this.segment.value)
    if (!match || match.index !== this.index) {
      this.prevIndex = -1
      throw new SegmentParseError(
        messageIfMissing,
        this.segment.charAt(this.index)
      )
    }
    this.prevIndex = this.index
    this.index += match[0].length
    return match
  }

  expect(str: string, messageIfMissing: string = `expected ${str}`) {
    const nextIndex = this.segment.indexOf(str, this.index)
    if (nextIndex < 0 || nextIndex !== this.index) {
      throw new SegmentParseError(
        messageIfMissing,
        this.segment.charAt(this.index)
      )
    }
    this.prevIndex = this.index
    this.index += str.length
  }
}
