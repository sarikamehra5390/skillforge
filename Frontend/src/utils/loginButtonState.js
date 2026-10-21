export const getLoginButtonState = (isSubmitting) => ({
  disabled: Boolean(isSubmitting),
  showSpinner: Boolean(isSubmitting),
  label: isSubmitting ? 'Opening the forge...' : 'Enter the Forge',
});
