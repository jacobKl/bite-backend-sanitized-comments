const { Sequelize } = require("sequelize");

class Database {
    constructor() {
        this.sequelize = null
        this.connect()
    }

    async connect() {
        this.sequelize = new Sequelize("postgres://ulggddmr:jnIE26VYpYQCqEXa9MH7e07ZjUVUczqE@snuffleupagus.db.elephantsql.com/ulggddmr")
        try {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
}

module.exports = Database