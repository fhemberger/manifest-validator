'use strict';


exports.index = {
    handler: function (request, reply) {

        return reply.view('index', {
            _view: 'index'
        });
    }
};


exports.redirectValidate = {
    handler: function (request, reply) {

        return reply.redirect('/').permanent(true);
    }
};


exports.validate = {
    payload: {
        output: 'data'
    },
    handler: function (request, reply) {

        // Handle file uploads, turn into 'directinput'
        if (request.payload.upload && Buffer.isBuffer(request.payload.upload)) {
            request.payload.directinput = request.payload.upload.toString();
            delete request.payload.upload;
        }

        request.server.inject({
            method  : 'POST',
            url     : '/api/validate',
            payload : request.payload
        }, function (res) {

            return reply.view('result', {
                _view  : 'result',
                result : res.result.result
            });

        });
    }
};


