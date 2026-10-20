const { supabase, supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');

// Finds the MongoDB user for a verified Supabase user, creating it if needed
// (e.g. first request after Google OAuth).
const findOrCreateMongoUser = async (user) => {
  let mongoUser = await User.findOne({ supabaseId: user.id });
  if (mongoUser) return mongoUser;

  const { data: supabaseData } = await supabaseAdmin.auth.admin.getUserById(
    user.id
  );
  const supabaseUser = supabaseData?.user;
  const provider = supabaseUser?.app_metadata?.provider ?? 'email';

  mongoUser = await User.create({
    supabaseId: user.id,
    email: user.email,
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email.split('@')[0],
    emailVerified: !!user.email_confirmed_at,
    authProvider: provider,
    role: 'user',
  });
  return mongoUser;
};

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let mongoUser;
    try {
      mongoUser = await findOrCreateMongoUser(user);
    } catch (createError) {
      console.error(
        'Failed to auto-create user from OAuth:',
        createError.message
      );
      return res
        .status(404)
        .json({ error: 'User not found and could not be created' });
    }

    req.user = user;
    req.mongoUser = mongoUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Sets req.user / req.mongoUser when a valid token is present.
// Never rejects: a missing, expired or invalid token is treated as a guest.
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return next();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return next();

    const mongoUser = await findOrCreateMongoUser(user);
    req.user = user;
    req.mongoUser = mongoUser;
  } catch (err) {
    // fall through as guest
  }
  next();
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.mongoUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.mongoUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = { authenticate, optionalAuthenticate, requireAdmin };