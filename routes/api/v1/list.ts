import express from "express";
import * as procedures from "@db/db_procedures.ts";
import { authenticate } from "@middleware/auth.ts";


export const list_router = express.Router();

// Endpoint /list
const list_endpoint : string = "/list";
list_router.post(list_endpoint, authenticate, (req, res) => {
    const list_name = req.body.name;

    const author_id= req.body.user.id;

    try {
        procedures.add_list(list_name, author_id);
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
list_router.get(`${list_endpoint}/:id`, (req, res) => {
    const id : number = parseInt(req.params.id);

    const list = procedures.get_list_by_ID(id);
    const todos = procedures.get_list_todos(id);

    res.status(200).send({list, todos});
});
list_router.patch(list_endpoint, authenticate, (req, res) => {
    const to_edit : any = procedures.get_list_by_ID(req.body.id);
    const author : any = procedures.get_user_by_ID(req.body.user.id);
    if (to_edit.owner_id != author.id && author.permission_level < 1) {
        res.sendStatus(403);
        return;
    }
    if (to_edit == undefined) {
        res.sendStatus(404);
        return;
    }

    try {
        procedures.edit_list({
            id: req.body.id,
            list_name: req.body.list_name === undefined? to_edit.list_name : req.body.list_name,
            visibility_level: Number.isFinite(req.body.visibility_level)? req.body.visibility_level : to_edit.visibility_level
        });
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
list_router.delete(`${list_endpoint}/:id`, authenticate, (req, res) => {
    const author = procedures.get_user_by_ID(req.body.user.id);
    const to_delete = procedures.get_list_by_ID(parseInt(req.params.id));

    if (to_delete.owner_id != author.id && author.permission_level < 1) {
        res.sendStatus(403);
        return;
    }

    try {
        procedures.delete_list(to_delete.id);
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});