FROM node:14

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build
RUN pwd
WORKDIR /app/client
RUN pwd
RUN npm install
RUN npm run build

FROM node:14

WORKDIR /app
COPY --from=0 /app/package.* ./
RUN npm install --only=production
COPY --from=0 /app/build ./
COPY public ./public
COPY --from=0 /app/client/index.html ./public
COPY --from=0 /app/client/index.*.js ./public
COPY --from=0 /app/client/index.*.css ./public

ENV NODE_ENV=production
ENV TYPEORM_CONNECTION=sqlite
ENV TYPEORM_HOST=localhost
ENV TYPEORM_DATABASE=/app/db/database.sqlite
ENV TYPEORM_SYNCHRONIZE=false
ENV TYPEORM_ENTITIES=/app/src/entity/*.js
ENV TYPEORM_MIGRATIONS=/app/src/migration/*.js

EXPOSE 3000
CMD npm start
