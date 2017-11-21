ifeq ($(OS),Windows_NT)
    OPEN := start
else
    UNAME := $(shell uname -s)
    ifeq ($(UNAME),Linux)
        OPEN := xdg-open
    endif
    ifeq ($(UNAME),Darwin)
        OPEN := open
    endif
endif

COMPILER := $(shell command -v closure-compiler 2> /dev/null)

.PHONY: demo test dist

demo:
	$(OPEN) demo/index.html

test:
	$(OPEN) test/SpecRunner.html

SOURCE := src/jquery.multi-select.js
DEST := src/jquery.multi-select.min.js

dist:
ifndef COMPILER
	$(error "closure-compiler is not available, please install it")
endif
	@echo "Before"
	wc -c $(DEST) && gzip -c $(DEST) | wc -c
	$(COMPILER) --externs externs/jquery-1.9.js -O ADVANCED --rewrite_polyfills=false $(SOURCE) > $(DEST)
	@echo "After"
	wc -c $(DEST) && gzip -c $(DEST) | wc -c
