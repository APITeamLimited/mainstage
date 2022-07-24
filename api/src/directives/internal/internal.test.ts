import { mockRedwoodDirective, getDirectiveName } from '@redwoodjs/testing/api'

import internal from './internal'

describe('internal directive', () => {
  it('declares the directive sdl as schema, with the correct name', () => {
    expect(internal.schema).toBeTruthy()
    expect(getDirectiveName(internal.schema)).toBe('internal')
  })

  it('has a internal throws an error if validation does not pass', () => {
    const mockExecution = mockRedwoodDirective(internal, {})

    expect(mockExecution).toThrowError('Implementation missing for internal')
  })
})
