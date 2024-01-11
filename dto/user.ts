export class User {
    id : number;
    username : string;
    creation_date : string;
    password_hash : string;
    permission_level : number;

    constructor(
        id : number = 0,
        username : string = "",
        creation_date : string = "",
        password_hash : string = "",
        permission_level : number = 0
    ) {
        this.id = id;
        this.username = username;
        this.creation_date = creation_date;
        this.password_hash = password_hash;
        this.permission_level = permission_level;
    }
}