import * as dotenv from 'dotenv';
dotenv.config();

//centralized  and secure app settings 

export const config = {
  db: {
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    pass: process.env.DB_PASS!,
    host: process.env.DB_HOST!
  },

  jwt: {
    secret: process.env.JWT_SECRET|| 'collabflow_default_secret',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET|| 'default_refresh_secret',
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  },

  redis: {
    url: process.env.REDIS_URL!
  },

  email: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!
  }
};
