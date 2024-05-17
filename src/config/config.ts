import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  cloudinaryCloud: process.env.ClOUDINARY_CLOUD,
  cloudinaryApiKey: process.env.ClOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.ClOUDINARY_API_SECRET,
};

export const config = Object.freeze(_config);
