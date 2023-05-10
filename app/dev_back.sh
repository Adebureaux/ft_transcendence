mkdir -p ~/goinfre/db_volume;
docker-compose -f ./docker-compose.yml up --build -d;
sleep 2;
npx prisma migrate dev -n update;
npx nest start --watch;