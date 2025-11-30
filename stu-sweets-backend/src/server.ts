import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import pkg from "@prisma/client";

const prisma = new pkg.PrismaClient();
const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // my frontend address during development (to change at production to future domen e.g. "https://stu-sweets.com")
  credentials: true,               // cookies/authorization support
}));

// ROOT
app.get("/", (req: Request, res: Response) => {
  res.send("Stu Sweets backend is running!");
});

// GET ALL USERS
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

// CREATE USER
app.post("/users", async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
    res.status(201).json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET ALL PRODUCTS
app.get("/products", async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
});
// CREATE PRODUCT
app.post("/products", async (req: Request, res: Response) => {
  const { name, description, price, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "name and price required" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock: stock ?? 0,
      },
    });
    res.status(201).json(product);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET ALL ORDERS
app.get("/orders", async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      invoices: true,
    },
  });
  res.json(orders);
});

// CREATE ORDER
app.post("/orders", async (req: Request, res: Response) => {
  const { customerName, customerEmail, customerPhone, comment, items } = req.body;

  if (!customerName || !customerEmail || !items || !Array.isArray(items)) {
    return res.status(400).json({
      error: "customerName, customerEmail and items[] are required"
    });
  }

  try {
    const total = items.reduce((sum: number, it: any) => {
      return sum + it.price * it.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone ?? null,
        comment: comment ?? null,
        total,
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        }
      },
      include: {
        items: true,
      }
    });

    res.status(201).json(order);

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// SERVER
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
