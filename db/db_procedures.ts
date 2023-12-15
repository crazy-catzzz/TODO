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
    const users_query : string = `SELECT id, username FROM users WHERE id=${id};`;
    const lists_query : string = `SELECT id, list_name FROM lists WHERE owner_id=${id};`;

    // Eseguo la query
    const user : any = db.query(users_query).get();
    const lists : any = db.query(lists_query).all();
    
    user.lists = lists;

    return user;
};

// Asincrona perché devo ritornare un valore per cui aspetto
export async function validate_user(username : string, password : string) : Promise<any> {
    const hash_query = `SELECT password_hash FROM users WHERE username="${username}"`;
    
    // Ottengo la password hashata dal DB
    const hash_obj : any = db.query(hash_query).get();
    if (!hash_obj) return undefined;
    
    const password_hash = hash_obj.password_hash;

    // Confronto la password con l'hash e ritorno un token di accesso se combaciano
    let token : string = "";
    let status : number = 0; // STATUS SUCCESS
    
    try {
        let match = await auth.compare_hash(password, password_hash)
        if (match) {
            token = auth.generate_access_token(username);
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