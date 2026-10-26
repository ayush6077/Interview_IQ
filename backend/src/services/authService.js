const User = require('../models/User');

/**
 * Register a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
const register = async (name, email, password) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = user.generateToken();

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Login an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = user.generateToken();

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Get a user's profile.
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Update a user's profile.
 * @param {string} userId
 * @param {object} updates - Allowed: name, profile.bio, profile.targetRole, profile.experience
 * @returns {Promise<object>}
 */
const updateProfile = async (userId, updates) => {
  const allowedUpdates = {};

  if (updates.name) allowedUpdates.name = updates.name;
  if (updates.profile) {
    allowedUpdates.profile = {};
    if (updates.profile.bio !== undefined) allowedUpdates.profile.bio = updates.profile.bio;
    if (updates.profile.targetRole !== undefined) allowedUpdates.profile.targetRole = updates.profile.targetRole;
    if (updates.profile.experience !== undefined) allowedUpdates.profile.experience = updates.profile.experience;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = { register, login, getProfile, updateProfile };
