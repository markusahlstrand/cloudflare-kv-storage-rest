const { expect } = require('chai');
const nock = require('nock');

global.fetch = require('node-fetch');
global.FormData = require('form-data');

const KvStorage = require('../src/index');

describe('kv-storage', () => {
  describe('get', () => {
    it('should return a single key', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
        fetch,
      });
      nock('https://api.cloudflare.com')
        .get('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, 'value');

      const value = await kvStorage.get('key');

      expect(value).to.equal('value');
    });

    it('should return a single key as json', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });
      nock('https://api.cloudflare.com')
        .get('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, '{"foo":"bar"}');

      const value = await kvStorage.get('key', 'json');

      expect(value.foo).to.equal('bar');
    });

    it('should return a single key as text', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });
      nock('https://api.cloudflare.com')
        .get('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, '{"foo":"bar"}');

      const value = await kvStorage.get('key', 'text');

      expect(value).to.equal('{"foo":"bar"}');
    });

    it('should return a single key as stream', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });
      nock('https://api.cloudflare.com')
        .get('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, '{"foo":"bar"}');

      const value = await kvStorage.get('key', 'stream');

      expect(value.readable).to.be.true;
    });

    it('should return a single key as arrayBuffer', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });
      nock('https://api.cloudflare.com')
        .get('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, '{"foo":"bar"}');

      const value = await kvStorage.get('key', 'arraybuffer');

      expect(value).to.be.instanceOf(ArrayBuffer);
    });
  });

  describe('getWithMetadata', () => {
    it('should fetch a key with metadata', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .get('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, 'value');

      nock('https://api.cloudflare.com')
        .get(
          '/client/v4/accounts/accountId/storage/kv/namespaces/namespace/keys?prefix=key&limit=10',
        )
        .reply(200, {
          result: [{ metadata: { foo: 'bar' } }],
          result_info: { count: 1, cursor: 'fake_cursor' },
        });

      const { value, metadata } = await kvStorage.getWithMetadata('key');
      expect(value).to.equal('value');
      expect(metadata.foo).to.equal('bar');
    });
  });

  describe('put', () => {
    it('should put a single key', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .put('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, 'OK');

      const response = await kvStorage.put('key', 'value');

      expect(response).to.be.true;
    });

    it('should put a single key with exipiration', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .put(
          '/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key?expiration=1234',
        )
        .reply(200, 'OK');

      const response = await kvStorage.put('key', 'value', { expiration: 1234 });

      expect(response).to.be.true;
    });

    it('should put a single key with ttl', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .put(
          '/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key?expiration_ttl=1234',
        )
        .reply(200, 'OK');

      const response = await kvStorage.put('key', 'value', { expirationTtl: 1234 });

      expect(response).to.be.true;
    });

    it('should put a single key with metadata', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .put('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, 'OK');

      const response = await kvStorage.put('key', 'value', { metadata: { foo: 'bar' } });

      expect(response).to.be.true;
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .delete('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/values/key')
        .reply(200, 'OK');

      const response = await kvStorage.delete('key');

      expect(response).to.be.true;
    });
  });

  describe('list', () => {
    it('should list all keys', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .get('/client/v4/accounts/accountId/storage/kv/namespaces/namespace/keys')
        .reply(200, {
          success: true,
          errors: [],
          messages: [],
          result: [
            {
              name: 'My-Key',
              expiration: 1577836800,
              metadata: {
                someMetadataKey: 'someMetadataValue',
              },
            },
          ],
          result_info: {
            count: 1,
            cursor:
              '6Ck1la0VxJ0djhidm1MdX2FyDGxLKVeeHZZmORS_8XeSuhz9SjIJRaSa2lnsF01tQOHrfTGAP3R5X1Kv5iVUuMbNKhWNAXHOl6ePB0TUL8nw',
          },
        });

      const response = await kvStorage.list();

      expect(response.keys.length).to.be.equal(1);
      expect(response.list_complete).to.be.true;
      expect(response.cursor).to.exist;
    });

    it('should list keys with prefix, limit and cursor', async () => {
      const kvStorage = new KvStorage({
        namespace: 'namespace',
        accountId: 'accountId',
      });

      nock('https://api.cloudflare.com')
        .get(
          '/client/v4/accounts/accountId/storage/kv/namespaces/namespace/keys?prefix=test&limit=10&cursor=fake-cursor',
        )
        .reply(200, {
          success: true,
          errors: [],
          messages: [],
          result: [
            {
              name: 'My-Key',
              expiration: 1577836800,
              metadata: {
                someMetadataKey: 'someMetadataValue',
              },
            },
          ],
          result_info: {
            count: 1,
            cursor:
              '6Ck1la0VxJ0djhidm1MdX2FyDGxLKVeeHZZmORS_8XeSuhz9SjIJRaSa2lnsF01tQOHrfTGAP3R5X1Kv5iVUuMbNKhWNAXHOl6ePB0TUL8nw',
          },
        });

      await kvStorage.list({ prefix: 'test', limit: 10, cursor: 'fake-cursor' });
    });
  });
});
