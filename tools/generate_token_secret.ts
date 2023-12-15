import { randomBytes } from "crypto";

console.log(`TOKEN_SECRET: ${randomBytes(64).toString("hex")}`);