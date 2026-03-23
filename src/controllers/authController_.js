const supabase = require('../config/supabase');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Create user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user in MongoDB
    const user = await User.create({
      supabaseId: authData.user.id,
      email: authData.user.email,
      name
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      session: authData.session
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get user from MongoDB
    const user = await User.findOne({ supabaseId: data.user.id });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      session: data.session
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google OAuth - Initiate login
exports.googleLogin = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.SUPABASE_CALLBACK_URL}/auth/google/callback`
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Redirect user to Google's OAuth page
    res.redirect(data.url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google OAuth - Handle callback
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { user: supabaseUser, session } = data;

    // Upsert user in MongoDB
    let user = await User.findOne({ supabaseId: supabaseUser.id });

    if (!user) {
      user = await User.create({
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
        emailVerified: supabaseUser.email_confirmed_at ? true : false,
        authProvider: 'google'
      });
    }

    // Redirect to frontend with session tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/google/success`);
    redirectUrl.searchParams.set('access_token', session.access_token);
    redirectUrl.searchParams.set('refresh_token', session.refresh_token);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
    try {
      const { email } = req.body;
  
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });
  
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.updatePassword = async (req, res) => {
    try {
      const { password } = req.body;
      
      // This requires the user to be authenticated with the reset token
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
  
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.resendVerificationEmail = async (req, res) => {
    try {
      const { email } = req.body;
  
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`
        }
      });
  
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      res.json({ message: 'Verification email sent' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.verifyEmail = async (req, res) => {
    try {
      // When user clicks the verification link, they're redirected to your frontend
      // with a token hash. Your frontend then calls this endpoint with that token.
      const { token_hash, type } = req.body;
  
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type || 'email'
      });
  
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      // Update MongoDB user if needed
      const user = await User.findOne({ supabaseId: data.user.id });
      if (user) {
        user.emailVerified = true;
        user.updatedAt = new Date();
        await user.save();
      }
  
      res.json({ 
        message: 'Email verified successfully',
        session: data.session 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.signupAsAdmin = async (req, res) => {
    try {
      const { email, password, name, adminSecret } = req.body;
  
      // Verify admin secret
      if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Invalid admin secret' });
      }
  
      // Create user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
  
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
  
      // Create admin user in MongoDB
      const user = await User.create({
        supabaseId: authData.user.id,
        email: authData.user.email,
        name,
        role: 'admin'
      });
  
      res.status(201).json({
        message: 'Admin user created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        session: authData.session
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
  
      if (error) {
        return res.status(401).json({ error: error.message });
      }
  
      // Get user from MongoDB and check role
      const user = await User.findOne({ supabaseId: data.user.id });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Access denied. Admin privileges required.' 
        });
      }
  
      res.json({
        message: 'Admin login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        session: data.session
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };