import Error from 'es6-error'
import Segment from './Segment'

export default class SegmentParseError extends Error {
  readonly messageWithoutContext: string
  readonly segment: Segment

  constructor(message: string, segment: Segment)
}
