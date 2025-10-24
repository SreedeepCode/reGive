import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import User from "./models/users.js";
import adminRoutes from "./routes/adminroutes.js";
import donationRoutes from "./routes/donationroutes.js";
import cookieParser from 'cookie-parser';
import itemRoutes from "./routes/itemRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authroutes.js";
import frequentroutes from "./routes/frequentroutes.js"
import leaderboardRoutes from "./routes/leaderboardroutes.js"
import cors from "cors";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./middleware/verify.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "uploads");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

connectDB();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile._json.email });

        if (!user) {
          user = await User.create({
            name: profile._json.name,
            displayName: profile._json.given_name,
            email: profile._json.email,
            profile: profile._json.picture,
            setupComplete: false,
          });
        }

        user.googleAccessToken = accessToken;
        user.googleRefreshToken = refreshToken;
        await user.save();

        return done(null, user);
      } catch (err) {
        console.error("Google strategy error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("Deserialize error:", err);
    done(err, null);
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173" }),
  (req, res) => {
    const frontendBase = "http://localhost:5173";
    res.redirect(`${frontendBase}/auth/callback`);
  }
);

app.get("/api/auth/google-token", ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: req.user._id,
        name: req.user.name,
        displayName: req.user.displayName,
        email: req.user.email,
        profile: req.user.profile,
        role: req.user.role,
        setupComplete: req.user.setupComplete,
      },
      googleAccessToken: req.user.googleAccessToken,
      googleRefreshToken: req.user.googleRefreshToken,
    });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: "Token generation failed" });
  }
});

app.post("/api/user/initial-setup", ensureAuthenticated, async (req, res) => {
  try {
    const { displayName, phone, address } = req.body;

    if (!displayName || !phone || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { displayName, phone, address, setupComplete: true },
      { new: true }
    );

    const accessToken = generateAccessToken(updatedUser);
    const refreshToken = generateRefreshToken(updatedUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        profile: updatedUser.profile,
        role: updatedUser.role,
        setupComplete: updatedUser.setupComplete,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
      googleAccessToken: updatedUser.googleAccessToken,
      googleRefreshToken: updatedUser.googleRefreshToken,
    });
  } catch (err) {
    console.error("Error during initial setup:", err);
    res.status(500).json({ error: "Something went wrong during setup." });
  }
});

app.use("/api/donation", donationRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api/frequent",frequentroutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/user", userRoutes);
app.use("/", homeRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
