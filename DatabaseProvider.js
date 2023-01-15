const Database = require("./Database/Database")

const database = new Database()
module.exports = function(){
    return {
        provideDatabase:function(){
            return database
        }
    }
}