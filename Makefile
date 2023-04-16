.DEFAULT_GOAL = all

TARGET = app.zip
SRC = dist/ \
		package.json \
		Procfile

$(TARGET): $(SRC)
	npm run build
	zip -r $@ $^

all: $(TARGET)

fclean:
	rm -rf $(TARGET)

re:	fclean
	$(MAKE)

.PHONY: all fclean re
