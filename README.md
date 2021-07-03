# register-server-handlers

Registers a folder of handlers as HTTP POST routes on a server

## Usage

### Startup

On startup, call `registerHandlers`

```javascript
import path from 'path'
import fastify from 'fastify'
import registerHandlers from 'register-server-handlers'

const server = fastify({
  ignoreTrailingSlash: true,
  logger: true
})

export const start = async (server) => {

  await registerHandlers({
    server,
    path: path.resolve(process.cwd(), 'src', 'handlers')
  })

  try {
    await server.listen(port)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start(server)
```

## Handlers

Each handler in the given directory must export a named function `handle`

For example, `src/handlers/example.handle.js`:

```javascript
export const handle = async (req, reply) => {
  // do stuff
  // then reply
  return reply.code(202).send({ status: 'complete' })
}
```

This will register `/example.handle` as an HTTP Post endpoint.