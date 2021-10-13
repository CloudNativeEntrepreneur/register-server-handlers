import { HTTP } from 'cloudevents'
import debug from 'debug'
import { handleCloudEvent } from './handleCloudEvent'

const info = debug('register-server-handlers:server-cloudevents')

export const registerHandlerRoute = (server, handler, serverPath = '/', handlerOptions = {}) => {
  info(`registering route ${serverPath}${handler.type}`)
  server.post(`${serverPath}${handler.type}`, parseCloudEventThenHandle(handler, handlerOptions))
}

export const parseCloudEventThenHandle = (handler, handlerOptions = {}) => async (request, reply) => {
  info(`parsing cloud event for handler ${handler.type}`)

  const cloudevent = HTTP.toEvent({
    headers: request.headers,
    body: request.body
  })

  await handleCloudEvent({ request, reply, handler, handlerOptions, cloudevent })
}
