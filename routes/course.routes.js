const express = require("express")
const Course = require("../classes/Course")
const app = express()
const Database = require("../Database/CourseDatabase")
const path = require('path')
const verifyUser = require("../Database/TokenMiddleware")
const {data} = require("express-session/session/cookie");
var DatabaseProvider = require("../DatabaseProvider")()


const database = new Database(DatabaseProvider)

const router = express.Router()

router.post("/finish/:id", async (req, res) => {
    await database.setCourseFinished(req.params.id, req.body.userid)

    results = await database.setUserMoney(req.body.userid, req.body.prize)

    res.send({
        success: true
    })
})

router.post("/create", verifyUser, async (req, res) => {
    const {trainer_id, name, description, image, prize, category, difficulty, attachments} = req.body
    const course = new Course(trainer_id, name, description, image, prize, category, difficulty, attachments)

    const steps = req.body.steps
    const results = await database.createCourse(course)

    let tab = []
    steps.forEach(step => {
        step['course_id'] = results['id']
        step['question'] = JSON.stringify(step['question'])

        database.createCoursePart(step)
        tab.push(step)
    })

    results['steps'] = tab

    res.send(results)
})

router.get("/take/:id", async (req, res) => {
    const results = await database.getCoursesForUser(req.params.id)

    let tab = []
    for(let i in results) {
        const courses = await database.getCourse(results[i].course_id)
        results[i].course = courses[0]
        results[i].course.steps = await database.getCourseSteps(results[i].course_id)
    }

    res.send(results)
})

router.post("/take", async (req, res) => {
    const checkIfExist = await database.countCourse(req.body)
    if(checkIfExist[0]['count'] == 0) {

        const results = await database.takeCourseForUser(req.body)

        res.send({
            success: true,
            data: results
        })
    } else {
        res.send({
            success: false
        })
    }
})

router.post("/set-progress", async (req, res) => {
    const results = await database.setProgress(req.body)

    res.send(results)
})

router.get("/", async (req, res) => {
    const courses = await database.indexCourses(req.query.id)

    for (let i in courses) {
        courses[i]['steps'] = await database.getCourseSteps(courses[i]['id'])
    }

    res.send(courses)
})

router.get("/not/:userId", async (req, res) => {
    const userCourses = await database.getCoursesForUser(req.params.userId)
    let courses = await database.indexCourses()

    for(let i in courses) {
        for(let k in userCourses) {
            if(courses[i] && userCourses[k]) {
                if (courses[i].id == userCourses[k].course_id) {
                    courses.splice(i, 1)
                }
            }
        }
    }

    res.send(courses)
})

router.get("/:id", async (req, res) => {
    const course = await database.getCourse(req.params.id)

    course[0]['steps'] = await database.getCourseSteps(course[0]['id'])

    res.send(course[0])
})

module.exports = router;