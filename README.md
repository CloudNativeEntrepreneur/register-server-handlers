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

  // create post handlers for each file in folder src/handlers at `/<filename without extension>`
  await registerHandlers({
    server,
    path: path.resolve(process.cwd(), 'src', 'handlers')
  })

  // create post handlers for cloudevents with same handlers at `/cloudevents/<filename without extension>`
  await registerHandlers({
    server,
    path: path.resolve(process.cwd(), 'src', 'handlers'),
    cloudevents: true,
    serverPath: '/cloudevent/'
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

Each handler in the given directory must export a named function `handle`, and optionally, a `where` filter.

For example, `src/handlers/example.handle.js`:

```javascript
// if message.data.id is not provided, a 400 response will be sent and the handler will not execute
// makes for easy, declarative validation and unit testing
export const where = (message) => message.data && message.data.id

// "message" is a CloudEvent
export const handle = async (req, reply, message) => {
  const { data, type, source } = message
  const { id } = message
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

## serverPath

The default server path is `/`, which the filename without the extension is appended to.

To customize this path, set `serverPath` to a custom value.

For example, if you want to receive cloud events at `/cloudevent/${eventname}`

```javascript
await registerHandlers({
  server,
  path: path.resolve(process.cwd(), 'src', 'handlers'),
  cloudevents: true,
  serverPath: '/cloudevent/'
})
```

# knativebus

The intended usage for this is to build CQRS/ES systems with KNative. If you're interested in doing something similar, this library works well with [knativebus](https://github.com/CloudNativeEntrepreneur/knativebus).

Configured correctly, sending cloudevents to the cloudevent handlers via knativebus can be accomplished with:

```javascript
await bus.send('example.initialize', { id: 1, name: 'Example 1' })
```

This would `Trigger` a handler on a service subscibed to the `example-commands` broker (see knative docs for examples of creating brokers). The handler would receive a cloudevent with type `example.initialize`, therefore handled by `src/handlers/example.initialize.js` in the above configuration.

```yaml
apiVersion: eventing.knative.dev/v1
kind: Trigger
metadata:
  name: example.initialize
spec:
  broker: example-commands
  filter:
    attributes:
      type: example.initialize
  subscriber:
    ref:
{{- if .Values.knativeDeploy }}
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: example-model
{{- else }}
      apiVersion: v1
      kind: Service
      name: example-model
{{- end }}
    uri: /cloudevent/example.initialize
```
