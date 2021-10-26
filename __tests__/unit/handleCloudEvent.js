import { handleCloudEvent } from '../../src/handleCloudEvent'

describe('handleCloudEvent', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call handler with a cloudevent', async () => {
    const request = {}
    const response = {}
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
      response,
      handler,
      handlerOptions,
      cloudevent
    })

    expect(handler.handle).toBeCalledWith(request, response, cloudevent, handlerOptions)
  })
  it('should response with 500 when handler has unhandled error', async () => {
    const request = {}
    const response = {
      status: jest.fn(() => ({
        json: jest.fn()
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
      response,
      handler,
      handlerOptions,
      cloudevent
    })

    expect(response.status).toBeCalledWith(500)
  })
})
