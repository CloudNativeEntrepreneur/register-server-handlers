import { HTTP } from 'cloudevents'
import debug from 'debug'

const info = debug('register-handlers:server-cloudevents')
const error = debug('register-handlers:server-cloudevents:error')

export const registerHandlerRoute = (server, handler, serverPath = '/') => {
  info(`registering route /${handler.type}`)
  server.post(`/${handler.type}`, parseCloudEventForHandler(handler))
}

export const parseCloudEventForHandler = (handler) => (req, reply) => {
  info(`starting handler for ${handler.type}`)
  try {
    const event = HTTP.toEvent({ headers: req.headers, body: req.body })
    info(`Accepted event: ${JSON.stringify(event, null, 2)}`)

    // TODO: feat: filter further via "where" clause for declaritive validation in handlers

    return handler.handle(req, reply, event)
  } catch (err) {
    error(err)
    return reply.code(415)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify(err))
  }
}
