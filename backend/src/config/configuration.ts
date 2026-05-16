export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  },
  frontendUrl: process.env.FRONTEND_URL,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
});
