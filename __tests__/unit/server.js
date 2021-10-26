import { registerHandlerRoute, wrapInputInCloudEventThenHandle } from 'server.js'

describe('server', () => {
  describe('registerHandlerRoute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

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

  describe('wrapInputInCloudEventThenHandle', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should wrap given input in cloudevent format for the handler, and then execute it', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn()
      }
      const request = {
        headers: {},
        body: {
          input: {
            id: 1
          }
        }
      }
      const response = {
        status: jest.fn(() => ({
          json: jest.fn()
        }))
      }
      wrapInputInCloudEventThenHandle(handler)(request, response)

      expect(handler.handle).toBeCalledWith(
        expect.any(Object),
        response,
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

    it('should allow handler to be called if where criteria is met', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn(),
        where: (message) => message.data &&
                            message.data.id
      }
      jest.spyOn(handler, 'where')
      const request = {
        headers: {},
        body: {
          input: {
            id: 1
          }
        }
      }
      const response = {
        status: jest.fn(() => ({
          json: jest.fn()
        }))
      }
      wrapInputInCloudEventThenHandle(handler)(request, response)

      expect(handler.where).toBeCalled()
      expect(handler.handle).toBeCalledWith(
        expect.any(Object),
        response,
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

    it('should filter messages from hitting handler if they dont match the where filter', () => {
      const handler = {
        type: 'example.command',
        handle: jest.fn(),
        where: (message) => message.data &&
                            message.data.foo
      }
      jest.spyOn(handler, 'where')
      const request = {
        headers: {},
        body: {
          input: {
            id: 1
          }
        }
      }
      const response = {
        status: jest.fn(() => ({
          json: jest.fn()
        }))
      }
      wrapInputInCloudEventThenHandle(handler)(request, response)

      expect(handler.where).toBeCalled()
      expect(response.status).toBeCalledWith(400)
      expect(handler.handle).not.toBeCalled()
    })
  })
})
