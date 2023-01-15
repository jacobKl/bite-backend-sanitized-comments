const express = require("express");
const session = require('express-session')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express();

const PORT = 3001;

const user = require("./routes/user.routes")
const course = require("./routes/course.routes")
const visual = require("./routes/visual.routes");
const Database = require("./Database/Database");


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'fjsifuihsihfdsjioje' }));
app.use(cookieParser());
app.use(express.static('static'))

app.use("/user", user)
app.use("/course", course)
app.use("/visual", visual)
//

app.get("/", (request, response) => {
    response.send("Hi there");
});

app.listen(PORT, () => {
    console.log("Listen on the port 3001...");
});