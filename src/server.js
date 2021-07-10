import { CloudEvent } from 'cloudevents'
import debug from 'debug'

const info = debug('register-server-handlers:server')

export const registerHandlerRoute = (server, handler, serverPath = '/', handlerOptions = {}) => {
  info(`registering route ${serverPath}${handler.type}`)
  server.post(`${serverPath}${handler.type}`, wrapInputInCloudEventForHandler(handler.handle, handlerOptions))
}

export const wrapInputInCloudEventForHandler = (handler, handlerOptions = {}) => (req, reply) => {
  info(`creating cloudevent from POST for handler ${handler.type}`)

  const event = new CloudEvent({
    type: handler.type,
    source: 'http-post',
    data: req.body.input
  })

  return handler.handle(req, reply, event, handlerOptions)
}
