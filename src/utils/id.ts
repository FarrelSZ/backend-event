const { customAlphabet } = require("nanoid");

export const getId = (): string => {
  const nanodId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
  return nanodId(5); //  5 characters
};
