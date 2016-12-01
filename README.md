# Cache Manifest Validator
![Project is unmaintained](https://img.shields.io/badge/status-unmaintained-red.svg?style=flat-square)

An Node.js based validator for cache manifest files

> ### Notice
> **Appcache has been marked as deprecated in browsers and will be removed soon, also from [the upcoming HTML spec](https://lists.w3.org/Archives/Public/public-html/2016May/0032.html). You can still use this project on your own, but the code and the website won't be maintained any longer.** Please use Service Worker instead, to make websites offline capable.
>
> ### Service Worker API
> Service Workers are providing a better programmatic interface for network requests and more granular control over handling offline resources.
>
> - [Service Workers Specification (Editor’s Draft)](https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html)
> - [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
> - [HTML5 Rocks: Introduction to Service Worker](http://www.html5rocks.com/en/tutorials/service-worker/introduction/)
> - [Is Service Worker ready?](https://jakearchibald.github.io/isserviceworkerready/index.html)
> - [caniuse.com](http://caniuse.com/#feat=serviceworkers)


## Installation

Using [Node.js](http://nodejs.org/), first get all required dependencies with `npm install`, then use `npm start` to start the application. Unit tests can be executed with `npm test`.


## API

The validation service can also be used by external tools. Either provide an URI to your manifest or the file's content as a string (GET and POST are supported). The API either returns a JSON or [JSONP](http://en.wikipedia.org/wiki/JSON#JSONP), when you provide the optional callback parameter.


## License

(The MIT-License)

Copyright (c) 2011-2016 Frederic Hemberger

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
