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
import cookieParser from "cookie-parser";
import itemRoutes from "./routes/itemroutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import leaderboardRoutes from "./routes/leaderboardroutes.js";
import userRoutes from "./routes/userRoutes.js";

import itemDetailRoute from "./routes/itemDetailRoute.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define uploadDir BEFORE using it-images
const uploadDir = path.join(__dirname, "..", "uploads");

//Asiya
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // prevents client-side JS from reading cookie
      secure: false, // must be false on localhost (no HTTPS)
      sameSite: "lax", // safe for OAuth redirects on localhost
    },
  })
);
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

// Make `user` available in all EJS views
app.use((req, res, next) => {
  res.locals.user = req.user; // accessible in all EJS templates as `user`
  next();
});

// Serve static frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Connect to DB
connectDB();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // console.log(profile);

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

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  // Store original URL in a cookie
  res.cookie("returnTo", req.originalUrl, { httpOnly: true });
  return res.redirect("/auth/google");
}
// Login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log(
      "callback BEFORE redirect: sessionID =",
      req.sessionID,
      "returnTo =",
      req.session?.returnTo
    );

    if (!req.user.setupComplete) {
      return res.redirect("/initial-login");
    }

    // Read the redirect URL from the cookie
    const redirectUrl = req.cookies?.returnTo || "/";

    // Clear the cookie after using it
    res.clearCookie("returnTo");

    res.redirect(redirectUrl);
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "../frontend/views"));

// Page Routes

/*app.get('/', (req, res) => {
    res.render('home');
});*/

// app.get("/", async (req, res) => {
//   try {
//     // Fetch top 5 donors sorted by totalPoints descending
//     const topDonors = await User.find({}, "displayName profile points")
//       .sort({ points: -1 })
//       .limit(5);
//     //console.log(topDonors);

//     // Render home page and pass topDonors to EJS
//     res.render("home", { topDonors });
//   } catch (err) {
//     console.error("Error fetching top donors:", err);
//     res.render("home", { topDonors: [] });
//   }
// });

app.get("/category", ensureAuthenticated, (req, res) => {
  res.render("category");
});

app.get("/donate", ensureAuthenticated, (req, res) => {
  res.render("donate");
});

app.get("/catalog", (req, res) => {
  res.render("catalog");
});

app.get("/admin", ensureAuthenticated, (req, res) => {
  res.render("admin");
});

app.get("/user-profile", ensureAuthenticated, (req, res) => {
  res.render("user-profile");
});

app.get("/initial-login", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  if (req.user.setupComplete) return res.redirect("/");
  res.render("initial", { user: req.user });
});

// Post routes

app.post("/initial-login", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  try {
    const { displayName, phone, address } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      displayName,
      phone,
      address,
      setupComplete: true,
    });

    // Read the cookie again, fallback to home
    const redirectUrl = req.cookies.returnTo || "/";
    res.clearCookie("returnTo");

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Error during initial setup:", err);
    res.status(500).send("Something went wrong during setup.");
  }
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api", donationRoutes);
app.use("/", itemDetailRoute);
app.use("/api", itemRoutes);
app.use("/api/user", userRoutes);
app.use("/", homeRoutes);
app.use("/api", leaderboardRoutes);

// for images

app.use("/uploads", express.static(uploadDir));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
