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
let createLoginSubmissionRunner;
let getSafePostLoginRedirect;

before(async () => {
  const axiosClient = await import('../api/axios.js');
  api = axiosClient.default;
  apiTimeoutMs = axiosClient.API_TIMEOUT_MS;
  useAuthStore = (await import('./useAuthStore.js')).default;
  ({ getLoginButtonState } = await import('../utils/loginButtonState.js'));
  ({ createLoginSubmissionRunner, getSafePostLoginRedirect } = await import('../utils/loginSubmission.js'));
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
  assert.equal(getLoginButtonState(false).showSpinner, false);
  resolveRequest({ data: { _id: 'user-1' } });
  assert.equal(await first, true);
  assert.equal(await second, true);
  assert.equal(useAuthStore.getState().authChecking, false);
  assert.equal(useAuthStore.getState().isAuthenticated, true);
});

test('submitting a valid form activates the local spinner and successful login navigates safely', async (t) => {
  reset();
  const originalPost = api.post;
  api.post = async (path, payload) => {
    assert.equal(path, '/users/login');
    assert.deepEqual(payload, { email: 'learner@example.com', password: 'secret1' });
    return { data: { token: 'new-token', user: { _id: 'user-1' } } };
  };
  t.after(() => { api.post = originalPost; });

  let submitting = false;
  const submitLogin = createLoginSubmissionRunner((value) => { submitting = value; });
  let destination;
  const params = new URLSearchParams('redirect=%2Fskills%3Ftab%3Dcurrent');
  const attempt = submitLogin(async () => {
      const success = await useAuthStore.getState().login({ email: 'learner@example.com', password: 'secret1' });
      if (success) destination = [getSafePostLoginRedirect(params), { replace: true }];
      return success;
  });
  assert.equal(submitting, true);
  assert.equal(getLoginButtonState(submitting).showSpinner, true);
  assert.equal(await attempt, true);
  assert.deepEqual(destination, ['/skills?tab=current', { replace: true }]);
  assert.equal(submitting, false);
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

  let submitting = false;
  const submitLogin = createLoginSubmissionRunner((value) => { submitting = value; });
  assert.equal(await submitLogin(() => useAuthStore.getState().login({ email: 'wrong@example.com', password: 'secret1' })), false);
  assert.equal(submitting, false);
  assert.equal(useAuthStore.getState().error, 'Invalid credentials');
  assert.equal(useAuthStore.getState().loginLoading, false);
});

test('a timed out login shows a retryable message and resets login loading', async (t) => {
  reset();
  const originalPost = api.post;
  api.post = async () => { throw Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }); };
  t.after(() => { api.post = originalPost; });

  let submitting = false;
  const submitLogin = createLoginSubmissionRunner((value) => { submitting = value; });
  assert.equal(await submitLogin(() => useAuthStore.getState().login({ email: 'learner@example.com', password: 'secret1' })), false);
  assert.equal(submitting, false);
  assert.match(useAuthStore.getState().error, /too long.*try again/i);
  assert.equal(useAuthStore.getState().loginLoading, false);
});

test('a network failure shows a retryable message and resets login loading', async (t) => {
  reset();
  const originalPost = api.post;
  api.post = async () => { throw Object.assign(new Error('network error'), { code: 'ERR_NETWORK' }); };
  t.after(() => { api.post = originalPost; });

  let submitting = false;
  const submitLogin = createLoginSubmissionRunner((value) => { submitting = value; });
  assert.equal(await submitLogin(() => useAuthStore.getState().login({ email: 'learner@example.com', password: 'secret1' })), false);
  assert.equal(submitting, false);
  assert.match(useAuthStore.getState().error, /unable to reach.*try again/i);
  assert.equal(useAuthStore.getState().loginLoading, false);
});

test('rapid duplicate submits create only one login request', async () => {
  reset();
  let resolveLogin;
  let calls = 0;
  let submitting = false;
  const submitLogin = createLoginSubmissionRunner((value) => { submitting = value; });
  const submit = () => {
    calls += 1;
    return new Promise((resolve) => { resolveLogin = resolve; });
  };
  const first = submitLogin(submit);
  const second = await submitLogin(submit);
  assert.equal(second, false);
  assert.equal(calls, 1);
  assert.equal(submitting, true);
  resolveLogin(true);
  assert.equal(await first, true);
  assert.equal(submitting, false);
});

test('an expired token is cleared once and auth restoration settles without a redirect loop', async (t) => {
  reset('expired-token');
  let calls = 0;
  const originalGet = api.get;
  api.get = async () => {
    calls += 1;
    throw Object.assign(new Error('Unauthorized'), {
      response: { status: 401, data: { message: 'Unauthorized' } },
    });
  };
  t.after(() => { api.get = originalGet; });

  assert.equal(await useAuthStore.getState().checkAuth(), false);
  assert.equal(storage.has('token'), false);
  assert.equal(useAuthStore.getState().authChecking, false);
  assert.equal(useAuthStore.getState().authChecked, true);
  assert.equal(await useAuthStore.getState().checkAuth(), false);
  assert.equal(calls, 1);
});

test('a timed out auth check settles without deleting a token or cached user', async (t) => {
  reset('possibly-valid-token');
  const cachedUser = { _id: 'user-2', email: 'learner@example.com' };
  storage.set('skillforge_user', JSON.stringify(cachedUser));
  useAuthStore.setState({ user: cachedUser });
  const originalGet = api.get;
  api.get = async () => { throw Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }); };
  t.after(() => { api.get = originalGet; });

  assert.equal(await useAuthStore.getState().checkAuth(), false);
  assert.equal(useAuthStore.getState().authChecking, false);
  assert.equal(useAuthStore.getState().authChecked, true);
  assert.equal(storage.get('token'), 'possibly-valid-token');
  assert.deepEqual(JSON.parse(storage.get('skillforge_user')), cachedUser);
});
