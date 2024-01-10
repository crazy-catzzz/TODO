import express from "express";
import * as procedures from "@db/db_procedures.ts";
import { authenticate } from "@middleware/auth.ts";


export const user_router = express.Router();

// Endpoint /user
const user_endpoint : string = "/user";
user_router.post(user_endpoint, (req, res) => {
    /*
    il body della richiesta di creazione utente è circa così:
    {
        "username": "user",
        "password": "pass"
    }
    */

    const username = req.body.username;
    const password = req.body.password;
    
    procedures.add_user(username, password).then(() => {
        res.sendStatus(200); // 200 OK
    })
    .catch(err => {
        res.status(500).send(err.message); // 500 Internal server error
    })
});
user_router.get(`${user_endpoint}/:id`, (req, res) => {
    // Prendo l'ID dai parametri e lo converto a integer
    const id : number = parseInt(req.params.id);
    
    try {
        const user = procedures.get_user_by_ID(id);
        const lists = procedures.get_user_lists(id);
        
        if (!user) res.sendStatus(404); // 404 Not Found
        else res.status(200).send({user, lists});
    } catch(err) {
        res.sendStatus(500);
    }
});
user_router.patch(user_endpoint, authenticate, async (req, res) => {
    const edit_author = procedures.get_user_by_ID(req.body.user.id);
    const edits = req.body;

    if (edit_author.id != edits.id && edit_author.permission_level < 1) {
        // L'utente sta provando a modificare un altro utente senza permesso
        res.sendStatus(403); // 403 Forbidden
        return;
    }

    try {
        if (edits.username) procedures.edit_username(edits);
        if (edits.password) await procedures.edit_password(edits);
    } catch(err : any) {
        if (err.code == "noMatch") {
            res.status(403).send(err.message);
            return;
        }
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
user_router.delete(`${user_endpoint}/:id`, authenticate, (req, res) => {
    const author : any = procedures.get_user_by_ID(req.body.user.id);

    const id : number = parseInt(req.params.id);

    if (author.id != id && author.permission_level < 1) {
        // L'utente sta provando ad eliminare un altro utente senza permesso
        res.sendStatus(403); // 403 Forbidden
        return;
    }
    
    try {
        procedures.delete_user(id);
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }

    res.sendStatus(200);
});