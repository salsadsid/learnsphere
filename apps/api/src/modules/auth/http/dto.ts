export type RegisterRequestDto = {
  email: string;
  password: string;
};

export type RegisterResponseDto = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken: string;
  expiresInSeconds: number;
};
