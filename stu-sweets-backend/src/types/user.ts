export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
}
