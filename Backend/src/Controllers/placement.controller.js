import { Notifications } from "../Models/notifications.model.js";
import { PlacedStudent } from "../Models/placedStudent.model.js";
import { PlacementStatistics } from "../Models/placementStatistics.model.js";
import { User } from "../Models/user.model.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import mongoose from "mongoose";

const getSlab = (lpa) => {
    if (lpa <= 8)
        return 0;
    else if (lpa <= 12)
        return 1;
    else if (lpa <= 18)
        return 2;
    else if (lpa <= 25)
        return 3;
    else
        return 4;
}

const monthList = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December"
};

const addPlacedStudent = asyncHandler(async (req, res) => {
    const { studentId, companyName, role, ctc, stipend, jobLocation, branch, placementType } = req.body;
    if (!studentId || !companyName || !role || !jobLocation || !branch || !placementType || !(ctc || stipend))
        throw new ApiError(400, "All details are required");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const placedStudent = await PlacedStudent.create(
            [{ studentId, companyName, role, ctc, stipend, jobLocation, branch, placementType }],
            { session }
        );

        if (ctc) {
            let placementDetails = await PlacementStatistics.findOne({ branch }).session(session);
            const lpa = parseFloat(ctc.split(" ")[0]);

            const slab = getSlab(lpa)
            await User.findByIdAndUpdate(studentId,
                {
                    fullTimeEligible: false,
                    slab
                }, { session });


            if (placementDetails) {
                let updatedCtcValues = placementDetails.ctcValues || [];
                updatedCtcValues.push({ ctc: lpa, month: new Date().toISOString().slice(5, 7) });
                updatedCtcValues.sort((a, b) => a.ctc - b.ctc);


                const n = updatedCtcValues.length;
                const medianPackage =
                    n % 2 === 1
                        ? updatedCtcValues[Math.floor(n / 2)].ctc
                        : (updatedCtcValues[n / 2 - 1].ctc + updatedCtcValues[n / 2].ctc) / 2;

                const newAvgPackage =
                    ((placementDetails.avgPackage * placementDetails.placedStudents) + lpa) /
                    (placementDetails.placedStudents + 1);


                await PlacementStatistics.findOneAndUpdate(
                    { branch },
                    {
                        $inc: { placedStudents: 1 },
                        $set: {
                            avgPackage: newAvgPackage,
                            maxPackage: Math.max(placementDetails.maxPackage, lpa),
                            medianPackage,
                            ctcValues: updatedCtcValues
                        }
                    },
                    { session, new: true }
                );
            } else {
                await PlacementStatistics.create(
                    [{
                        branch,
                        avgPackage: lpa,
                        medianPackage: lpa,
                        maxPackage: lpa,
                        totalStudents: 60,
                        placedStudents: 1,
                        ctcValues: [{ ctc: lpa, month: new Date().toISOString().slice(5, 7) }]
                    }],
                    { session }
                );
            }
        } else if (stipend || placementType === "Internship + Full Time") {
            await User.findByIdAndUpdate(studentId,
                {
                    internshipEligible: false
                },
                { session }
            )
        }

        const newNotification = await Notifications.create({
            type: 'placement_stats',
            content: 'Placement statistics have been updated! Explore the latest data on average, median, and highest packages across all branches.',
            createdAt: Date.now()
        })

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(new ApiResponse(200, placedStudent[0], "Student added successfully"));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, error.message || "Something went wrong while adding new student");
    }
});

const getStudentPlacement = asyncHandler(async (req, res) => {
    const { studentId } = req.params
    if (!studentId)
        throw new ApiError(400, "Student id is required")

    const placementDetails = await PlacedStudent.findOne({ studentId })
    if (!placementDetails)
        throw new ApiError(404, "Student not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            placementDetails,
            "Student placement details fetched successfully"
        )
    )
})

const getAllPlacedStudents = asyncHandler(async (req, res) => {

    const placementDetails = await PlacedStudent.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "studentId",
                foreignField: "_id",
                as: "studentData"
            }
        },
        {
            $unwind: {
                path: "$studentData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                role: 1,
                branch: 1,
                stipend: 1,
                jobLocation: 1,
                placementType: 1,
                companyName: 1,
                ctc: 1,
                updatedAt: 1,
                createdAt: 1,
                "studentData.name": 1,
                "studentData.branch": 1,
                "studentData.semester": 1,
                "studentData.rollNo": 1
            }
        }
    ])
    if (!placementDetails)
        throw new ApiError(404, "Student Placement details not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            placementDetails,
            "Student placement details fetched successfully"
        )
    )
})

const getCompanyPlacements = asyncHandler(async (req, res) => {
    const { companyName } = req.params
    if (!companyName)
        throw new ApiError(400, "Company name is required")

    const placementDetails = await PlacedStudent.find({ companyName })
    if (placementDetails.length === 0)
        throw new ApiError(404, "Company not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            placementDetails,
            "Company placement details fetched successfully"
        )
    )
})

const getRolePlacements = asyncHandler(async (req, res) => {
    const { role } = req.params
    if (!role)
        throw new ApiError(400, "Role is required")

    const placementDetails = await PlacedStudent.find({ role })
    if (placementDetails.length === 0)
        throw new ApiError(404, "Role not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            placementDetails,
            "Role specific placement details fetched successfully"
        )
    )
})

const getBranchPlacements = asyncHandler(async (req, res) => {
    const { branch } = req.params
    if (!branch)
        throw new ApiError(400, "Branch name is required")

    const placementDetails = await PlacedStudent.find({ branch })
    if (placementDetails.length === 0)
        throw new ApiError(404, "Branch not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            placementDetails,
            "Branch specific placement details fetched successfully"
        )
    )
})

const deletePlacedStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params
    if (!studentId)
        throw new ApiError(400, "Student id is required")

    const deletedStudent = await PlacedStudent.findOneAndDelete({ studentId })
    if (!deletedStudent)
        throw new ApiError(404, "Student not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedStudent,
            "Student record deleted successfully"
        )
    )
})

export {
    addPlacedStudent,
    getAllPlacedStudents,
    getStudentPlacement,
    getBranchPlacements,
    getRolePlacements,
    getCompanyPlacements,
    deletePlacedStudent
}