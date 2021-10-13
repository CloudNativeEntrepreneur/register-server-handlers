import debug from 'debug'

const info = debug('register-server-handlers:handleCloudEvent')
const error = debug('register-server-handlers:handleCloudEvent:error')

// Knative Response codes
// https://github.com/knative/specs/blob/main/specs/eventing/data-plane.md#event-acknowledgement-and-delivery-retry

export const handleCloudEvent = async ({ request, reply, handler, handlerOptions, cloudevent }) => {
  info(`processing ${handler.type} with CloudEvent ${JSON.stringify(cloudevent, null, 2)}`)

  if (typeof handler.where === 'function' && !handler.where(cloudevent)) {
    reply.code(400)
      .header('Content-Type', 'application/json')
      .send({ err: '🚨 Message does not match where filter criteria' })
  } else {
    try {
      await handler.handle(request, reply, cloudevent, handlerOptions)
    } catch (err) {
      error(err)
      reply.code(500)
        .header('Content-Type', 'application/json')
        .send(JSON.stringify(err))
    }
  }
}
