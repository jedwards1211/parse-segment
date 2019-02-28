// @flow

import Segment from '../src/Segment'

import { describe, it } from 'mocha'
import { expect } from 'chai'

describe('Segment', () => {
  describe(`constructor`, function() {
    it(`works`, function() {
      const s = new Segment({
        value: 'foo bar baz\r\n qux\nthis is a\rtest',
        source: 'foo.txt',
        startLine: 5,
        startCol: 3,
      })
      expect(s.endLine).to.equal(8)
      expect(s.endCol).to.equal(3)
    })
  })
  describe(`substring`, function() {
    it(`works`, function() {
      const source = new Segment({
        value: 'foo bar baz\r\n qux\nthis is a\ntest',
        source: 'foo.txt',
        startLine: 5,
        startCol: 3,
      })
      let s

      s = source.substring(13, 28)
      expect(s.value).to.equal(source.value.substring(13, 28))
      expect(s.sourceIndex).to.equal(13)
      expect(s.startLine).to.equal(6)
      expect(s.startCol).to.equal(0)
      expect(s.endLine).to.equal(7)
      expect(s.endCol).to.equal('this is a'.length)

      s = source.substring(13, 29)
      expect(s.value).to.equal(source.value.substring(13, 29))
      expect(s.sourceIndex).to.equal(13)
      expect(s.startLine).to.equal(6)
      expect(s.startCol).to.equal(0)
      expect(s.endLine).to.equal(8)
      expect(s.endCol).to.equal(0)

      s = source.substring(13, 32)
      expect(s.value).to.equal(source.value.substring(13, 32))
      expect(s.sourceIndex).to.equal(13)
      expect(s.startLine).to.equal(6)
      expect(s.startCol).to.equal(0)
      expect(s.endLine).to.equal(8)
      expect(s.endCol).to.equal(3)

      s = source.substring(source.length)
      expect(s.value).to.equal('')
      expect(s.sourceIndex).to.equal(source.length)
      expect(s.startLine).to.equal(source.endLine)
      expect(s.startCol).to.equal(source.endCol + 1)
      expect(s.endLine).to.equal(source.endLine)
      expect(s.endCol).to.equal(source.endCol)
    })
  })
  describe(`split`, function() {
    it(`works`, function() {
      const source = new Segment({
        value: 'foo bar baz\r\n qux\nthis is a\ntest',
        source: 'foo.txt',
        startLine: 5,
        startCol: 3,
      })

      let parts
      parts = source.split('a')
      expect(parts).to.deep.equal(
        // go in reverse to kill a stateful optimization in substring
        // that was causing bugs
        [
          source.substring(27),
          source.substring(10, 26),
          source.substring(6, 9),
          source.substring(0, 5),
        ].reverse()
      )

      parts = source.split('a', 2)
      expect(parts).to.deep.equal(
        [source.substring(6, 9), source.substring(0, 5)].reverse()
      )

      parts = source.split('a', 0)
      expect(parts).to.deep.equal([])

      parts = source.split(/a/)
      expect(parts).to.deep.equal([source.substring(0, 5), source.substring(6)])
    })
    describe(`trim/trimStart/trimEnd`, function() {
      it(`works`, function() {
        const source = new Segment({
          value: '  foo bar  \r\n  baz qux    ',
          source: 'foo.txt',
          startLine: 5,
          startCol: 0,
        })
        expect(source.trimStart()).to.deep.equal(source.substring(2))
        expect(source.trimStart().trimStart()).to.deep.equal(
          source.substring(2)
        )
        expect(source.trimEnd()).to.deep.equal(source.substring(0, 22))
        expect(source.trimEnd().trimEnd()).to.deep.equal(
          source.substring(0, 22)
        )
        expect(source.trim()).to.deep.equal(source.substring(2, 22))
        expect(source.trim().trim()).to.deep.equal(source.substring(2, 22))
      })
    })
  })
})
