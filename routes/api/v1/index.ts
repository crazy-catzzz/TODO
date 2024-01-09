import express from "express";

// Importo i router
import { user_router } from "./user.ts";
import { login_router } from "./login.ts";
import { list_router } from "./list.ts";
import { todo_router } from "./todo.ts";

export const api_v1_router = express.Router();

api_v1_router.use(user_router);
api_v1_router.use(login_router);
api_v1_router.use(list_router);
api_v1_router.use(todo_router);