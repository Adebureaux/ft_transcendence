
FROM node:18-slim

USER node

COPY --chown=node:node app /app

WORKDIR /app

RUN npm install

# RUN npm upgrade

RUN mkdir images

RUN chown node:node images

CMD ["npm", "run", "prod"]