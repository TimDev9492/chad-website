export const isHttpSuccess: (status: number) => boolean = (status: number) =>
  status >= 200 && status < 300;

export const isValidEmailAddress: (email: string) => boolean = (
  email: string,
) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export const getAgeByBirthdate: (birthdate: string) => number = (
  birthdate,
) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const disabledText = (classes: string, disabled: boolean) =>
  disabled ? `${classes} opacity-50 select-none` : classes;

export const isValidPostalAddress = (
  streetAndNumber: string,
  city: string,
  postalCode: string,
  countryISOCode: string,
) => {
  const postCode = parseInt(postalCode);
  if (postCode <= 0) return false;
  if (postCode >= 100_000) return false;
  if (!streetAndNumber || !city || !countryISOCode) return false;
  return true;
};

export const isValidDate = (dateString: string) => {
  // Regular expression to match YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the date matches the pattern
  if (!regex.test(dateString)) {
    return false;
  }

  // Check if the date is a valid date
  const date = new Date(dateString);
  const [year, month, day] = dateString.split('-');
  return (
    date.getFullYear() === parseInt(year) &&
    date.getMonth() + 1 === parseInt(month) &&
    date.getDate() === parseInt(day)
  );
};

export const strToBool = (str: string) => {
  if (str.toLowerCase() === 'true') return true;
  if (str.toLowerCase() === 'false') return false;
  throw new Error('Invalid boolean string');
};
