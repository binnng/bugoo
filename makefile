build:
	@rm -fr dist docs && mkdir dist
	@uglifyjs src/bugoo.js -m >> dist/min.bugoo.js
	@docco src/bugoo.js