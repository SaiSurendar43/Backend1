import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const UserResolver = {
  Mutation: { 
    signUp: async (_, { input }) => {
      try {
        const { username, name, password, email } = input;
    
        if (!username || !name || !password || !email) {
          throw new Error("All fields are required.");
        }
    
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("User already exists.");
        }
    
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        // Create new user
        const newUser = new User({
          username, 
          name,
          password: hashedPassword,
          email,
        });
    
        await newUser.save();
        console.log("New user created:", newUser);
    
        // Generate a JWT token
        const token = jwt.sign(
          { id: newUser._id.toString() }, 
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
    
        console.log("Token generated:", token);
    
        // Return user data with token
        return {
          ...newUser.toObject(),
          _id: newUser._id.toString(),
          token,
        };
      } catch (error) {
        console.error("Error in SignUp:", error);
        throw new Error(error.message || "Internal Server Error.");
      }
    },
    
    
    
  
    login: async (_, { input }) => {
      try {
        const { email, password } = input;
        const user = await User.findOne({ email });
    
        if (!user) {
          throw new Error("Invalid email or password.");
        }
    
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid email or password.");
        }
    
        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
    
        return { user, token };
      } catch (error) {
        console.error("Error in Login:", error);
        throw new Error(error.message || "Internal Server Error.");
      }
    }
    
  },

  Query: {
    authUser: async (_, __, context) => {
      try {
        if (!context.user) {
          throw new Error("Not authenticated");
        }
        return context.user;
      } catch (error) {
        console.error("Error in authUser", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    user: (_, { userId }) => {
      try {
        return users.find(user => user._id === userId);
      } catch (error) {
        console.error("Error in query", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
};

export default UserResolver;
