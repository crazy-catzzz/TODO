import express from "express";
import * as procedures from "./db/db_procedures.ts";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded());

// Endpoint /api/v1/user
const user_endpoint = "/api/v1/user"
app.post(user_endpoint, (req, res) => {
    /*
    il body della richiesta di creazione utente è circa così:
    {
        "username": "user",
        "password": "pass"
    }
    */

    const username = req.body.username;
    const password = req.body.password;
    
    if(procedures.add_user(username, password) == 0) {
        res.sendStatus(200); // 200 OK
    } else {
        res.sendStatus(500); // 500 Internal Server Error
    }
});
app.get(`${user_endpoint}/:id`, (req, res) => {
    // Prendo l'ID dai parametri e lo converto a integer
    const id : number = parseInt(req.params.id.substring(1));
    
    const user = procedures.get_user_by_ID(id);
    
    if (!user) res.sendStatus(404); // 404 Not Found
    else res.status(200).send(user);
});

// Listen on port
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})