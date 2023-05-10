# mkdir -p ~/goinfre/db_volume;
# docker-compose -f ./docker-compose.yml up --build -d;
sleep 2;
npx prisma migrate deploy;
npx prisma generate;
cd client && npx quasar build && cd ..;

NODE_ENV=prod nest start;