build:
	@rm -fr dist docs fm/dist && mkdir dist && mkdir fm/dist
	@uglifyjs src/bugoo.js -m >> dist/min.bugoo.js
	@uglifyjs fm/scripts/fm.js --wrap -m >> fm/dist/min.fm.js
	@./node_modules/clean-css/bin/cleancss fm/styles/fm.css >> fm/dist/min.fm.css
	@docco src/bugoo.js