test: 
	@echo "Running unit tests..."
	@if [ ! -d "instrumented" ]; then mkdir instrumented; fi
	@rm -rf instrumented/*
	@./node_modules/.bin/istanbul instrument ./src --output ./instrumented --save-baseline --x "*_test.js"
	@rsync -zarv  --prune-empty-dirs --include "*/"  --include="*_test.js" --exclude="*" src/ instrumented/

	@node test/unit/run-tests.js

.PHONY: all test build