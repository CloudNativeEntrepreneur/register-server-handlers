import path from "path";
import debug from "debug";
import objectifyFolder from "objectify-folder/modules.js";
import { registerHandlerRoute as registerCloudEventsHandlerRoute } from "./server-cloudevents";
import { registerHandlerRoute } from "./server";

const info = debug("register-server-handlers");

export const registerHandlers = async (options) => {
  const {
    server,
    path,
    serverPath = "/",
    cloudevents = false,
    handlerOptions = {},
  } = options;

  if (!server) throw new Error("server is required");
  if (!path) throw new Error("path is required");

  const handlers = await objectifyFolder({
    fn: validateModuleAndAddToHandlers,
    path: options.path,
  });

  info({ handlers });

  return new Promise((resolve, reject) => {
    const { server } = options;

    info("registering handler routes to server", serverPath);
    Object.keys(handlers).forEach(function (key) {
      const handler = handlers[key];

      if (cloudevents) {
        registerCloudEventsHandlerRoute(
          server,
          handler,
          serverPath,
          handlerOptions
        );
      } else {
        registerHandlerRoute(server, handler, serverPath, handlerOptions);
      }
    });

    resolve(handlers);
  });
};

export const validateModuleAndAddToHandlers = (
  importedModule,
  handlers,
  file
) => {
  if (file.includes(".d.ts") || file.includes(".js.map")) {
    return handlers;
  }

  const fileInfo = path.parse(file);
  const fileName = fileInfo.name;
  const messageType = fileName;

  info("imported module", importedModule, handlers, file, fileName);

  if (!importedModule.handle) return handlers;

  info(
    "imported module handle",
    importedModule.handle,
    typeof importedModule.handle
  );
  if (typeof importedModule.handle !== "function") return handlers;

  info(`${file} is valid - adding module to handlers`);
  handlers[messageType] = {
    type: messageType,
    ...importedModule,
  };

  return handlers;
};
