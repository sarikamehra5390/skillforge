export const getLoginButtonState = (loginLoading) => ({
  disabled: Boolean(loginLoading),
  showSpinner: Boolean(loginLoading),
  label: loginLoading ? 'Opening the forge...' : 'Enter the Forge',
});
