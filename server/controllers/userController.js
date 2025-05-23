import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    // Validation
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already in use" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    // Generate token
    const token = generateToken(newUser._id);

    // Return response (excluding password)
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user data (excluding password)
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      userData,
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Return user data (excluding sensitive fields)
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    delete userResponse.__v;

    res.status(200).json({
      success: true,
      message: "Authenticated",
      user: userResponse,
    });

  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    // Validation
    if (!bio || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: "Bio and full name are required" 
      });
    }

    let updateData = { 
      bio, 
      fullName,
      updatedAt: Date.now() 
    };

    // Handle profile picture upload
    if (profilePic) {
      try {
        const upload = await cloudinary.uploader.upload(profilePic, {
          folder: "profile_pics",
          upload_preset: "your_upload_preset" // Optional
        });
        updateData.profilePic = upload.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        select: "-password -__v" // Exclude sensitive fields
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};