const MIN_PASSWORD_CHARACTERS = 15;
const MAX_BCRYPT_PASSWORD_BYTES = 72;

const validateNewPassword = (password) => {
  if (typeof password !== "string") {
    return "Password must be a string";
  }

  if (Array.from(password).length < MIN_PASSWORD_CHARACTERS) {
    return `Password must be at least ${MIN_PASSWORD_CHARACTERS} characters`;
  }

  if (Buffer.byteLength(password, "utf8") > MAX_BCRYPT_PASSWORD_BYTES) {
    return `Password must be ${MAX_BCRYPT_PASSWORD_BYTES} UTF-8 bytes or fewer`;
  }

  return null;
};

module.exports = {
  MIN_PASSWORD_CHARACTERS,
  MAX_BCRYPT_PASSWORD_BYTES,
  validateNewPassword,
};
