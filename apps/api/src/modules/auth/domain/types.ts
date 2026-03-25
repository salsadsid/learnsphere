export type UserId = string;

export type AuthUser = {
  id: UserId;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
};
