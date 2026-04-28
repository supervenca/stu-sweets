import prisma from "../prisma/client.js";

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: {
          orders: true
        },
      },
    },
  });
}

export async function toggleBlacklist(id: number, blacklist: boolean) {
  return prisma.client.update({
    where: { id },
    data: { blacklist },
  });
}