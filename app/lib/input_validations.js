// Check whether email is valid or not
const checkEmailValidity = (email) => {
  // Check if email is empty or not
  if (!email) {
    throw new Error("Invalid email");
  }

  // Check if email contains any whitespace or not
  if (/\s/.test(email)) {
    throw new Error("Invalid email");
  }

  // Check if email is in correct format or not
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error("Invalid email");
  }
  return true;
};

// Check whether password is valid or not
const checkPasswordValidity = (password) => {
  // Password must be between 8-12 characters
  // Password must have at least:
  // 1 capital letter, 1 lowercase letter, 1 digit and 1 special characters (~`!@#$%^&*()_-+={[}]|\:;"'<,>.?/)
  var pattern = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$"
  );

  // Check if password is empty or not
  if (!password) {
    throw new Error("Invalid password");
  }

  // Check if length of password is between 8-12 characters or not
  if (password.length < 8 || password.length > 12) {
    throw new Error("Invalid password");
  }

  // Check if password contains any whitespace or not
  if (/\s/.test(password)) {
    throw new Error("Invalid password");
  }

  // Check if password have at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character
  if (!pattern.test(password)) {
    throw new Error("Invalid password");
  }

  return true;
};

module.exports = { checkEmailValidity, checkPasswordValidity };
