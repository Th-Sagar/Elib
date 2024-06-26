FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./


RUN npm ci

COPY . .

RUN npm run build

#  "build": "tsc",
# "docker:publish": "docker build -t chester12/elib-backend:v2 --platform linux/amd64 . && docker push chester12/elib-backend:v2"

# build production image


FROM node:18-alpine 

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci

# or run npm ci --omit=dev


COPY --from=builder /app/dist ./dist


RUN chown -R node:node /app && chmod -R 755 /app


RUN npm install pm2 -g

COPY ecosystem.config.js .

USER node


EXPOSE 5513

CMD ["pm2-runtime", "start", "ecosystem.config.js"]


#  to run in cli  docker build -t chester12/elib-backend:v1 --platform linux/amd64 .
#  to push in docker hub docker push chester12/elib-backend:v1

# npm run docker:publish