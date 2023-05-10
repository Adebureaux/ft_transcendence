# ft_transcendence

A somewhat secure SPA using NestJS, Vue.js, and PostgreSQL with Prisma.io, featuring real-time chat via WebSockets, a friends system, 
and an online version of the Pong game
Ensured security with 2FA, OAuth, JWT, and utilized Docker Compose for streamlined deployment and development

## setup the project for development
- add a .env in the app directory with this variables:

      DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
      JWT_ACCESS_SECRET="SUPER_SECRET"
      JWT_REFRESH_SECRET="ANOTHER_SUPER_SECRET"
      TWO_FACTOR_AUTHENTICATION_APP_NAME="you_app_name"

      CLIENT_ID="42auth id"
      CLIENT_SECRET="42auth secret"
      CLIENT_URI="42auth  client uri https://api.intra.42.fr/xxx"
      REDIRECT_URI="http://localhost:9000/42/callback"
 
- in a terminal in the "app" directory run "npm install" to install the dependencies
- in a terminal in the "app" directory run "npm run back", in an other still in the "app" directory run "npm run front"
- voila !


## setup the project for production
- add a .env in the app directory with this variables:

      DATABASE_URL="postgresql://postgres:postgres@db:5432/mydb?schema=public"
      JWT_ACCESS_SECRET="SUPER_SECRET"
      JWT_REFRESH_SECRET="ANOTHER_SUPER_SECRET"
      TWO_FACTOR_AUTHENTICATION_APP_NAME="you_app_name"

      CLIENT_ID="42auth id"
      CLIENT_SECRET="42auth secret"
      CLIENT_URI="42auth  client uri https://api.intra.42.fr/xxx"
      REDIRECT_URI="http://__YOUR_URL__:9000/42/callback"
 
- in a terminal in the root directory run "docker-compose up --build"
- voila !


