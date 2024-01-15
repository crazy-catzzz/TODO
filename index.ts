import express from "express";
import { api_v1_router } from "@routes/api/v1/index.ts";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// Routes
app.use("/api/v1", api_v1_router);

// Listen on port
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});