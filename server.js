const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware //
///////////////

// Parses requests from the client from JSON into JS objects.
app.use(express.json());

// CORS, for annoying cross site bullshit
app.use(cors());

// Main Node Server //
//////////////////////

// Set port to env variable, lets server set it if you deploy it. If not found, uses port 5000.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is UP bby"));
