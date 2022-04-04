# MERN Stack Boilerplate Typescript

## Getting Started
- clone this repo
- create a file with the name `development.env` for development or `production.env` for production. the file must contain these variables
  ```
  NODE_ENV=development // 'production' for production

  SERVER_PORT=55555
  APP_HOST=http://localhost:5000 // your frontend host (or dev server)  

  DB_HOST=
  DB_PORT=
  DB_NAME=
  DB_USERNAME=
  DB_PASSWORD=

  SESSION_SECRET=
  SESSION_RESAVE=false
  SESSION_SAVE_UNINITIALIZED=false
  SESSION_COOKIE_SECURE=false
  SESSION_COOKIE_MAX_AGE=3600

  ACCESS_TOKEN_SECRET=
  REFRESH_TOKEN_SECRET=
  ACCESS_TOKEN_EXP_IN=3600

  ENCRYPTION_ALGORITHM=aes-256-cbc
  ENCRYPTION_KEY=
  ```

- run `npm run init:dev` for development or `npm run init:prod` for production
- run `npm run dev` to run the server for development or `npm run prod` for production
