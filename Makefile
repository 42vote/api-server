.DEFAULT_GOAL = all

TARGET = app.zip
SRC = dist/ \
		package.json \
		package-lock.json \
		Procfile \
		.platform/ \

$(TARGET): $(SRC)
	zip -r $@ $^

all: $(TARGET)

fclean:
	rm -rf $(TARGET)

re:	fclean
	$(MAKE)

.PHONY: all fclean re
