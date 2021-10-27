// import schema from "./schema";
import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  memorySize: 512,
  timeout: 30,
  events: [
    {
      http: {
        method: "get",
        cors: true,
        path: "azureToken",
        private: true,
        // request: {
        //   schema: {
        //     "application/json": schema,
        //   },
        // },
      },
    },
  ],
};
