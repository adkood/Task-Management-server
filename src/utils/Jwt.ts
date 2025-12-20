import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: { id: string; username: string }) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '24h' } 
  );
};

//  ( NOT USING THIS CURRENTLY ) 

// export const generateRefreshToken = (payload: { id: string; username: string }) => {
//   return jwt.sign(
//     payload,
//     process.env.JWT_REFRESH_SECRET!, 
//     { expiresIn: '7d' }
//   );
// };