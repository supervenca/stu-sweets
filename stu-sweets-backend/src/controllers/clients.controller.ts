import { Request, Response } from "express";
import * as clientsService from "../services/clients.service.js";

export async function getClients(req: Request, res: Response) {
  const clients = await clientsService.getClients();
  res.json(clients);
}

export async function toggleBlacklist(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { blacklist } = req.body;

  const updated = await clientsService.toggleBlacklist(id, blacklist);

  res.json(updated);
}