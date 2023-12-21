import { Database } from "bun:sqlite";
import * as auth from "../auth/auth_helpers.ts";

// Questo è un set di procedure scritte in TypeScript dopo che ho scoperto che SQLite non supporta le stored procedures (ho sprecato due ore della mia vita a scrivere tali stored procedures)

// TODO: Creare un oggetto procedure_return

const db = new Database(Bun.env.DB_PATH!);

export async function add_user(username : string, password : string) : Promise<number> {
    let status : number = 0; // STATUS SUCCESS
    const cost_factor : number = 10;
    
    // Hash password con sale randomizzato
    try {
        const hash = await auth.create_hash(password);
        // Inserisci coppia username e hash nel DB
        db.query(`INSERT INTO users (username, password_hash) VALUES ("${username}", "${hash}");`)
        .run();
    } catch(err) {
        status = 1; // STATUS FAILURE
        console.error(err);
    }

    return status;
};

// Utilizzando any come tipo vado direttamente contro il motivo dell'esistenza di TypeScript, tuttavia non effettuo troppe operazioni con questo oggetto anonimo
// Forse andrò a creare dei DTO per salvaguardare la type safety
export function get_user_by_ID(id : number) : any {
    const users_query : string = `SELECT id, username, permission_level FROM users WHERE id=${id};`;

    // Eseguo la query
    const user : any = db.query(users_query).get();

    return user;
};

export function get_user_lists(id : number) : any {
    const lists_query : string = `SELECT id, list_name FROM lists WHERE owner_id=${id};`;

    // Eseguo la query
    const lists : any = db.query(lists_query).all();

    return lists;
}

// Asincrona perché devo ritornare un valore per cui aspetto
export async function validate_user(username : string, password : string) : Promise<any> {
    const user_query = `SELECT password_hash, id FROM users WHERE username="${username}"`;

    // Ottengo la password hashata dal DB
    const user_obj : any = db.query(user_query).get();
    if (!user_obj) return undefined;
    
    const password_hash = user_obj.password_hash;

    // Confronto la password con l'hash e ritorno un token di accesso se combaciano
    let token : string = "";
    let status : number = 0; // STATUS SUCCESS
    
    try {
        let match = await auth.compare_hash(password, password_hash)
        if (match) {
            // Genera token di accesso
            token = auth.generate_access_token(user_obj.id);
        }
    } catch(err) {
        console.error(err);
        status = 1; // STATUS FAILURE
    }

    // procedure_obj (procedure_return)
    return {
        status: status,
        token: token,
    };
};

export function edit_username(edits : any) : void {
    const update_query = `UPDATE users SET username="${edits.username}" WHERE id=${edits.id};`;

    // Eseguo la query di update
    try {
        db.run(update_query);
    } catch(err) {
        throw err;
    }
}

export async function edit_password(edits : any) : Promise<void> {
    const hash_query = `SELECT password_hash FROM users WHERE id=${edits.id};`;

    // Eseguo la query di update
    try {
        const hash : string = ((hash_obj : any = db.query(hash_query).get()) => {
            return hash_obj.password_hash;
        })();

        const match = await auth.compare_hash(edits.old_password, hash);
        if (!match) {
            let err : any = new Error("Passwords don't match");
            err.code = "noMatch";
            throw err;
        }

        // Creo l'hash della nuova password
        const pw_hash = await auth.create_hash(edits.password);
        const update_query = `UPDATE users SET password_hash="${pw_hash}" WHERE id=${edits.id};`;

        db.query(update_query).run();
    } catch(err) {
        throw err;
    }
}

export function delete_user(id : number) {
    const delete_query = `DELETE FROM users WHERE id=${id};`;

    try {
        db.query(delete_query).run();
    } catch(err) {
        throw err;
    }
}

export function add_list(list_name : number, owner_id : number) : void {
    const add_query = `INSERT INTO lists (owner_id, list_name) VALUES (${owner_id}, "${list_name}");`;

    try {
        db.query(add_query).run();
    } catch(err) {
        throw err;
    }
}

export function get_list_by_ID(id : number) : any {
    const select_query = `SELECT * FROM lists WHERE id=${id};`;

    try {
        return db.query(select_query).get();
    } catch(err) {
        console.error(err);
        throw err;
    }
}

export function edit_list(edits : any) : void {
    const update_query = `UPDATE lists SET visibility_level=${edits.visibility_level}, list_name="${edits.list_name}" WHERE id=${edits.id};`;

    try {
        db.query(update_query).run();
    } catch(err) {
        console.error(err);
        throw err;
    }
}

export function delete_list(id : number) : void {
    const delete_query = `DELETE FROM lists WHERE id=${id}`;

    try {
        db.query(delete_query).run();
    } catch(err) {
        console.error(err);
        throw err;
    }
}