import { registerHandlerRoute, parseCloudEventThenHandle } from 'server-cloudevents.js'

jest.mock('cloudevents', () => ({
  HTTP: {
    toEvent: jest.fn(() => {
      return {
        type: 'example.commmand',
        data: {
          id: 1
        },
        source: 'mock'
      }
    })
  }
}))

describe('server-cloudevents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registerHandlerRoute', () => {
    it('should register each handler to the server as a post request', () => {
      const server = {
        post: jest.fn()
      }
      const handler = {
        type: 'example.command',
        handle: jest.fn()
      }
      registerHandlerRoute(server, handler)

      expect(server.post).toBeCalledWith('/example.command', expect.any(Function))
    })
    it('should register each handler to the server as a post request with serverPath as prefix', () => {
      const server = {
        post: jest.fn()
      }
      const handler = {
        type: 'example.command',
        handle: jest.fn()
      }
      const serverPath = '/test/'
      registerHandlerRoute(server, handler, serverPath)

      expect(server.post).toBeCalledWith('/test/example.command', expect.any(Function))
    })
  })

  describe('parseCloudEventThenHandle', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should reply with code 415 if there is an error', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn()
      }
      const req = {
        headers: {},
        body: {}
      }
      const reply = {
        code: jest.fn(() => ({
          header: jest.fn(() => ({
            send: jest.fn()
          }))
        }))
      }

      const { HTTP } = require('cloudevents')
      HTTP.toEvent.mockImplementationOnce(() => {
        throw new Error('blow up')
      })

      parseCloudEventThenHandle(handler)(req, reply)

      expect(handler.handle).not.toBeCalled()
      expect(reply.code).toBeCalledWith(415)
    })

    it('should parse the CE and pass along to the handler', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn()
      }
      const req = {
        headers: {},
        body: {}
      }
      const reply = {
        code: jest.fn(() => ({
          header: jest.fn(() => ({
            send: jest.fn()
          }))
        }))
      }
      parseCloudEventThenHandle(handler)(req, reply)

      expect(handler.handle).toBeCalledWith(
        expect.any(Object),
        reply,
        {
          type: 'example.commmand',
          data: {
            id: 1
          },
          source: 'mock'
        },
        {}
      )
    })

    it('should allow handler to be called if where criteria is met', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn(),
        where: (message) => message.data &&
                            message.data.id
      }
      jest.spyOn(handler, 'where')
      const req = {
        headers: {},
        body: {}
      }
      const reply = {
        code: jest.fn(() => ({
          header: jest.fn(() => ({
            send: jest.fn()
          }))
        }))
      }
      parseCloudEventThenHandle(handler)(req, reply)

      expect(handler.where).toBeCalled()
      expect(handler.handle).toBeCalled()
    })

    it('should filter messages from hitting handler if they dont match the where filter', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn(),
        where: (message) => message.data &&
                            message.data.foo
      }
      jest.spyOn(handler, 'where')
      const req = {
        headers: {},
        body: {}
      }
      const reply = {
        code: jest.fn(() => ({
          header: jest.fn(() => ({
            send: jest.fn()
          }))
        }))
      }
      parseCloudEventThenHandle(handler)(req, reply)

      expect(handler.where).toBeCalled()
      expect(reply.code).toBeCalledWith(400)
      expect(handler.handle).not.toBeCalled()
    })
  })
})
