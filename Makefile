all: start

start:
	@docker-compose	up	--build \
						--remove-orphans

stop:
	@docker-compose	down

clean:
	# Remove locals volumes

fclean: clean
	@docker rm -f backend frontend nginx postgres
	@docker rmi -f backend frontend nginx postgres

re: stop fclean start

.PHONY: all start stop clean fclean re
