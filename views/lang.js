module.exports = {
	ERR_INVALID_URI       : 'Invalid URI.',
	ERR_LOAD_URI          : 'Error loading manifest file by URI.',
	ERR_INVALID_FILE      : 'Invalid file type: Only text files allowed.',
	ERR_LOAD_FILE         : 'Error loading uploaded manifest file.',
	ERR_EMPTY_FILE        : 'Could not validate manifest: File is empty.',
	ERR_RESOURCE_ERROR    : 'Error parsing resource',
	ERR_MANIFEST_MIMETYPE : 'Server must deliver cache manifest with the MIME type "text/cache-manifest".',
	ERR_MANIFEST_HEADER   : 'Cache manifest must start with CACHE MANIFEST in first line.',
	ERR_MANIFEST_INVALID_RESOURCE : 'Invalid resource identifier.',
	ERR_FALLBACK_SAME_ORIGIN : 'Fallback resources must be from the same origin (i.e. identical protocol, hostname and port) as manifest file.',
	ERR_WHITELIST_SAME_SHEME : 'Whitelist resource must have the same URI sheme (i.e. protocol) as manifest file.'
};
