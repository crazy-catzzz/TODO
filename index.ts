import express from "express";
import * as procedures from "./db/db_procedures.ts";
import { authenticate } from "./middleware/auth.ts";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded());

// Endpoint /api/v1/user
const user_endpoint : string = "/api/v1/user";
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
    
    procedures.add_user(username, password).then(exit => {
        if(exit == 0) {
            res.sendStatus(200); // 200 OK
        } else {
            res.sendStatus(500); // 500 Internal Server Error
        }
    })
});
app.get(`${user_endpoint}/:id`, (req, res) => {
    // Prendo l'ID dai parametri e lo converto a integer
    // Prendendo l'ID dai parametri, avrò un ID scritto come ":id", lasciandolo così non posso utilizzare la funzione parseInt()
    const id : number = parseInt(req.params.id.substring(1));
    
    const user = procedures.get_user_by_ID(id);
    
    if (!user) res.sendStatus(404); // 404 Not Found
    else res.status(200).send(user);
});
app.patch(user_endpoint, authenticate, (req, res) => {
    const edit_author = procedures.get_user_by_ID(req.body.user.id);
    console.log(edit_author);
    res.sendStatus(200);
});
app.delete(user_endpoint, (req, res) => {
    res.sendStatus(501)
});

// Endpoint /api/v1/login
const login_endpoint : string = "/api/v1/login";
app.post(login_endpoint, (req, res) => {
    /*
    Il body di una richiesta di login è così:
    {
        "username": "user",
        "password": "pass"
    }
    */

    const username = req.body.username;
    const password = req.body.password;

    procedures.validate_user(username, password).then(token_obj => {
        
        if (!token_obj) {
            res.sendStatus(404); // 404 Not Found
        } else if (token_obj.status != 0) {
            res.sendStatus(500); // 500 Internal Server Error
        } else if (token_obj.token == "") {
            res.sendStatus(401); // 401 Unauthorized
        } else {
            res.status(200).send({token: token_obj.token}); // 200 OK
        }
    });
});

// Listen on port
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})