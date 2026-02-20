module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE,
  },
  sessionExpireMinutes: process.env.SESSION_EXPIRE_MINUTES,
};