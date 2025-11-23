import express from "express";
import type { Request, Response } from "express";
import pkg from "@prisma/client";

const prisma = new pkg.PrismaClient();

const app = express();
app.use(express.json());

// Тестовый маршрут
app.get("/", (req: Request, res: Response) => {
  res.send("Stu Sweets backend is running!");
});

// Получить всех пользователей
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

// Создать пользователя
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    const user = await prisma.user.create({
      data: { email, name, password },
    });

    res.status(201).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
