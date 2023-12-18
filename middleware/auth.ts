import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Middleware per autneticazione via token

export function authenticate(req : Request, res : Response, next : any) : void {
    const auth_header = req.headers["authorization"];
    const token = auth_header && auth_header.split(' ')[1];

    if (token == null) {
        res.sendStatus(401); // 401 Unauthorized
        return;
    }

    jwt.verify(token, Bun.env.TOKEN_SECRET!, (err : any, user : any) => {
        if (err) {
            console.error(err);
            res.status(403).send(err.message || "Forbidden"); // 403 Forbidden
            return;
        }

        req.body.user = user;

        next();
    });
}