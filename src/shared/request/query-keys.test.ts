import { createQueryKeys } from './query-keys'

describe('createQueryKeys', () => {
  const keys = createQueryKeys('users')

  it('builds hierarchical keys', () => {
    expect(keys.all).toEqual(['users'])
    expect(keys.lists()).toEqual(['users', 'list'])
    expect(keys.list({ page: 1 })).toEqual(['users', 'list', { page: 1 }])
    expect(keys.detail(7)).toEqual(['users', 'detail', 7])
  })
})
