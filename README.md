# cloudflare-kv-storage-rest

Tiny javascript and node wrapper for the cloudflare kv-storage rest-api.

There are a few api-wrappers available on github but so far I haven't found any that supports the new metadata functionality.

The idea with library is to create a wrapper around the the rest api that works exactly as the runtime API (https://developers.cloudflare.com/workers/reference/apis/kv)

To use this is node add node-fetch and form-data to the global context:

```
global.fetch = require('node-fetch');
global.FormData = require('form-data');
```
