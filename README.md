# Cache Manifest Validator

A Node.js based validator for cache manifest files: [manifest-validator.com](http://manifest-validator.com)

If you're looking for an easy way to create a manifest file for an existing project, try James Pearce's
[confess.js](https://github.com/jamesgpearce/confess), a PhantomJS based tool to enumerate a web app's resources.


## Requirements

- [node.js](http://nodejs.org/)
- [npm (Node Package Manager)](http://npmjs.org/)


## Installation

Having Node.js and npm installed, run these commands:

	npm install .
	node app.js

For running the tests, you also need the `nodeunit` package.


## API

The validation service can also be used by external tools. Either provide an URI to your manifest or the file's content as a string (GET and POST are supported). The API either returns a JSON or [JSONP](http://en.wikipedia.org/wiki/JSON#JSONP), when you provide the optional callback parameter.

Read the [Cache Manifest Validator API documentation](https://github.com/fhemberger/manifest-validator/wiki/API-Documentation).


## Chrome Extension

The validator is now also available as an [extension for Google Chrome](https://chrome.google.com/webstore/detail/lomdbpjnhnphfhgmaeedafmnfeikkcfo), you can [grab the source code here](https://github.com/fhemberger/manifest-validator.chrome).


## Textmate Bundle

I've also created a [TextMate bundle](https://github.com/fhemberger/CacheManifest.tmbundle/) with a default manifest template and a connection to the validation service.


## License

(The MIT-License)

Copyright (c) 2011-2012 Frederic Hemberger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
