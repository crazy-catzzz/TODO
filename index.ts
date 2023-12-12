const express = require("express");

const app = express();
const port = 8080;

// Listen on port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})