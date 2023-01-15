const Database = require("./Database");
const User = require("../classes/User")
const UserToSend = require("../classes/UserToSend")
const { Sequelize, QueryTypes } = require('sequelize');
const bcrypt = require("bcrypt");

module.exports = class UserDatabase {
    constructor(database) {
        this.database = database.provideDatabase()
    }

    indexUsers() {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`SELECT *
                                                                             FROM users`)

            resolve(results)
        })
    }


    /**
     * Metoda do rejestracji użytkownika. Po zahashowaniu hasła wysyła zapytanie sql z instrukcją
     * INSERT. Jeżeli z metadanych
     * @param {User} user 
     */
    registerUser(user) {
        return new Promise(async (resolve, reject) => {
            bcrypt.hash(user.password, 10, async (err, hash) => {
                const [results, metadata] = await this.database.sequelize.query(`INSERT INTO users(name,surname,password,nick,email,role,avatar,money,token) 
            VALUES(:name, :surname, :password,:nick,:email,:role,'',0, uuid_generate_v1())`,
                    {
                        replacements: {
                            name: user.name,
                            surname: user.surname,
                            password: hash,
                            nick: user.nick,
                            email: user.email,
                            role: user.role
                        },
                        type: QueryTypes.INSERT
                    }
                )
                if (metadata == 1) {
                    let createdUser = await this.database.sequelize.query("SELECT * FROM users WHERE nick=:nick LIMIT 1", {
                        replacements: {
                            nick: user.nick
                        },
                        type: QueryTypes.SELECT
                    })
                    const { password: _, ...parsedUser } = createdUser[0]
                    resolve({ status: "success", user: new UserToSend(...Object.values(parsedUser)) })
                } else {
                    resolve({ status: "error", error: "Registeration error" })
                }
            })
        })


    }

    loginUser(username, password) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query("SELECT * FROM users where nick=:username",
                {
                    replacements: {
                        username: username,
                    },
                    type: QueryTypes.SELECT
                }
            )

            if(results === undefined) {
                resolve({ status: "error", error: "Invalid username or password" })
                return
            }

            bcrypt.compare(password, results.password, async (err, result) => {
                if (result) {
                    await this.rewriteToken(username)
                    let createdUser = await this.database.sequelize.query("SELECT * FROM users WHERE nick=:nick LIMIT 1", {
                        replacements: {
                            nick: username
                        },
                        type: QueryTypes.SELECT
                    })
                    console.log(createdUser)
                    const { password: _, ...parsedUser } = createdUser[0]
                    resolve({ status: "success", user: new UserToSend(...Object.values(parsedUser)) })
                }
                else resolve({ status: "error", error: "Invalid username or password" })
            })
        })
    }

    async rewriteToken(username) {
        const [results, metadata] = await this.database.sequelize.query("UPDATE users SET token=uuid_generate_v1() WHERE nick=:username",
            {
                replacements: {
                    username: username,
                },
                type: QueryTypes.UPDATE
            }
        )
    }

    async userExist(username, email) {
        const [results, metadata] = await this.database.sequelize.query("SELECT count(*) as existing FROM users WHERE nick=:nick OR email=:email",
            {
                replacements: { nick: username, email: email },
                type: QueryTypes.SELECT
            })
        if (parseInt(results.existing) > 0) {
            return true;
        } else {
            return false;
        }
    }

    async editUser(name, surname, avatar, id) {
        this.database.sequelize.query("UPDATE users SET name=:name, surname=:surname, avatar=:avatar WHERE id=:id",
            {
                replacements: {
                    name: name,
                    avatar: avatar,
                    surname: surname,
                    id: id
                },
                type: QueryTypes.UPDATE
            }
        )
    }

    async getUser(token) {
        const [results, metadata] = await this.database.sequelize.query("SELECT * from users where token=:token", {
            replacements: { token: token },
            type: QueryTypes.SELECT
        })
        if (results) {
            const { password: _, ...parsedResults } = results
            return ({ status: "success", user: new UserToSend(...Object.values(parsedResults)) })
        } else {
            return ({ status: "error", error: "Not authorized" })
        }
    }
}