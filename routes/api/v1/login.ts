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

    procedures.validate_user(username, password).then(token => {
        res.send({token: token});
    })
    .catch(err => {
        if (err.message === "Not found") res.sendStatus(404);
        else if (err.message === "Unauthorized") res.sendStatus(401);
        else res.sendStatus(500);
    })
});
login_router.get(login_endpoint, (req, res) => res.sendStatus(405));
login_router.patch(login_endpoint, (req, res) => res.sendStatus(405));
login_router.delete(login_endpoint, (req, res) => res.sendStatus(405));