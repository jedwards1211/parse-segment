// @flow

import Error from 'es6-error'

import Segment from './Segment'

export default class SegmentParseError extends Error {
  messageWithoutContext: string
  segment: Segment

  constructor(message: string, segment: Segment) {
    super(`${message} (${segment.source}, line ${segment.startLine +
      1}, col ${segment.startCol + 1})
${segment.underlineInContext()}`)
    this.messageWithoutContext = message
    this.segment = segment
  }
}
