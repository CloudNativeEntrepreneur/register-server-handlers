import debug from 'debug'

const info = debug('register-server-handlers:handleCloudEvent')
const error = debug('register-server-handlers:handleCloudEvent:error')

// Knative Response codes
// https://github.com/knative/specs/blob/main/specs/eventing/data-plane.md#event-acknowledgement-and-delivery-retry

export const handleCloudEvent = async ({ request, response, handler, handlerOptions, cloudevent }) => {
  info(`processing ${handler.type} with CloudEvent ${JSON.stringify(cloudevent, null, 2)}`)

  if (typeof handler.where === 'function' && !handler.where(cloudevent)) {
    return response.status(400)
      .json({ err: '🚨 Message does not match where filter criteria' })
  } else {
    try {
      await handler.handle(request, response, cloudevent, handlerOptions)
    } catch (err) {
      error(err)
      return response.status(500)
        .json(err)
    }
  }
}
