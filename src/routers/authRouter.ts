import express from "express"
const authRouter = express.Router()

import db from "../db"
import { formatZodUserError, issueTokens, hash, verifyTokens } from "../util"

import z from "zod"

const userBody = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
})

authRouter.use(express.json())

authRouter.post("/signin", async (req, res) => {
  try {
    const { email, password: pass } = req.body

    if (!email || !pass) throw Error("Email or password is missing")

    const user = await db.user.findUnique({
      where: {
        email,
      },
    })
    if (!user) throw Error("User does not exists")
    const password = hash(pass)
    const password1 = user.password

    if (password !== password1) throw Error("Password is incorrect")
    const tokens = await issueTokens(user.email)
    res.json({ email: user.email, ...tokens })
  } catch (e: any) {
    res.status(500).send(e.message)
  }
})

authRouter.post("/signup", async (req, res) => {
  const user = userBody.safeParse(req.body)
  if (!user.success) {
    const message = formatZodUserError(user)
    return res.status(400).send(message)
  }

  try {
    const { email, password: pass } = user.data
    const oldUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (oldUser) throw Error("User already exists")

    const password = hash(pass)

    await db.user.create({ data: { email, password } })
    return res.json({ message: `Successfully created user ${email}` })
  } catch (e: any) {
    return res.status(500).send(e.message)
  }
})

authRouter.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body
    const result = verifyTokens(refreshToken)
    if (typeof result === "string") throw new Error(result)
    const user = await db.user.findUnique({ where: { email: result.email } })
    if (!user) throw Error("User does not exists")
    const tokens = await issueTokens(user.email)
    res.json({ email: user.email, ...tokens })
  } catch (e: any) {
    res.status(500).send(e.message)
  }
})

export default authRouter
