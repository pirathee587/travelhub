export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters long, contain at least one digit, one uppercase letter, one lowercase letter, and one special character';

export const PASSWORD_CRITERIA = [
  'At least 8 characters',
  'One uppercase letter (A–Z)',
  'One lowercase letter (a–z)',
  'One number (0–9)',
  'One special character (@ # $ % ^ & + = !)',
] as const;
