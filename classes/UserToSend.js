class UserToSend {
    constructor(id, email, name, surname, avatar, role, money, nick, token) {
        this.id = id
        this.nick = nick;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.money = money;
        this.avatar = avatar;
        this.role = role 
        this.token = token
    }
}

module.exports = UserToSend