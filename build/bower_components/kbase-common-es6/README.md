# KBase UI ES6 Library

## Testing

Unit testing ES6 AMD modules?

In this project, we create unit test modules in-situ with the module they are providing tests for.

This makes for self-documenting tests.

However the challenge is that the tests are written as AMD modules. This makes sense since they are colocated with their target modules, and the same module construction while not necessary is easier to understand. It fits the way the modules are to be used by consumers.

However, the test runner will be command-line based using nodejs. This creates a barrier between the test runner and the tested code.

One approach is to utilize requirejs in node. This is the initial approach chosen here. This facilitates very fast test running, which can be conducted during coding sessions to provide immediate feedback. 

The end user tool is a makefile (make test). This also makes it easy to integrate into a consuming project. After all, how is the consuming project to evaluate the quality of the library without running tests itself? This is the strategy of some newly-engineered languages and toolsets, such as golang.

Another approach would be (and will be utilized here) to utilize nodejs to manipulate test sessions using a headless browser. This requires quite a bit of extra setup, from installing local browsers, to creating a local test server to provide the files to the server, and creating an index page to serve and execute the test scripts.