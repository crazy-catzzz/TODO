import { Database } from "bun:sqlite";

// Questo è un set di procedure scritte in TypeScript dopo che ho scoperto che SQLite non supporta le stored procedures (ho sprecato due ore della mia vita a scrivere tali stored procedures)

const db = new Database(Bun.env.DB_PATH!);

export function add_user(username : string, password : string) : number {
    let status : number = 0; // STATUS SUCCESS
    const cost_factor : number = 10;
    
    // Hash password con sale randomizzato
    Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: cost_factor,
    }).then(hash => {
        // Inserisci coppia username e hash nel DB
        db.query(`INSERT INTO users (username, password_hash) VALUES ("${username}", "${hash}");`)
        .run();
    }).catch(err => {
        status = 1; // STATUS FAILURE
        console.error(err);
    });

    return status;
};

export function get_user_by_ID(id : number) : any {
    const users_query : string = `SELECT id, username FROM users WHERE id=${id};`;
    const lists_query : string = `SELECT id, list_name FROM lists WHERE owner_id=${id};`;

    // Eseguo la query
    const user : any = db.query(users_query).get();
    const lists : any = db.query(lists_query).all();
    
    user.lists = lists;

    return user;
};