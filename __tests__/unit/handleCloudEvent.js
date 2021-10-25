import { handleCloudEvent } from '../../src/handleCloudEvent'

describe('handleCloudEvent', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call handler with a cloudevent', async () => {
    const req = {}
    const res = {}
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
      req,
      res,
      handler,
      handlerOptions,
      cloudevent
    })

    expect(handler.handle).toBeCalledWith(req, res, cloudevent, handlerOptions)
  })
  it('should res with 500 when handler has unhandled error', async () => {
    const req = {}
    const res = {
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
      req,
      res,
      handler,
      handlerOptions,
      cloudevent
    })

    expect(res.status).toBeCalledWith(500)
  })
})
