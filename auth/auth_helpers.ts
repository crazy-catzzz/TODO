export async function create_hash(password : string) : Promise<string> {
    const cost_factor : number = 10;

    return await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: cost_factor,
    });
};

export async function compare_hash(password : string, hash : string) : Promise<boolean> {
    return await Bun.password.verify(password, hash, "bcrypt");
}