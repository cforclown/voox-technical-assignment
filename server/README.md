# MERN Stack Boilerplate Typescript

## Getting Started
- clone this repo
- go to `server` folder
- create a file with the name `development.env` for development or `production.env` for production. the file must contain these variables
  ```
  NODE_ENV=development

  SERVER_PORT=55555
  APP_HOST=http://localhost:5000

  DB_HOST=<database-host>
  DB_PORT=<database-port>
  DB_NAME=<database-name>
  DB_USERNAME=<database-username>
  DB_PASSWORD=<database-password>

  SESSION_SECRET=<session-secret-key>
  SESSION_RESAVE=false
  SESSION_SAVE_UNINITIALIZED=false
  SESSION_COOKIE_SECURE=false
  SESSION_COOKIE_MAX_AGE=3600

  ACCESS_TOKEN_SECRET=<access-token-key>
  REFRESH_TOKEN_SECRET=<refresh-token-key>
  ACCESS_TOKEN_EXP_IN=3600

  ENCRYPTION_ALGORITHM=aes-256-cbc
  ENCRYPTION_KEY=<your-encryption-key>
  ```
- run `npm install`
- run `npm run init:dev` for development or `npm run init:prod` for production
- run `npm run dev` to run the server for development or `npm run prod` for production

- go to `app` folder
- run `npm install`
- run `npm start`
- open in browser `http://localhost:5000`
- login with username `admin`, password `root`

### THANKS!
