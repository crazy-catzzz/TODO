export class Todo {
    id : number;
    list_id : number;
    todo_name : string;
    completion_status : number;
    creation_date : string;
    last_modified : string;
    owner_id : number;

    constructor(
        id : number,
        list_id : number,
        todo_name : string = "",
        completion_status : number = 0,
        creation_date : string = "",
        last_modified : string = "",
        owner_id : number
    ) {
        this.id = id;
        this.list_id = list_id;
        this.todo_name = todo_name;
        this.completion_status = completion_status;
        this.creation_date = creation_date;
        this.last_modified = last_modified;
        this.owner_id = owner_id;
    }
}