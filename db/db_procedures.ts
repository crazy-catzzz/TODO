import { Database } from "bun:sqlite";

// Questo è un set di procedure scritte in TypeScript dopo che ho scoperto che SQLite non supporta le sotred procedures (ho sprecato due ore della mia vita a scrivere tali stored procedures)

const db = new Database(Bun.env.DB_PATH!);

export function add_user(username : string, password : string) : number {
    let status : number = 200; // 200 OK
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
        status = 500; // 500 Internal Server Error
        console.error(err);
    });

    return status;
}