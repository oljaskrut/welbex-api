import express from "express"
import type { Request, Response, NextFunction } from "express"
const postsRouter = express.Router()
import { faker } from "@faker-js/faker"
import db from "../db"
import { z } from "zod"
import { verifyTokens } from "../util"

postsRouter.use(express.json())

postsRouter.get("/", async (req, res) => {
  try {
    const _limit = Number(req.query.limit)
    const _offset = Number(req.query.offset)

    const limit = Number.isNaN(_limit) || _limit === 0 ? 10 : _limit
    const offset = Number.isNaN(_offset) ? 0 : _offset

    const result = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { author: { select: { email: true } } },
    })
    res.json(result)
  } catch (e: any) {
    res.status(500).send(e.message)
  }
})

postsRouter.get("/populate", async (req, res) => {
  try {
    const _count = Number(req.query.count)
    const count = Number.isNaN(_count) || _count === 0 ? 1 : _count

    const users = await db.user.findMany({ where: { email: { startsWith: "test_" } }, take: count })

    const posts = Array.from({ length: count }).map(() => {
      const content = faker.lorem.sentence()
      const authorId = users[~~(Math.random() * users.length)].id
      return { content, authorId }
    })

    await db.post.createMany({ data: posts })
    res.json({ posts })
  } catch (e: any) {
    console.log(e)
    res.status(500).send(e.message)
  }
})

postsRouter.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id) || id === 0) throw Error("Invalid id")

    const result = await db.post.findUnique({
      where: { id },
      include: { author: { select: { email: true } } },
    })

    res.json(result)
  } catch (e: any) {
    res.status(500).send(e.message)
  }
})

const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authentication")?.replace("Bearer ", "")
    if (!token) throw Error("No token provided")
    const result = verifyTokens(token)
    if (typeof result === "string") throw new Error(result)
    const user = await db.user.findUnique({ where: { email: result.email } })
    if (!user) throw Error("User does not exists")
    req.body.uid = user.id
    next()
  } catch (e: any) {
    res.status(403).send(e.message)
  }
}

postsRouter.post("/", verify, async (req, res) => {
  try {
    const { content: text, uid } = req.body

    const content = z.string().min(1).max(255).safeParse(text)

    if (!content.success) throw Error("Invalid content, min 1 char, max 255 chars")

    const post = await db.post.create({
      data: {
        content: content.data,
        authorId: uid,
      },
    })

    res.json(post)
  } catch (e: any) {
    res.status(500).send(e.message)
  }
})

postsRouter.put("/:id", verify, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id) || id === 0) throw Error("Invalid id")

    const { content: text, uid } = req.body
    const content = z.string().min(1).max(255).safeParse(text)
    if (!content.success) throw Error("Invalid content, min 1 char, max 255 chars")

    const oldPost = await db.post.findUnique({
      where: { id },
    })

    if (!oldPost) throw Error("Post not found")
    if (oldPost.authorId !== uid) throw Error("You are not the author of this post")

    const post = await db.post.update({
      where: { id },
      data: {
        content: content.data,
      },
    })

    res.json(post)
  } catch (e: any) {
    res.status(500).send(e.message)
  }
})

postsRouter.delete("/:id", verify, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id) || id === 0) throw Error("Invalid id")

    const { uid } = req.body

    const oldPost = await db.post.findUnique({
      where: { id },
    })

    if (!oldPost) throw Error("Post not found")
    if (oldPost.authorId !== uid) throw Error("You are not the author of this post")

    const post = await db.post.delete({
      where: { id },
    })

    res.json(post)
  } catch (e: any) {
    res.status(500).send(e.message)
  }
})

export default postsRouter
