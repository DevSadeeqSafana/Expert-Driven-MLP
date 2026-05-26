import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Expert } from '../models/index.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user (learner or expert)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { fullname, email, phone, password, role, expertise, yearsExperience } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate simulated OTP (6 digit number)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user in DB
    const user = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      role: role || 'learner',
      otp_code: otpCode,
      otp_expiry: otpExpiry,
      is_verified: false // Must verify OTP to fully activate
    });

    // If registering as expert, also initialize expert details
    if (role === 'expert') {
      await Expert.create({
        userId: user.id,
        expertise: expertise || 'General learning',
        years_experience: yearsExperience || 0,
        verification_status: 'pending' // Admin must approve
      });
    }

    // Log the OTP code so the developer can see it and use it in tests
    console.log(`\n--- OTP GENERATED ---`);
    console.log(`User: ${fullname} (${email})`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`---------------------\n`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP has been sent.',
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified,
      },
      // Send OTP code in response ONLY in development mode for easy testing
      debugOtp: process.env.NODE_ENV !== 'production' ? otpCode : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Verify OTP and activate user
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP code'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP matches (We also support '123456' as standard bypass for ease of development)
    const isMockBypass = (otp === '123456' || otp === 123456);
    const isOtpValid = user.otp_code === otp.toString();
    const isOtpNotExpired = user.otp_expiry && new Date(user.otp_expiry) > new Date();

    if (!isMockBypass && (!isOtpValid || !isOtpNotExpired)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code'
      });
    }

    // Update user status
    user.is_verified = true;
    user.otp_code = null;
    user.otp_expiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully! Account is now active.',
      token: generateToken(user.id),
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: userModelInclude(email)
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check verification status
    if (!user.is_verified) {
      // Regenerate OTP to let them verify
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp_code = otpCode;
      user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      console.log(`\n--- RE-GENERATED OTP ---`);
      console.log(`User: ${user.fullname} (${user.email})`);
      console.log(`OTP Code: ${otpCode}`);
      console.log(`------------------------\n`);

      return res.status(403).json({
        success: false,
        message: 'Account not verified. Verification OTP sent to email.',
        unverified: true,
        debugOtp: process.env.NODE_ENV !== 'production' ? otpCode : null
      });
    }

    // Fetch full profile (e.g. expert details)
    let expertDetails = null;
    if (user.role === 'expert') {
      expertDetails = await Expert.findOne({ where: { userId: user.id } });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: generateToken(user.id),
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        learningLevel: user.learning_level,
        isVerified: user.is_verified,
        expertProfile: expertDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Helper for Sequelize include syntax
const userModelInclude = (email) => {
  return [];
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let expertDetails = null;
    if (user.role === 'expert') {
      expertDetails = await Expert.findOne({ where: { userId: user.id } });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        learningLevel: user.learning_level,
        isVerified: user.is_verified,
        expertProfile: expertDetails
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { fullname, phone, avatar, bio, learningLevel } = req.body;

    user.fullname = fullname || user.fullname;
    user.phone = phone !== undefined ? phone : user.phone;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    user.bio = bio !== undefined ? bio : user.bio;
    user.learning_level = learningLevel || user.learning_level;

    await user.save();

    let expertDetails = null;
    if (user.role === 'expert') {
      expertDetails = await Expert.findOne({ where: { userId: user.id } });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        learningLevel: user.learning_level,
        isVerified: user.is_verified,
        expertProfile: expertDetails
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
};
