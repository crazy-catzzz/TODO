import express from "express";
import * as procedures from "@db/db_procedures.ts";


export const login_router = express.Router();

// Endpoint /login
const login_endpoint : string = "/login";
login_router.post(login_endpoint, (req, res) => {
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
login_router.get(login_endpoint, (req, res) => res.sendStatus(405));
login_router.patch(login_endpoint, (req, res) => res.sendStatus(405));
login_router.delete(login_endpoint, (req, res) => res.sendStatus(405));