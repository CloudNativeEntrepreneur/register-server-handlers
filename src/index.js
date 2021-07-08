import path from 'path'
import debug from 'debug'
import objectifyFolder from 'objectify-folder/modules.js'
import { registerHandlerRoute as registerCloudEventsHandlerRoute } from './server-cloudevents'
import { registerHandlerRoute } from './server'

const info = debug('register-server-handlers')

export const registerHandlers = async (options) => {
  const { server, path, serverPath = '/', cloudevents = false } = options

  if (!server) throw new Error('server is required')
  if (!path) throw new Error('path is required')

  const handlers = await objectifyFolder({
    fn: validateModuleAndAddToHandlers,
    path: options.path
  })

  info({ handlers })

  return new Promise((resolve, reject) => {
    const { server } = options

    info('registering handler routes to server')
    Object.keys(handlers).forEach(function (key) {
      const handler = handlers[key]

      if (cloudevents) {
        registerCloudEventsHandlerRoute(server, handler, serverPath)
      } else {
        registerHandlerRoute(server, handler, serverPath)
      }
    })

    resolve(handlers)
  })
}

export const validateModuleAndAddToHandlers = (importedModule, handlers, file) => {
  const messageType = path.parse(file).name
  info('imported module', importedModule, handlers, file)

  if (!importedModule.handle) return handlers

  info('imported module handle', importedModule.handle, typeof importedModule.handle)
  if (typeof importedModule.handle !== 'function') return handlers

  info(`${file} is valid - adding module to handlers`)
  handlers[messageType] = {
    type: messageType,
    ...importedModule
  }

  return handlers
}
