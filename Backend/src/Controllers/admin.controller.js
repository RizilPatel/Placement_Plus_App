import { Admin } from "../Models/admin.model.js";
import { PlacementStatistics } from "../Models/placementStatistics.model.js"
import { UpcomingCompany } from '../Models/upcomingCompany.model.js'
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import mongoose from "mongoose";
import bcrypt from "bcrypt"


const generateAccessandRefreshToken = async (adminId) => {
    const admin = await Admin.findById(adminId)

    const accessToken = await admin.generateAccessToken()
    const refreshToken = await admin.generateRefreshToken()

    admin.refreshToken = refreshToken
    await admin.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}

const registerAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    if (!username || !password)
        throw new ApiError(400, "Username and password is required")

    if (password.length < 6)
        throw new ApiError(400, "Password length should be greater than 6")

    const existingAdmin = await Admin.find({ username })
    if (existingAdmin.length > 0)
        throw new ApiError(400, "Admin with same username already exists")

    const newAdmin = await Admin.create({
        username,
        password
    })

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(newAdmin._id)

    const createdAdmin = await Admin.findById(newAdmin._id).select("-password -refreshToken")
    if (!createdAdmin)
        throw new ApiError(500, "Something went wrong while creating admin")

    return res.status(200).json(
        new ApiResponse(
            200,
            { admin: createdAdmin, accessToken, refreshToken },
            "Admin registered successfully"
        )
    )
})

const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    if (!username || !password)
        throw new ApiError(400, "Username and password is required")

    const admin = await Admin.findOne({ username }).select(" -refreshToken")
    if (!admin)
        throw new ApiError(400, "Admin not found")

    const isPasswordValid = await admin.isPasswordCorrect(password)
    if (!isPasswordValid)
        throw new ApiError(400, "Invalid password")

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(admin._id)
    if (!accessToken || !refreshToken)
        throw new ApiError(500, "Something went wrong while generating tokens")

    return res.status(200).json(
        new ApiResponse(
            200,
            { admin, refreshToken, accessToken },
            "Logged in successfully"
        )
    )
})

const logoutAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.findByIdAndUpdate(req.admin._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Logged out successfully"
        )
    )

})

const __dirname = dirname(fileURLToPath(import.meta.url));

const exportToPDF = asyncHandler(async (req, res) => {
    const data = await PlacementStatistics.find();

    if (!data || data.length === 0) {
        return res.status(404).json(
            new ApiResponse(
                404,
                {},
                "No Placement Statistics found"
            )
        );
    }

    const doc = new PDFDocument({ margin: 50, size: "A4", layout: "portrait" });
    const filePath = path.join(__dirname, `placement_stats_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Title
    doc.fontSize(16).text("Placement Statistics Report", { align: "center", underline: true });
    doc.moveDown(2);

    const pageWidth = doc.page.width - 100; // Adjusted for margins
    const pageHeight = doc.page.height - 50; // Adjusted for footer
    const columnCount = 4;
    const columnWidth = pageWidth / columnCount;
    const rowHeight = 25;
    const headerHeight = 40;

    data.forEach((item, index) => {
        // Page break if required
        if (doc.y + 100 > pageHeight) {
            doc.addPage();
        }

        // Ensure spacing before each new branch
        if (index !== 0) doc.moveDown(3);

        // Centered Branch Name - Bold, Larger Font, Underlined
        doc
            .font("Helvetica-Bold")
            .fontSize(18)
            .fillColor("#1F4E79") // Dark Blue
            .text(`Branch: ${item.branch}`, { align: "center", underline: true, continued: false });

        doc.moveDown(1);

        // Table Header
        let tableTop = doc.y; // Defined before use
        doc
            .rect(50, tableTop, pageWidth, headerHeight)
            .fill("#1F4E79") // Dark Blue Background
            .stroke();

        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor("#FFFFFF");

        const textY = tableTop + (headerHeight / 2) - 5;

        doc
            .text("Placed Students", 50 + 10, textY, { width: columnWidth, align: "center" })
            .text("Avg Package (LPA)", 50 + columnWidth + 10, textY, { width: columnWidth, align: "center" })
            .text("Median Package (LPA)", 50 + 2 * columnWidth + 10, textY, { width: columnWidth, align: "center" })
            .text("Highest Package (LPA)", 50 + 3 * columnWidth + 10, textY, { width: columnWidth, align: "center" });

        doc.moveDown(1);

        // Table Row
        let rowTop = doc.y;
        doc
            .rect(50, rowTop, pageWidth, rowHeight)
            .fill("#F2F2F2") // Light Grey Background
            .stroke();

        doc
            .font("Helvetica")
            .fontSize(12)
            .fillColor("#000000")
            .text(`${item.placedStudents}`, 50 + 10, rowTop + 7, { width: columnWidth, align: "center" })
            .text(`${parseFloat(item?.avgPackage).toFixed(2) || '-'}`, 50 + columnWidth + 10, rowTop + 7, { width: columnWidth, align: "center" })
            .text(`${parseFloat(item?.medianPackage).toFixed(2) || '-'}`, 50 + 2 * columnWidth + 10, rowTop + 7, { width: columnWidth, align: "center" })
            .text(`${parseFloat(item?.maxPackage).toFixed(2) || '-'}`, 50 + 3 * columnWidth + 10, rowTop + 7, { width: columnWidth, align: "center" });

        doc.moveDown(3);
    });

    doc.end();

    writeStream.on("finish", () => {
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ message: "Error downloading the file" });
            }
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
        });
    });

    writeStream.on("error", (err) => {
        console.error("Error writing file:", err);
        res.status(500).json({ message: "Error generating PDF" });
    });
});

const exportToExcel = asyncHandler(async (req, res, next) => {
    try {
        const data = await PlacementStatistics.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Placement Statistics");

        worksheet.columns = [
            { header: "Branch", key: "branch", width: 15 },
            { header: "Placed Students", key: "placedStudents", width: 20 },
            { header: "Average Package", key: "avgPackage", width: 20 },
            { header: "Median Package", key: "medianPackage", width: 20 },
            { header: "Max Package", key: "maxPackage", width: 20 },
            { header: "Total Students", key: "totalStudents", width: 15 }
        ];

        data.forEach((item) => worksheet.addRow(item));

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=placement_stats_${Date.now()}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
});

const exportStudentDatatoExcel = asyncHandler(async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const objectId = new mongoose.Types.ObjectId(companyId);

        const studentsData = await UpcomingCompany.aggregate([
            {
                $match: { _id: objectId },
            },
            {
                $unwind: {
                    path: "$appliedStudents",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "appliedStudents.studentId",
                    foreignField: "_id",
                    as: "StudentDetails",
                },
            },
            {
                $unwind: {
                    path: "$StudentDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    name: "$StudentDetails.name",
                    email: "$StudentDetails.email",
                    mobileNo: "$StudentDetails.mobileNo",
                    course: "$StudentDetails.course",
                    branch: "$StudentDetails.branch",
                    CGPA: "$StudentDetails.CGPA",
                    rollNo: "$StudentDetails.rollNo",
                    semester: "$StudentDetails.semester",
                    batch: "$StudentDetails.batch",
                },
            },
        ]);

        if (studentsData.length === 0) {
            return res.status(404).json(
                new ApiResponse(
                    404,
                    {},
                    "No students data found"
                )
            )
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Students");

        worksheet.columns = [
            { header: "Name", key: "name", width: 20 },
            { header: "Email", key: "email", width: 25 },
            { header: "Mobile No", key: "mobileNo", width: 15 },
            { header: "Course", key: "course", width: 15 },
            { header: "Branch", key: "branch", width: 15 },
            { header: "CGPA", key: "CGPA", width: 10 },
            { header: "Roll No", key: "rollNo", width: 15 },
            { header: "Semester", key: "semester", width: 10 },
            { header: "Batch", key: "batch", width: 10 },
        ];

        studentsData.forEach((student) => {
            worksheet.addRow(student);
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=students_data.xlsx");

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error)
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body

    const hashPassword = await bcrypt.hash(newPassword, 10)

    const admin = await Admin.findByIdAndUpdate(req.admin._id,
        { password: hashPassword },
        { new: true }
    ).select(" -password -refreshToken")
    if (!admin)
        throw new ApiError(500, "Something went wrong while updating password")

    return res.status(200).json(
        new ApiResponse(
            200,
            admin,
            "Password changed successfully"
        )
    )

})


export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    exportToPDF,
    exportToExcel,
    exportStudentDatatoExcel,
    changePassword
}