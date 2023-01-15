class User {
    constructor(id, email, password, name, surname, avatar, role, money, nick) {
        this.id = id
        this.password = password;
        this.nick = nick;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.money = money;
        this.avatar = avatar;
        this.role = role === "on" ? "Trainer" : "User"
    }
}

module.exports = User