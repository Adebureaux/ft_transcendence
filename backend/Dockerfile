FROM		alpine:3.14

RUN			apk update
RUN			apk upgrade

RUN			apk add --update git nodejs-current npm
RUN			mkdir -p /var/www/html/backend
VOLUME		["/var/www/html/backend"]

EXPOSE		3030

WORKDIR 	/var/www/html/backend
ENTRYPOINT	["./entrypoint.sh"]
