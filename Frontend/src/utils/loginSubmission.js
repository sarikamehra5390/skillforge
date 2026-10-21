export const getSafePostLoginRedirect = (searchParams) => {
  const redirect = searchParams?.get?.('redirect');
  return redirect && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/';
};

export const createLoginSubmissionRunner = (setIsSubmitting) => {
  let inFlight = false;

  return async (submit) => {
    if (inFlight) return false;

    inFlight = true;
    setIsSubmitting(true);

    try {
      return await submit();
    } finally {
      inFlight = false;
      setIsSubmitting(false);
    }
  };
};
