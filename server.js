const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Route Imports
const { authRoutes } = require("./routes/authRoutes");
const { postRoutes } = require("./routes/postRoutes");
const { authorRoutes } = require("./routes/authorRoutes");
const { tagRoutes } = require("./routes/tagRoutes");

// Dotenv
dotenv.config();

// Port
const port = process.env.PORT || 3000;

// Base Routes
app.use("/api/users", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/tags", tagRoutes);

// Port listening
app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});
