import { z } from 'zod';

export type ValidationErrors = Record<string, unknown>;

export const MinLength = 6;

export const SpecialCharacters = ['!', '@', '#', '$', '%', '^', '&', '?'];

// the backend's 422 body when it rejects a password: `{"password": ["<message>", ...]}`.
// Releases up to 0.10.0 sent one string instead of a list.
const ZPasswordRejectedError = z.object({
  password: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
});

export function passwordRejectedText(errorBody: unknown) {
  const result = ZPasswordRejectedError.safeParse(errorBody);
  if (!result.success) {
    return 'Password was not accepted. Please try a different password';
  }

  const password = result.data.password;
  const messages = typeof password === 'string' ? [password] : password;
  return `${messages.join(' ')} Please try a different password`;
}

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

  if (!/[!@#$%^&?]/.test(password)) {
    /* istanbul ignore next */
    validationErrors = validationErrors ?? {};
    validationErrors.nospecialcharacter = true;
  }

  return validationErrors;
}

export function validatePasswordsMatch(password1: string, password2: string) {
  let validationErrors: ValidationErrors | null = null;

  if (password1.length < 1 || password2.length < 1) {
    return null;
  }

  if (password1 !== password2) {
    /* istanbul ignore next */
    validationErrors = validationErrors ?? {};
    validationErrors.passwordsdonotmatch = true;
  }

  return validationErrors;
}

export function passwordRequirementsText(_lang: string) {
  // eslint-disable-next-line max-len
  return `Your password must contain 6 or more characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (${SpecialCharacters.join(
    '',
  )})`;
}

export function passwordRequirementsTextHtml(_lang: string) {
  return `<span>Your password must contain</span><ul><li>6 or more characters</li><li>1 uppercase letter</li><li>1 lowercase letter</li><li>1 number</li><li>1 special character (${SpecialCharacters.join(
    '',
  )})</li>`.replace(/&/g, '&amp;');
}
