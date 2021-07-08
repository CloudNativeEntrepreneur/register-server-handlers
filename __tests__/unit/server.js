import { registerHandlerRoute } from 'server.js'

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
      registerHandlerRoute(server, handler, '/servertest/')

      expect(server.post).toBeCalledWith('/servertest/example.command', expect.any(Function))
    })
  })
})
