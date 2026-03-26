export interface JwtPayload {
  id: number;
  email: string;
  role?: "ADMIN" | "SUPER_ADMIN";
}