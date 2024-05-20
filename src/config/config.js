"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloud: process.env.ClOUDINARY_CLOUD,
    cloudinaryApiKey: process.env.ClOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.ClOUDINARY_API_SECRET,
    frontendDomain: process.env.FRONTEND_DOMAIN,
};
exports.config = Object.freeze(_config);
