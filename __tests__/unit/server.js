import { registerHandlerRoute, wrapInputInCloudEventForHandler } from 'server.js'

describe('server', () => {
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
      registerHandlerRoute(server, handler, '/servertest/', { sync: true })

      expect(server.post).toBeCalledWith('/servertest/example.command', expect.any(Function))
    })
  })

  describe('wrapInputInCloudEventForHandler', () => {
    it('should wrap given input in cloudevent format for the handler', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn()
      }
      const req = {
        headers: {},
        body: {
          input: {
            id: 1
          }
        }
      }
      const reply = {
        code: jest.fn(() => ({
          header: jest.fn(() => ({
            send: jest.fn()
          }))
        }))
      }
      wrapInputInCloudEventForHandler(handler)(req, reply)

      expect(handler.handle).toBeCalledWith(
        expect.any(Object),
        reply,
        expect.objectContaining({
          type: 'example.command',
          data: {
            id: 1
          },
          source: 'http-post'
        }),
        {}
      )
    })
  })
})
