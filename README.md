# register-server-handlers

Registers a folder of handlers as HTTP POST routes on a server

## Usage

### Startup

On startup, call `registerHandlers`

```javascript
import path from 'path'
import fastify from 'fastify'
import { registerHandlers } from 'register-server-handlers'

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
  return reply.code(200).send({ status: 'complete' })
}
```

This will register `/example.handle` as an HTTP Post endpoint.

## CloudEvents

If you expect to receive messages in the [CloudEvents format](https://cloudevents.io/), you can set `cloudevents: true`.

```javascript
await registerHandlers({
  server,
  path: path.resolve(process.cwd(), 'src', 'handlers'),
  cloudevents: true
})
```

This will cause your handlers to receive a third parameter that contains the cloud event.

```javascript
export const handle = async (req, reply, event) => {
  const { data, type, source } = event
  // do stuff
  // then reply
  return reply.code(200).send({ status: 'complete' })
}
```

## serverPath

The default server path is `/`, which the filename without the extension is appended to.

To customize this path, set `serverPath` to a custom value.

For example, if you want to receive cloud events at `/events/${eventname}`

```javascript
await registerHandlers({
  server,
  path: path.resolve(process.cwd(), 'src', 'handlers'),
  serverPath: '/events/'
})
```
