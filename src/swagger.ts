import { config } from "./config/config";
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: config.port,
};

const outputFile = "./swagger-output.json";
const routes = ["./book/bookRouter.ts", "./user/userRouter.ts"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
  root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);
