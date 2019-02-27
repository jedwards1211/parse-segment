/**
 * @flow
 * @prettier
 */

import { describe, it } from 'mocha'
import { expect } from 'chai'

import Segment from '../src/Segment'
import SegmentParser from '../src/SegmentParser'

import SegmentParseError from '../src/SegmentParseError'

describe(`SegmentParser`, function() {
  describe(`.match`, function() {
    it(`returns match when found at index`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 5
      const match = parser.match(/\s+/, 'missing whitespace')
      expect(match).to.deep.equal(['  '])
      expect(match.segment).to.deep.equal(parser.segment.substring(5, 7))
      expect(match.index).to.equal(5)
    })
    it(`throws error when match not found at index`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 4
      expect(() => parser.match(/\s+/, 'missing whitespace')).to.throw(
        SegmentParseError,
        `missing whitespace (file.txt, line 6, col 5)
a b c  d e
    ^`
      )
    })
  })
  describe(`.skip`, function() {
    it(`moves past match if it exists`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 5
      parser.skip(/\s+/gm)
      expect(parser.index).to.equal(7)
    })
    it(`does nothing if match doesn't exist`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 4
      parser.skip(/q/gm)
      expect(parser.index).to.equal(4)
    })
    it(`does nothing if match isn't at index`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 4
      parser.skip(/\s+/gm)
      expect(parser.index).to.equal(4)
    })
  })
  describe(`.expect`, function() {
    it(`moves past str if present at index`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'foo bar baz',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 4
      parser.expect('bar')
      expect(parser.index).to.equal(7)
    })
    it(`throws if str not present at index`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'foo bar baz',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 3
      expect(() => parser.expect('bar')).to.throw(
        SegmentParseError,
        `expected bar (file.txt, line 6, col 4)
foo bar baz
   ^`
      )
    })
    it(`throws if str not present`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'foo bar baz',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 4
      expect(() => parser.expect('bog')).to.throw(
        SegmentParseError,
        `expected bog (file.txt, line 6, col 5)
foo bar baz
    ^`
      )
    })
  })
  describe(`.nextDelimited`, function() {
    it(`returns text up to match`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e f g h',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 5
      const segment = parser.nextDelimited(/e/, 'missing e')
      expect(segment).to.deep.equal(
        parser.segment.substring(5, parser.segment.indexOf('e'))
      )
      expect(parser.index).to.equal(parser.segment.indexOf('e') + 1)
    })
    it(`throws error when match not found`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 4
      expect(() => parser.nextDelimited(/f/, 'missing f')).to.throw(
        SegmentParseError,
        `missing f (file.txt, line 6, col 11)
a b c  d e
          ^`
      )
    })
    it(`returns up to end if no match found and messageIfMissing == null`, function() {
      const parser = new SegmentParser(
        new Segment({
          value: 'a b c  d e',
          source: 'file.txt',
          startLine: 5,
        })
      )
      parser.index = 4
      expect(parser.nextDelimited(/f/)).to.deep.equal(
        parser.segment.substring(4)
      )
      expect(parser.index).to.equal(parser.segment.length)
    })
  })
})
