import { handleCloudEvent } from '../../src/handleCloudEvent'

describe('handleCloudEvent', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call handler with a cloudevent', async () => {
    const request = {}
    const reply = {}
    const handler = {
      handle: jest.fn(() => Promise.resolve({ id: 'test' }))
    }
    const handlerOptions = {}
    const cloudevent = {
      type: 'example.commmand',
      data: {
        id: 1
      },
      source: 'mock'
    }

    await handleCloudEvent({
      request,
      reply,
      handler,
      handlerOptions,
      cloudevent
    })

    expect(handler.handle).toBeCalledWith(request, reply, cloudevent, handlerOptions)
  })
  it('should reply with 500 when handler has unhandled error', async () => {
    const request = {}
    const reply = {
      code: jest.fn(() => ({
        header: jest.fn(() => ({
          send: jest.fn()
        }))
      }))
    }
    const handler = {
      type: 'example.commmand',
      handle: jest.fn(() => Promise.reject(new Error('BOOM!')))
    }
    const handlerOptions = {}
    const cloudevent = {
      type: 'example.commmand',
      data: {
        id: 1
      },
      source: 'mock'
    }

    await handleCloudEvent({
      request,
      reply,
      handler,
      handlerOptions,
      cloudevent
    })

    expect(reply.code).toBeCalledWith(500)
  })
})
