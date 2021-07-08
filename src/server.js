import debug from 'debug'

const info = debug('register-server-handlers:server')

export const registerHandlerRoute = (server, handler, serverPath = '/') => {
  info(`registering route ${serverPath}${handler.type}`)
  server.post(`${serverPath}${handler.type}`, handler.handle)
}
