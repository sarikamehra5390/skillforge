import test, { before } from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map([['token', 'existing-token']]);
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};

let api;
let apiTimeoutMs;
let useAuthStore;
let getLoginButtonState;

before(async () => {
  const axiosClient = await import('../api/axios.js');
  api = axiosClient.default;
  apiTimeoutMs = axiosClient.API_TIMEOUT_MS;
  useAuthStore = (await import('./useAuthStore.js')).default;
  ({ getLoginButtonState } = await import('../utils/loginButtonState.js'));
});

const reset = (token = null) => {
  storage.clear();
  if (token) storage.set('token', token);
  useAuthStore.setState({
    user: null,
    token,
    isAuthenticated: Boolean(token),
    authChecked: !token,
    authChecking: false,
    loginLoading: false,
    registerLoading: false,
    profileUpdating: false,
    error: null,
    _checkAuthPromise: null,
    _authRevision: 0,
  });
};

test('an existing token does not put the login button into its submitted state', () => {
  const initial = useAuthStore.getState();
  assert.equal(initial.token, 'existing-token');
  assert.equal(initial.loginLoading, false);
  assert.deepEqual(getLoginButtonState(initial.loginLoading), {
    disabled: false,
    showSpinner: false,
    label: 'Enter the Forge',
  });
});

test('the API client has a finite configurable request timeout', () => {
  assert.equal(api.defaults.timeout, apiTimeoutMs);
  assert.ok(apiTimeoutMs > 0);
});

test('auth restoration with an existing token is deduplicated and independent of login loading', async (t) => {
  reset('existing-token');
  let resolveRequest;
  let calls = 0;
  const originalGet = api.get;
  api.get = () => {
    calls += 1;
    return new Promise((resolve) => { resolveRequest = resolve; });
  };
  t.after(() => { api.get = originalGet; });

  const first = useAuthStore.getState().checkAuth();
  const second = useAuthStore.getState().checkAuth();
  assert.equal(calls, 1);
  assert.equal(useAuthStore.getState().authChecking, true);
  assert.equal(useAuthStore.getState().loginLoading, false);
  resolveRequest({ data: { _id: 'user-1' } });
  assert.equal(await first, true);
  assert.equal(await second, true);
  assert.equal(useAuthStore.getState().authChecking, false);
  assert.equal(useAuthStore.getState().isAuthenticated, true);
});

test('successful login stores the returned session and always clears login loading', async (t) => {
  reset();
  const originalPost = api.post;
  api.post = async (path, payload) => {
    assert.equal(path, '/users/login');
    assert.deepEqual(payload, { email: 'learner@example.com', password: 'secret1' });
    return { data: { token: 'new-token', user: { _id: 'user-1' } } };
  };
  t.after(() => { api.post = originalPost; });

  assert.equal(await useAuthStore.getState().login({ email: 'learner@example.com', password: 'secret1' }), true);
  assert.equal(useAuthStore.getState().loginLoading, false);
  assert.equal(useAuthStore.getState().isAuthenticated, true);
  assert.equal(storage.get('token'), 'new-token');
});

test('invalid credentials return a useful error and reset login loading', async (t) => {
  reset();
  const originalPost = api.post;
  api.post = async () => {
    throw Object.assign(new Error('Request failed'), {
      response: { status: 401, data: { message: 'Invalid credentials' } },
    });
  };
  t.after(() => { api.post = originalPost; });

  assert.equal(await useAuthStore.getState().login({ email: 'wrong@example.com', password: 'secret1' }), false);
  assert.equal(useAuthStore.getState().error, 'Invalid credentials');
  assert.equal(useAuthStore.getState().loginLoading, false);
});

test('a timed out login shows a retryable message and resets login loading', async (t) => {
  reset();
  const originalPost = api.post;
  api.post = async () => { throw Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }); };
  t.after(() => { api.post = originalPost; });

  assert.equal(await useAuthStore.getState().login({ email: 'learner@example.com', password: 'secret1' }), false);
  assert.match(useAuthStore.getState().error, /too long.*try again/i);
  assert.equal(useAuthStore.getState().loginLoading, false);
});

test('a network failure shows a retryable message and resets login loading', async (t) => {
  reset();
  const originalPost = api.post;
  api.post = async () => { throw Object.assign(new Error('network error'), { code: 'ERR_NETWORK' }); };
  t.after(() => { api.post = originalPost; });

  assert.equal(await useAuthStore.getState().login({ email: 'learner@example.com', password: 'secret1' }), false);
  assert.match(useAuthStore.getState().error, /unable to reach.*try again/i);
  assert.equal(useAuthStore.getState().loginLoading, false);
});
