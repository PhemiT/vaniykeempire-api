const { supabase, supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');

// ─── Signup ────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const user = await User.create({
      supabaseId: authData.user.id,
      email:      authData.user.email,
      name,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id:    user._id,
        email: user.email,
        name:  user.name,
      },
      session: authData.session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const user = await User.findOne({ supabaseId: data.user.id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id:    user._id,
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get Profile (with upsert for OAuth users) ─────────────
// This is the key fix. When a Google user signs in via Supabase OAuth,
// they land on the frontend with a valid access_token but no MongoDB record.
// The frontend calls getProfile — we verify the token with Supabase,
// then upsert the user in MongoDB so they always exist after this call.
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware (verified Supabase JWT)
    const supabaseId = req.user.id;

    // Try to find the user in MongoDB
    let user = await User.findOne({ supabaseId });

    if (!user) {
      // User authenticated via Supabase (e.g. Google OAuth) but has no MongoDB record yet.
      // Fetch their details from Supabase and create the record now.
      const { data: supabaseData, error } = await supabaseAdmin.auth.admin.getUserById(supabaseId);

      if (error || !supabaseData?.user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const supabaseUser = supabaseData.user;
      const provider     = supabaseUser.app_metadata?.provider ?? 'email';

      user = await User.create({
        supabaseId,
        email:         supabaseUser.email,
        name:          supabaseUser.user_metadata?.full_name
                    || supabaseUser.user_metadata?.name
                    || supabaseUser.email.split('@')[0],
        emailVerified: !!supabaseUser.email_confirmed_at,
        authProvider:  provider,
        role:          'user',
      });
    }

    res.json({
      user: {
        id:           user._id,
        email:        user.email,
        name:         user.name,
        role:         user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Google OAuth — initiate ───────────────────────────────
// Redirects to Google via Supabase. After auth, Supabase sends the
// user back to the frontend with hash tokens (/#access_token=...).
// The frontend's useHashTokenHandler picks those up and calls getProfile,
// which upserts the MongoDB record (see above).
exports.googleLogin = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Supabase will redirect here after Google auth — must be in your
        // Supabase dashboard Redirect URLs list
        redirectTo: process.env.FRONTEND_URL,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.redirect(data.url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Google OAuth — callback ───────────────────────────────
// NOTE: With Supabase's default PKCE flow the user never hits this route —
// Supabase redirects straight to the frontend with hash tokens.
// This is kept as a fallback in case you switch to the implicit flow
// or configure a custom redirect in Supabase.
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { user: supabaseUser, session } = data;

    // Upsert in MongoDB
    let user = await User.findOne({ supabaseId: supabaseUser.id });

    if (!user) {
      user = await User.create({
        supabaseId:    supabaseUser.id,
        email:         supabaseUser.email,
        name:          supabaseUser.user_metadata?.full_name || supabaseUser.email,
        emailVerified: !!supabaseUser.email_confirmed_at,
        authProvider:  'google',
      });
    }

    // Redirect frontend — tokens go in the hash so they aren't logged by servers
    const redirectUrl = new URL(process.env.FRONTEND_URL);
    redirectUrl.hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=google`;
    res.redirect(redirectUrl.toString());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Password reset ────────────────────────────────────────
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/verify-email`,
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

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Email verification ────────────────────────────────────
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resend({
      type:  'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`,
      },
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
    const { token_hash, type } = req.body;

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type || 'email',
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = await User.findOne({ supabaseId: data.user.id });
    if (user) {
      user.emailVerified = true;
      user.updatedAt     = new Date();
      await user.save();
    }

    res.json({
      message: 'Email verified successfully',
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin signup ──────────────────────────────────────────
exports.signupAsAdmin = async (req, res) => {
  try {
    const { email, password, name, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const user = await User.create({
      supabaseId: authData.user.id,
      email:      authData.user.email,
      name,
      role:       'admin',
    });

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id:    user._id,
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
      session: authData.session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Admin login ───────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const user = await User.findOne({ supabaseId: data.user.id });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.',
      });
    }

    res.json({
      message: 'Admin login successful',
      user: {
        id:    user._id,
        email: user.email,
        name:  user.name,
        role:  user.role,
      },
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};