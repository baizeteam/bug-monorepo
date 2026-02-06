export default () => ({
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '3306', 10),
  dbUsername: process.env.DB_USERNAME || 'root',
  dbPassword: process.env.DB_PASSWORD || 'yuanbaoer',
  dbDatabase: process.env.DB_DATABASE || 'bug_platform',
  jwtSecret: process.env.JWT_SECRET || 'bug-platform-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
})
