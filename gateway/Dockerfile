FROM node:16-buster-slim
ENV PORT 3200

WORKDIR /app
COPY ./package.json /app/
COPY ./server.js /app/

RUN npm install

EXPOSE ${PORT}
CMD [ "npm", "start" ]