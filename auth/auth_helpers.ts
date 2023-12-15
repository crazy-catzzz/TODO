// Funzioni helper utili per hashing password e autenticazione

import jwt from "jsonwebtoken";

// HASHING

export async function create_hash(password : string) : Promise<string> {
    const cost_factor : number = 10;

    return await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: cost_factor,
    });
};

export async function compare_hash(password : string, hash : string) : Promise<boolean> {
    return await Bun.password.verify(password, hash, "bcrypt");
};

// AUTENTICAZIONE JWT

export function generate_access_token(id : number) : any {
    return jwt.sign({id: id}, Bun.env.TOKEN_SECRET!, {
        expiresIn: "2h", // Scade in 2 ore
    });
};