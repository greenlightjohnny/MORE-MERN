const app = require("express");
const mongoose = requrie("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware //
///////////////

// Parses requests from the client from JSON into JS objects.
app.request(express.json());

// CORS, for annoying cross site bullshit
app.use(cors());
