# Cache Manifest Validator
[![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url] [![devDependency Status][david-dev-image]][david-dev-url]

An io.js based validator for cache manifest files: [manifest-validator.com](http://manifest-validator.com)

If you're looking for an easy way to create a manifest file for an existing project, try James Pearce's [confess.js](https://github.com/jamesgpearce/confess), a PhantomJS based tool to enumerate a web app's resources.


## Installation

Using [io.js](http://iojs.org/), first get all required dependencies with `npm install`, then use `npm start` to start the application. Unit tests can be executed with `npm test`.


## API

The validation service can also be used by external tools. Either provide an URI to your manifest or the file's content as a string (GET and POST are supported). The API either returns a JSON or [JSONP](http://en.wikipedia.org/wiki/JSON#JSONP), when you provide the optional callback parameter.

Try out the interactive [Cache Manifest Validator API documentation](http://manifest-validator.com/documentation).


## License

(The MIT-License)

Copyright (c) 2011-2015 Frederic Hemberger

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

[travis-image]: http://img.shields.io/travis/fhemberger/manifest-validator.svg
[travis-url]: https://travis-ci.org/fhemberger/manifest-validator
[david-image]: http://img.shields.io/david/fhemberger/manifest-validator.svg
[david-url]: https://david-dm.org/fhemberger/manifest-validator
[david-dev-image]: http://img.shields.io/david/dev/fhemberger/manifest-validator.svg
[david-dev-url]: https://david-dm.org/fhemberger/manifest-validator#info=devDependencies
