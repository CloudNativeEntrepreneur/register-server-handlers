import path from 'path'
import debug from 'debug'
import objectifyFolder from 'objectify-folder/modules.js'

const info = debug('register-handlers')

export default async function (options) {
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
      server.post(`/${handler.type}`, handler.handle)
      info(`/${handler.type} registered`)
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
