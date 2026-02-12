const supabase = require('../config/supabase');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get full user data from MongoDB including role
    const mongoUser = await User.findOne({ supabaseId: user.id });
    
    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
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
        error: 'Access denied. Admin privileges required.' 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = { authenticate, requireAdmin };