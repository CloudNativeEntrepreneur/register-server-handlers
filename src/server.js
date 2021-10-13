import { CloudEvent } from 'cloudevents'
import debug from 'debug'

const info = debug('register-server-handlers:server')

export const registerHandlerRoute = (server, handler, serverPath = '/', handlerOptions = {}) => {
  info(`registering route ${serverPath}${handler.type}`)
  server.post(`${serverPath}${handler.type}`, wrapInputInCloudEventThenHandle(handler, handlerOptions))
}

export const wrapInputInCloudEventThenHandle = (handler, handlerOptions = {}) => (req, reply) => {
  info(`creating cloudevent from POST for handler ${handler.type}`)

  const event = new CloudEvent({
    type: handler.type,
    source: 'http-post',
    data: req.body.input
  })

  info(`processing ${handler.type} with CloudEvent ${JSON.stringify(event, null, 2)}`)

  if (typeof handler.where === 'function' && !handler.where(event)) {
    reply.code(400)
      .header('Content-Type', 'application/json')
      .send({ err: '🚨 Message does not match where filter criteria' })
  } else {
    handler.handle(req, reply, event, handlerOptions)
  }
}
