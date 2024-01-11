import express from "express";
import * as procedures from "@db/db_procedures.ts";
import { authenticate } from "@middleware/auth.ts";
import { Todo } from "@dto/todo";

export const todo_router = express.Router();

// Endpoint /todo
const todo_endpoint : string = "/todo";
todo_router.post(todo_endpoint, authenticate, (req, res) => {
    const list_id : number = req.body.list_id;
    const name : string = req.body.name;
    const author : any = procedures.get_user_by_ID(req.body.user.id);

    if (!list_id || !name) {
        res.sendStatus(400);
        return;
    }

    const list = procedures.get_list_by_ID(list_id);

    if (!list) {
        res.sendStatus(404);
        return;
    }
    if (list.owner_id != author.id && author.permission_level < 1) {
        res.sendStatus(403);
        return;
    }

    try {
        procedures.add_todo({
            list_id: list_id,
            todo_name: name
        } as Todo);
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
todo_router.get(`${todo_endpoint}/:id`, (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const todo = procedures.get_todo_by_ID(id);
        if (!todo) res.sendStatus(404);
        res.status(200).send(todo);
    } catch(err) {
        res.sendStatus(500);
    }
});
todo_router.patch(todo_endpoint, authenticate, (req, res) => {
    const author : any = procedures.get_user_by_ID(req.body.user.id);
    const to_edit : any = procedures.get_todo_by_ID(req.body.id);

    if (to_edit.owner_id != author.id && author.permission_level < 1) {
        res.sendStatus(403);
        return;
    }
    if (to_edit == undefined) {
        res.sendStatus(404);
        return;
    }

    try {
        procedures.edit_todo({
            id: req.body.id,
            todo_name: req.body.todo_name === undefined? to_edit.todo_name : req.body.todo_name,
            completion_status: Number.isFinite(req.body.completion_status)? req.body.completion_status : to_edit.completion_status
        } as Todo);
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
todo_router.delete(`${todo_endpoint}/:id`, authenticate, (req, res) => {
    const author : any = procedures.get_user_by_ID(req.body.user.id);
    const to_delete : any = procedures.get_todo_by_ID(parseInt(req.params.id));

    if (to_delete.owner_id != author.id && author.permission_level < 1) {
        res.sendStatus(403);
        return;
    }
    if (to_delete == undefined) {
        res.sendStatus(404);
        return;
    }

    try {
        procedures.delete_todo(to_delete.id);
    } catch {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});