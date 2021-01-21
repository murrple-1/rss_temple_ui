export type ValidationErrors = Record<string, any>;

export const MinLength = 6;

export const SpecialCharacters = ['!', '@', '#', '$', '%', '^', '&'];

export function validatePassword(password: string) {
  let validationErrors: ValidationErrors | null = null;

  if (!/[a-z]/.test(password)) {
    /* istanbul ignore next */
    validationErrors = validationErrors ?? {};
    validationErrors.nolowercase = true;
  }

  if (!/[A-Z]/.test(password)) {
    /* istanbul ignore next */
    validationErrors = validationErrors ?? {};
    validationErrors.nouppercase = true;
  }

  if (!/[0-9]/.test(password)) {
    /* istanbul ignore next */
    validationErrors = validationErrors ?? {};
    validationErrors.nodigit = true;
  }

  if (!/[!@#\$%\^&]/.test(password)) {
    /* istanbul ignore next */
    validationErrors = validationErrors ?? {};
    validationErrors.nospecialcharacter = true;
  }

  return validationErrors;
}

export function validatePasswordsMatch(password1: string, password2: string) {
  let validationErrors: ValidationErrors | null = null;

  if (password1 !== password2) {
    /* istanbul ignore next */
    validationErrors = validationErrors ?? {};
    validationErrors.passwordsdonotmatch = true;
  }

  return validationErrors;
}

export function passwordRequirementsText(_lang: string) {
  // eslint-disable-next-line max-len
  return `Your password must be 6 or more characters long, contain 1 uppercase and 1 lowercase letters, 1 number, and 1 special character (${SpecialCharacters.join(
    '',
  )})`;
}
