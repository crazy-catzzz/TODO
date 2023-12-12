import { Database } from "bun:sqlite";

// Tool che crea il database utilizzato dal backend
// Va banalmente a prendere una serie di query da un file .sql e le esegue

// Mi inserisco in un contesto asincrono
(async () => {
    // query.run() esegue una sola query per volta, quindi devo dividere le mie query in più stringhe
    const queries = (await Bun.file("db/create/todo.sql").text()).split(";");
    
    const db = new Database("db/todo.db");
    
    for (const query of queries) {
        if (query === "") break;
        db.run(`${query};`);
    }

    db.close();
})();