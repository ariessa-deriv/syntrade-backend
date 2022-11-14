// Check whether email is valid or not
const isEmailValid = (email) => {
  // Check if email is empty or not
  if (!email) {
    console.log("Error: Email cannot be empty");
    throw new Error("Email cannot be empty");
  }

  // Check if email contains any whitespace or not
  if (/\s/.test(email)) {
    console.log("Error: Email cannot contain spaces");
    throw new Error("Email cannot contain spaces");
  }

  // Check if email is in correct format or not
  if (!/\S+@\S+\.\S+/.test(email)) {
    console.log("Error: Invalid email format");
    throw new Error("Invalid email format");
  }
  return true;
};

// Check whether password is valid or not
const isPasswordValid = (password) => {
  // Password must be between 8-12 characters
  // Password must have at least:
  // 1 capital letter, 1 lowercase letter, 1 digit and 1 special characters (~`!@#$%^&*()_-+={[}]|\:;"'<,>.?/)
  var pattern = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$"
  );

  // Check if password is empty or not
  if (!password) {
    console.log("Error: Password cannot be empty");
    throw new Error("Password cannot be empty");
  }

  // Check if length of password is between 8-12 characters or not
  if (password.length < 8 || password.length > 12) {
    console.log("Error: Password must be between 8-12 characters");
    throw new Error("Password must be between 8-12 characters");
  }

  // Check if password contains any whitespace or not
  if (/\s/.test(password)) {
    console.log("Error: Password cannot contain spaces");
    throw new Error("Password cannot contain spaces");
  }

  // Check if password have at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character
  if (!pattern.test(password)) {
    console.log(
      "Error: Password must have at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character"
    );
    throw new Error(
      "Password must have at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character"
    );
  }

  return true;
};

module.exports = { isEmailValid, isPasswordValid };
