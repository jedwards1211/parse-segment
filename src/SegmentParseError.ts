import Segment from './Segment'
export default class SegmentParseError extends Error {
  name = 'SegmentParseError'
  messageWithoutContext: string
  segment: Segment
  constructor(message: string, segment: Segment) {
    super(`${message} (${segment.source}, line ${segment.startLine + 1}, col ${
      segment.startCol + 1
    })
${segment.underlineInContext()}`)
    this.messageWithoutContext = message
    this.segment = segment
  }
}
