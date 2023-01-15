const Database = require("./Database");
const User = require("../classes/User")
const sql = require('yesql').pg;
const {Sequelize, QueryTypes} = require('sequelize');
const {Query} = require("pg");

module.exports = class CoursesDatabase {
    constructor(database) {
        this.database = database.provideDatabase()
    }

    indexCourses(trainerId) {
        let condition = ''
        if (trainerId) condition = `WHERE trainer_id=${trainerId}`

        console.log(condition)
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`SELECT *
                                                                             FROM courses ${condition}`)

            resolve(results)
        })
    }

    getCourse(id) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`SELECT *
                                                                             FROM courses
                                                                             WHERE id = ${id}`)

            resolve(results)
        })
    }

    getCourseSteps(id) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`SELECT *
                                                                             FROM course_parts
                                                                             WHERE course_id = ${id}`)

            resolve(results)
        })
    }

    createCourse(course) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`INSERT INTO courses(trainer_id, name, description, image, prize, category, difficulty)
                                                                             VALUES (:trainer_id, :name, :description,
                                                                                     :image, :prize, :category,
                                                                                     :difficulty) RETURNING *`,
                {
                    replacements: {
                        trainer_id: course.trainer_id,
                        name: course.name,
                        description: course.description,
                        image: course.image,
                        prize: course.prize,
                        category: course.category,
                        difficulty: course.difficulty
                    },
                    type: QueryTypes.SELECT
                }
            )

            resolve(results)
        })
    }

    createCoursePart(coursePart) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`INSERT INTO course_parts(course_id, title, informations, questions, attachemnts)
                                                                             VALUES (:course_id, :title, :informations,
                                                                                     :questions, :attachments
                                                                                     ) RETURNING *`,
                {
                    replacements: {
                        course_id: coursePart.course_id,
                        title: coursePart.title,
                        informations: coursePart.informations,
                        questions: coursePart.question,
                        attachments: coursePart.attachments,
                        step: coursePart.step
                    },
                    type: QueryTypes.SELECT
                }
            )

            resolve(results)
        })
    }

    countCourse(data) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`SELECT count(*) FROM courses_in_progress WHERE course_id=${data.course_id} AND user_id=${data.user_id} `)

            resolve(results)
        })
    }

    takeCourseForUser(data) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`INSERT INTO courses_in_progress(course_id, user_id, progress)
                                                                             VALUES (:course_id, :user_id, 1) RETURNING *`,
                {
                    replacements: {
                        course_id: data.course_id,
                        user_id: data.user_id,
                    },
                    type: QueryTypes.SELECT
                }
            )

            resolve(results)
        })
    }

    getCoursesForUser(id) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`SELECT *
                                                                             FROM courses_in_progress
                                                                             WHERE user_id = ${id}`)

            resolve(results)
        })
    }

    setProgress(data) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`UPDATE courses_in_progress SET progress = progress+1 WHERE course_id=:course_id AND user_id=:user_id RETURNING *`,
                {
                    replacements: {
                        course_id: data.course_id,
                        user_id: data.user_id,
                    },
                    type: QueryTypes.SELECT
                }
            )

            resolve(results)
        })
    }

    setCourseFinished(courseId, userId) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`UPDATE courses_in_progress SET finished = true WHERE user_id=${userId} AND course_id=${courseId}`)

            resolve(results)
        })
    }

    setUserMoney(id, money) {
        return new Promise(async (resolve, reject) => {
            const [results, metadata] = await this.database.sequelize.query(`UPDATE users SET money = money + ${money} WHERE id=${id}`)

            resolve(results)
        })
    }
}