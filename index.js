import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import morgan from "morgan";
const PORT = 5000;
const app = express();
const prisma = new PrismaClient({ errorFormat: "pretty" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      posts: true,
      _count: {
        select: { posts: true },
      },
    },
  });
  const data = users.map((v) => ({
    id: v.id,
    username: v.username,
    password: v.password,
    posts: v.posts,
    total_posts: v._count.posts,
  }));
  delete data._count;
  res.json(data);
});

app.post("/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        password,
      },
      include: {
        posts: true,
      },
    });
    res.json(newUser);
  } catch (e) {
    res.json({ status: 401, error: e.toString() });
  }
});
app.put("/:id", async (req, res) => {
  try {
    const { username, password } = req.body;
    const updateUser = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        username,
        password,
      },
      include: {
        posts: true,
      },
    });
    res.json({ post: updateUser.posts.length, updateUser });
  } catch (error) {
    res.json({ status: 401, error: error.toString() });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const deleteUser = await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });
    console.log(deleteUser);
    res.json(deleteUser);
  } catch (error) {
    res.json({ status: 401, error: error.toString() });
  }
});
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
