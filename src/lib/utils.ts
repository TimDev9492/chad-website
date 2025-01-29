export const isHttpSuccess: (status: number) => boolean = (status: number) =>
  status >= 200 && status < 300;

export const isValidEmailAddress: (email: string) => boolean = (
  email: string,
) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
