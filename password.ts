import crypto from "crypto";

const encrypt = (password: string): string => {
  const encrypted = crypto.pbkdf2Sync(password, "f9c5f75edc1189426595fb980584e623", 1000, 64, "sha512").toString("hex");
  return encrypted;
};

console.log(encrypt("Member2025!"));
