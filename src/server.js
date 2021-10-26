import { CloudEvent } from 'cloudevents'
import debug from 'debug'
import { handleCloudEvent } from './handleCloudEvent'

const info = debug('register-server-handlers:server')

export const registerHandlerRoute = (server, handler, serverPath = '/', handlerOptions = {}) => {
  info(`registering route ${serverPath}${handler.type}`)
  server.post(`${serverPath}${handler.type}`, wrapInputInCloudEventThenHandle(handler, handlerOptions))
}

export const wrapInputInCloudEventThenHandle = (handler, handlerOptions = {}) => async (request, response) => {
  info(`creating cloudevent from POST for handler ${handler.type}`)

  const cloudevent = new CloudEvent({
    type: handler.type,
    source: 'http-post',
    data: request.body.input
  })

  await handleCloudEvent({ request, response, handler, handlerOptions, cloudevent })
}
