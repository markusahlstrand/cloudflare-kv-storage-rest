const lodashGet = require('lodash.get');

const _ = {
  get: lodashGet,
};

module.exports = class KvStorage {
  constructor({ accountId, namespace, authEmail, authKey }) {
    this.accountId = accountId;
    this.namespace = namespace;
    this.authEmail = authEmail;
    this.authKey = authKey;
  }

  getNamespaceUrl() {
    return new URL(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespace}`,
    );
  }

  getUrlForKey(key) {
    return new URL(`${this.getNamespaceUrl()}/values/${key}`);
  }

  async list(options = {}) {
    const { prefix, limit, cursor } = options;
    const url = new URL(`${this.getNamespaceUrl()}/keys`);

    const searchParams = new URLSearchParams();

    if (prefix) {
      searchParams.append('prefix', prefix);
    }

    if (limit) {
      searchParams.append('limit', limit);
    }

    if (cursor) {
      searchParams.append('cursor', cursor);
    }

    url.search = searchParams.toString();

    // eslint-disable-next-line no-undef
    const response = await fetch(url, {
      headers: {
        'X-Auth-Email': this.authEmail,
        'X-Auth-Key': this.authKey,
      },
    });

    if (response.ok) {
      const body = await response.json();

      return {
        keys: body.result,
        list_complete: body.result_info.count < (limit || 1000),
        cursor: body.result_info.cursor,
      };
    }

    return null;
  }

  async get(key, type = 'text') {
    const url = this.getUrlForKey(key);

    // eslint-disable-next-line no-undef
    const response = await fetch(url, {
      headers: {
        'X-Auth-Email': this.authEmail,
        'X-Auth-Key': this.authKey,
      },
    });

    if (response.ok) {
      switch (type) {
        case 'text':
          return response.text();
        case 'json':
          return response.json();
        case 'stream':
          return response.body;
        case 'arraybuffer':
          return response.arrayBuffer();
        default:
          throw new Error('Type not supported');
      }
    }

    return null;
  }

  async getWithMetadata(key, type) {
    const [value, keys] = await Promise.all([
      this.get(key, type),
      this.list({ prefix: key, limit: 10 }),
    ]);

    const metadata = _.get(keys, 'keys.0.metadata', {});
    return {
      value,
      metadata,
    };
  }

  async put(key, value, options = {}) {
    const { expiration, expirationTtl, metadata } = options;

    const url = this.getUrlForKey(key);
    const searchParams = new URLSearchParams();

    if (expiration) {
      searchParams.append('expiration', expiration);
    } else if (expirationTtl) {
      searchParams.append('expiration_ttl', expirationTtl);
    }

    const headers = {
      'X-Auth-Email': this.authEmail,
      'X-Auth-Key': this.authKey,
    };

    url.search = searchParams.toString();

    // eslint-disable-next-line no-undef
    const formData = new FormData();
    formData.append('value', value);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // eslint-disable-next-line no-undef
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: { ...formData.headers, ...headers },
      body: value,
    });

    return response.ok;
  }

  async delete(key) {
    const url = this.getUrlForKey(key);

    // eslint-disable-next-line no-undef
    const response = await fetch(url, {
      headers: {
        'X-Auth-Email': this.authEmail,
        'X-Auth-Key': this.authKey,
      },
      method: 'DELETE',
    });

    return response.ok;
  }
};
