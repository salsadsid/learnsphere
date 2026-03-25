type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

const MIN_PASSWORD_LENGTH = 8;

const isEmailLike = (value: string) => value.includes("@") && value.includes(".");

export const validateRegisterInput = (input: {
  email?: string;
  password?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!input.email) {
    errors.push("Email is required.");
  } else if (!isEmailLike(input.email)) {
    errors.push("Email must be valid.");
  }

  if (!input.password) {
    errors.push("Password is required.");
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  return { isValid: errors.length === 0, errors };
};

export const validateLoginInput = (input: {
  email?: string;
  password?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!input.email) {
    errors.push("Email is required.");
  } else if (!isEmailLike(input.email)) {
    errors.push("Email must be valid.");
  }

  if (!input.password) {
    errors.push("Password is required.");
  }

  return { isValid: errors.length === 0, errors };
};
