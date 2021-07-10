import { HTTP } from 'cloudevents'
import debug from 'debug'

const info = debug('register-server-handlers:server-cloudevents')
const error = debug('register-server-handlers:server-cloudevents:error')

export const registerHandlerRoute = (server, handler, serverPath = '/', handlerOptions = {}) => {
  info(`registering route ${serverPath}${handler.type}`)
  server.post(`${serverPath}${handler.type}`, parseCloudEventForHandler(handler, handlerOptions))
}

export const parseCloudEventForHandler = (handler, handlerOptions = {}) => (req, reply) => {
  info(`parsing cloud event for handler ${handler.type}`)
  try {
    const event = HTTP.toEvent({ headers: req.headers, body: req.body })
    info(`Accepted event: ${JSON.stringify(event, null, 2)}`)

    // TODO: feat: filter further via "where" clause for declaritive validation in handlers

    return handler.handle(req, reply, event, handlerOptions)
  } catch (err) {
    error(err)
    return reply.code(415)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify(err))
  }
}
