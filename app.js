import crypto from "crypto  ";

const SECRET = crypto.randomBytes(16).toString("hex");

console.log(SECRET);
