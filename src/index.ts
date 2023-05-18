import express from "express"
import authRouter from "./routers/authRouter"
import postsRouter from "./routers/postsRouter"

import * as functions from "firebase-functions"
import cors from "cors"

const app = express()
const corsi = cors({ origin: "*" })
app.use(corsi)
app.use(express.json())
app.use("/auth", authRouter)
app.use("/posts", postsRouter)

app.get("/", (req, res) => {
  res.send("Hello from API")
})

export const api = functions.https.onRequest(app)
