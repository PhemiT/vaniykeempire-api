const { supabase, supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Find user in MongoDB
    let mongoUser = await User.findOne({ supabaseId: user.id });

    // If no MongoDB record exists (e.g. first request after Google OAuth),
    // create it now using the Supabase user data
    if (!mongoUser) {
      try {
        const { data: supabaseData } = await supabaseAdmin.auth.admin.getUserById(user.id);
        const supabaseUser = supabaseData?.user;
        const provider     = supabaseUser?.app_metadata?.provider ?? 'email';

        mongoUser = await User.create({
          supabaseId:    user.id,
          email:         user.email,
          name:          user.user_metadata?.full_name
                      || user.user_metadata?.name
                      || user.email.split('@')[0],
          emailVerified: !!user.email_confirmed_at,
          authProvider:  provider,
          role:          'user',
        });
      } catch (createError) {
        console.error('Failed to auto-create user from OAuth:', createError.message);
        return res.status(404).json({ error: 'User not found and could not be created' });
      }
    }

    req.user      = user;
    req.mongoUser = mongoUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
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

module.exports = { authenticate, requireAdmin };