const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");
mongoose.set("useFindAndModify", false);

require("dotenv").config();

const app = express();

// Middleware //
///////////////

// Parses requests from the client from JSON into JS objects.
app.use(express.json());

// CORS, for annoying cross site bullshit
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

// Main Node Server //
//////////////////////

// Set port to env variable, lets server set it if you deploy it. If not found, uses port 5000.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is UP bby"));

// Mongoose! //
//////////////
const URI = process.env.MONGO_URI;
mongoose.connect(
  URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  (err) => {
    if (err) throw err;
    console.log("Mongoose is ALIVE!");
  }
);

app.use("/api/v1/users", routes);
