export class List {
    id : number;
    owner_id : number;
    list_name : string;
    creation_date : string;
    last_modified : string;
    visibility_level : number;

    constructor(
        id : number = 0,
        owner_id : number = 0,
        list_name : string = "",
        creation_date : string = "",
        last_modified : string = "",
        visibility_level : number = 0
    ) {
        this.id = id;
        this.owner_id = owner_id;
        this.list_name = list_name;
        this.creation_date = creation_date;
        this.last_modified = last_modified;
        this.visibility_level = visibility_level;
    }
}