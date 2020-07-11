# cloudflare-kv-storage-rest

Tiny javascript and node wrapper for the cloudflare kv-storage rest-api.

There are a few api-wrappers available on github but so far I haven't found any that supports the new metadata functionality.

The idea with library is to create a wrapper around the the rest api that works exactly as the runtime API (https://developers.cloudflare.com/workers/reference/apis/kv)

## Usage in browser

Create an instance of Kv-Storage. The instance will expose the same api as the variable in the runtime API.

## Usage in nodejs

To use this is nodejs you can add node-fetch and form-data to the global context:

```
global.fetch = require('node-fetch');
global.FormData = require('form-data');
```

Another options is to pass the fetch and form-data shims to the constructor

```
const fetch = require('node-fetch');
const FormData = require('form-data');

const kvStorage = new KvStorage({
    namespace: 'namespace',
    accountId: 'accountId',
    fetch,
    FormData,
});
```
