const checkEnv = (req, res, next) => {
  const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    return res.status(500).json({
      message: 'Server configuration error',
      error: process.env.NODE_ENV === 'development' ? `Missing: ${missingEnvVars.join(', ')}` : undefined
    });
  }

  next();
};

module.exports = checkEnv; 