import { registerHandlers, validateModuleAndAddToHandlers } from 'index'

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

jest.mock('server')
jest.mock('server-cloudevents')

describe('registerHandlers', () => {

  it('should throw an error if misconfigured', async () => {
    const server = {
      post: jest.fn()
    }
    const path = '/dir'
    let handlers

    try {
      handlers = await registerHandlers({
        server
      })
    } catch (err) {
      expect(err).toEqual(Error('path is required'))
    }
    try {
      handlers = await registerHandlers({
        path
      })
    } catch (err) {
      expect(err).toEqual(Error('server is required'))
    }
  })
  it('should call registerHandlerRoute for each valid module', async () => {
    const server = {
      post: jest.fn()
    }
    const handlers = await registerHandlers({
      path: '/path/fake/for/tests',
      server
    })

    const { registerHandlerRoute } = require('server')

    expect(registerHandlerRoute).toBeCalledWith(
      server, 
      {
        handle: expect.any(Function),
        type: 'example.command'
      },
      '/'
    )
    expect(handlers['example.command']).toEqual({
      type: 'example.command',
      handle: expect.any(Function)
    })
  })
  it('should call registerHandlerRoute from server-cloudevents for each valid module when cloudevents is true', async () => {
    const server = {
      post: jest.fn()
    }
    const handlers = await registerHandlers({
      path: '/path/fake/for/tests',
      server,
      cloudevents: true,
      serverPath: '/cloudevent/'
    })

    const { registerHandlerRoute } = require('server-cloudevents')

    expect(registerHandlerRoute).toBeCalledWith(
      server, 
      {
        handle: expect.any(Function),
        type: 'example.command'
      },
      '/cloudevent/'
    )
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
