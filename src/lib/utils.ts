export const isHttpSuccess: (status: number) => boolean = (status: number) =>
  status >= 200 && status < 300;

export const isValidEmailAddress: (email: string) => boolean = (
  email: string,
) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export const getAgeByBirthdate: (birthdate: Date | string) => number = (
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
