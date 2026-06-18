import { HttpError } from "./httpError.js";

export function parseId(value: string, name = "id"): number {
  const id = Number(value);

  if (Number.isNaN(id)) {
    throw new HttpError(400, `Invalid ${name}`);
  }

  return id;
}