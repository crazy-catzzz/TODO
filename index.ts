import express from "express";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded());

// Endpoint POST /api/v1/user
app.post("/api/v1/user", (req, res) => {
    /*
    il body della richiesta di creazione utente è circa così:
    {
        "username": "user",
        "password": "pass"
    }
    */

    const username = req.body.username;
    const password = req.body.password;
    
    
})

// Listen on port
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})