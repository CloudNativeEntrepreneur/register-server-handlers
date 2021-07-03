import registerHandlers, { validateModuleAndAddToHandlers } from 'index'

jest.mock('objectify-folder/modules.js', () => ({
  __esModule: true,
  default: jest.fn(() => new Promise((resolve, reject) => {
    resolve({
      'example.command': {
        type: 'example.command',
        handle: jest.fn()
      }
    })
  }))
}))

describe('registerHandlers', () => {
  it('should call registerHandlerRoute for each valid module', async () => {
    const server = {
      post: jest.fn()
    }
    const handlers = await registerHandlers({
      path: '/path/fake/for/tests',
      server
    })

    expect(handlers['example.command']).toEqual({
      type: 'example.command',
      handle: expect.any(Function)
    })
  })
})

describe('validateModuleAndAddToHandlers', () => {
  it('should validate modules and add them ', () => {
    const importedModule = {
      handle: jest.fn()
    }
    const result = {}
    const file = 'fake.command.mjs'
    const handlers = validateModuleAndAddToHandlers(importedModule, result, file)

    expect(handlers['fake.command']).toEqual({
      handle: importedModule.handle,
      type: 'fake.command'
    })
  })

  it('should not add invalid modules ', () => {
    const importedModule = {}
    const result = {}
    const file = 'fake.command.mjs'
    const handlers = validateModuleAndAddToHandlers(importedModule, result, file)

    expect(handlers).toEqual({})
  })
  it('should not add modules with invalid handlers ', () => {
    const importedModule = {
      handle: 'turtle'
    }
    const result = {}
    const file = 'fake.command.mjs'
    const handlers = validateModuleAndAddToHandlers(importedModule, result, file)

    expect(handlers).toEqual({})
  })
})
