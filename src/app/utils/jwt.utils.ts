import jwt from 'jsonwebtoken';

export const createToken = (
  jwtPayload: { userId: string; role: string; sessionId?: string },
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
