const path = require("path");
const express = require("express");
const app = express();

// Set router
app.use("/", require("./routes/api/router"));

// Set Static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
