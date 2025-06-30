import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './Routes/user.routes.js'
import adminRouter from './Routes/admin.routes.js'
import upcominCompanyRouter from './Routes/upcomingCompany.routes.js'
import placementRouter from './Routes/placement.routes.js'
import placementStatisticsRouter from './Routes/placementStatistics.routes.js'
import questionRouter from './Routes/question.routes.js'
import alumniRouter from './Routes/alumni.routes.js'
import commentRouter from './Routes/comment.routes.js'
import companyReviewRouter from './Routes/companyReview.routes.js'
import resumeRouter from './Routes/resume.routes.js'
import hrQuestionRouter from './Routes/hrQuestion.routes.js'
import CSFundamentalsRouter from "./Routes/csFundamentals.routes.js"
import ApplicationStatusRouter from "./Routes/applicationStatus.routes.js"
import PastRecruiterRouter from "./Routes/pastRecruiter.routes.js"
import NotificationRouter from "./Routes/notifications.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/admins", adminRouter)
app.use("/api/v1/companies", upcominCompanyRouter)
app.use("/api/v1/placements", placementRouter)
app.use("/api/v1/placement-statistics", placementStatisticsRouter)
app.use("/api/v1/questions", questionRouter)
app.use("/api/v1/alumnis", alumniRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/company-review", companyReviewRouter)
app.use("/api/v1/resume", resumeRouter)
app.use("/api/v1/hr-questions", hrQuestionRouter)
app.use("/api/v1/cs-fundamentals", CSFundamentalsRouter)
app.use("/api/v1/application-status", ApplicationStatusRouter)
app.use("/api/v1/past-recruiter", PastRecruiterRouter)
app.use("/api/v1/notifications", NotificationRouter)

export { app }
