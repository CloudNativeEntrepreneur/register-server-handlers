import { registerHandlerRoute, parseCloudEventForHandler } from 'server-cloudevents.js'

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

  describe('parseCloudEventForHandler', () => {
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

      parseCloudEventForHandler(handler)(req, reply)

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
      parseCloudEventForHandler(handler)(req, reply)

      expect(handler.handle).toBeCalledWith(expect.any(Object), reply, {
        type: 'example.commmand',
        data: {
          id: 1
        },
        source: 'mock'
      })
    })
  })
})
