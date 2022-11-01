FROM	alpine:3.14

RUN		apk update
RUN		apk upgrade

RUN		apk add --update git nodejs-current npm python3-dev

RUN		apk add nginx
RUN		mkdir -p /var/www/html/
COPY	default.conf /etc/nginx/http.d/default.conf

RUN		apk add openrc
RUN		rc-update add nginx default

VOLUME		["/var/www/html"]

EXPOSE	8010

WORKDIR 	/var/www/html
ENTRYPOINT	["./entrypoint.sh"]
