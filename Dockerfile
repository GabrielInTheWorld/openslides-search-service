FROM node:16.10 AS build

WORKDIR /app

# Install dependencies. the `node_modules` folder is in /app
COPY search-service/package.json .
COPY search-service/package-lock.json .

RUN npm ci

# Application lays in /app/src
COPY ./search-service ./

# Now the source-files can be transpiled
RUN npm run build

RUN npm prune --production

FROM node:16.10-alpine

WORKDIR /app

COPY --from=build /app/build .
COPY --from=build /app/entrypoint.sh .
COPY --from=build /app/wait-for.sh .
COPY --from=build /app/node_modules ./node_modules

EXPOSE 9022
ENTRYPOINT [ "./entrypoint.sh" ]

CMD ["node", "index.js"]