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
    const id : number = parseInt(req.params.id);
    
    const user = procedures.get_user_by_ID(id);
    const lists = procedures.get_user_lists(id);
    
    if (!user) res.sendStatus(404); // 404 Not Found
    else res.status(200).send({user, lists});
});
app.patch(user_endpoint, authenticate, async (req, res) => {
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
app.delete(`${user_endpoint}/:id`, authenticate, (req, res) => {
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
app.get(login_endpoint, (req, res) => res.sendStatus(405));
app.patch(login_endpoint, (req, res) => res.sendStatus(405));
app.delete(login_endpoint, (req, res) => res.sendStatus(405));

// Endpoint /api/v1/list
const list_endpoint : string = "/api/v1/list";
app.post(list_endpoint, authenticate, (req, res) => {
    const list_name = req.body.name;

    const author_id= req.body.user.id;

    try {
        procedures.add_list(list_name, author_id);
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
app.get(`${list_endpoint}/:id`, (req, res) => {
    const id : number = parseInt(req.params.id);

    const list = procedures.get_list_by_ID(id);
    const todos = procedures.get_list_todos(id);

    res.status(200).send({list, todos});
});
app.patch(list_endpoint, authenticate, (req, res) => {
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
app.delete(`${list_endpoint}/:id`, authenticate, (req, res) => {
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

// Endpoint /api/v1/todo
const todo_endpoint : string = "/api/v1/todo";
app.post(todo_endpoint, authenticate, (req, res) => {
    const id : number = req.body.list_id;
    const name : string = req.body.name;
    const author : any = procedures.get_user_by_ID(req.body.user.id);

    if (!id || !name) {
        res.sendStatus(400);
        return;
    }

    const list = procedures.get_list_by_ID(id);

    if (!list) {
        res.sendStatus(404);
        return;
    }
    if (list.owner_id != author.id && author.permission_level < 1) {
        res.sendStatus(403);
        return;
    }

    try {
        procedures.add_todo(id, name);
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
app.get(`${todo_endpoint}/:id`, (req, res) => {
    const id = parseInt(req.params.id);

    let todo;

    try {
        todo = procedures.get_todo_by_ID(id);
    } catch(err) {
        res.sendStatus(500);
    }

    res.status(200).send(todo);
});
app.patch(todo_endpoint, authenticate, (req, res) => {
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
        });
    } catch(err) {
        res.sendStatus(500);
    }

    res.sendStatus(200);
});
app.delete(`${todo_endpoint}/:id`, authenticate, (req, res) => {
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

// Listen on port
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});