/**
 * Utility for validating Sri Lankan National Identity Card (NIC) numbers.
 * Supports both Old (9 digits + V/X) and New (12 digits) formats.
 */

interface NICValidationResult {
  isValid: boolean;
  message?: string;
  format?: 'old' | 'new';
  year?: string;
  gender?: 'Male' | 'Female';
  dob?: string;
}

export const validateNIC = (nic: string): NICValidationResult => {
  if (!nic) return { isValid: false, message: 'NIC is required' };

  // New Format: 12 digits
  if (/^[0-9]{12}$/.test(nic)) {
    return { isValid: true, format: 'new', ...extractData(nic, 'new') };
  }

  // Old Format: 9 digits + V/X
  if (/^[0-9]{9}[vVxX]$/.test(nic)) {
    return { isValid: true, format: 'old', ...extractData(nic, 'old') };
  }

  return { isValid: false, message: 'Invalid NIC format' };
};

const extractData = (nic: string, format: 'old' | 'new') => {
  let year: string, days: number;

  if (format === 'old') {
    year = '19' + nic.substring(0, 2);
    days = parseInt(nic.substring(2, 5));
  } else {
    year = nic.substring(0, 4);
    days = parseInt(nic.substring(4, 7));
  }

  const gender = days > 500 ? 'Female' : 'Male';
  const birthDays = days > 500 ? days - 500 : days;

  // Simple DOB calculation (approximate)
  const dob = new Date(parseInt(year), 0);
  dob.setDate(birthDays);

  return {
    year,
    gender,
    dob: dob.toISOString().split('T')[0],
  };
};
