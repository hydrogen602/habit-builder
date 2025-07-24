.PHONY: build

build:
	rm -rf docs
	npm run build
	mv build/client docs
