import jwt from "jsonwebtoken"
import type { z } from "zod"
import { createHash } from "crypto"

/**
 * Generates access and refresh tokens.
 * @param {string} email User's email.
 * @return {{string,string}} {accessToken, refreshToken} Generated access and refresh tokens.
 */
export function issueTokens(email: string) {
  const data = { email }
  const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) throw new Error("JWT_PRIVATE_KEY not set")
  const accessToken = jwt.sign(data, privateKey, { expiresIn: "1h" })
  const refreshToken = jwt.sign(data, privateKey, { expiresIn: "30d" })
  return { accessToken, refreshToken }
}

/**
 * Verifies access or refresh tokens.
 * @param {string} token Access or refresh token.
 * @return {object} Decoded token or Error message.
 * @throws {Error} If JWT_PRIVATE_KEY is not set.
 */
export function verifyTokens(token: string) {
  const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) throw new Error("JWT_PRIVATE_KEY not set")
  const result = jwt.verify(token, privateKey)
  return result
}

/**
 * Formats Zod user error.
 * @param {object} user Zod user error.
 * @return {string} Formatted error message.
 */
export function formatZodUserError(
  user: z.SafeParseError<{
    email: string
    password: string
  }>,
) {
  const message = user.error.issues
    .map((issue) => {
      const { path, message, code } = issue
      let msg = ""
      if (code === "invalid_string") {
        if (path[0] === "email") msg = "Email: Invalid email"
        if (path[0] === "password") msg = "Password: Must contain at least one letter, one number and one special character"
      } else {
        msg = `${path[0]}: ${message}`
        msg = msg[0].toUpperCase() + msg.slice(1)
      }
      return msg
    })
    .join(", ")
  return message
}

/**
 * Hashes password.
 * @param {string} pass Password.
 * @return {string} Hashed password.
 */
export function hash(pass: string) {
  return createHash("md5").update(pass).digest("hex")
}
