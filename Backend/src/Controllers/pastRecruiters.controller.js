import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import { PastRecruiters } from "../Models/pastRecruiters.model.js";

const addPastRecruiter = asyncHandler(async (req, res) => {
    const { name, eligibleBranches, roles, recruitedStudents } = req.body;

    // console.log(name);
    // console.log(eligibleBranches);
    // console.log(roles);
    // console.log(recruitedStudents);

    if (!name || !eligibleBranches || eligibleBranches?.length === 0 || !roles || roles?.length === 0 || !recruitedStudents)
        throw new ApiError(400, "All details are required");

    roles.forEach(role => {
        if (!role.roleName || !role.opportunityType || !role.year)
            throw new ApiError(401, "All role details are required");

        if (role.opportunityType === "Full Time" && !role.CTC)
            throw new ApiError(401, "CTC is required");

        if (role.opportunityType === "Internship" && !role.stipend)
            throw new ApiError(401, "Stipend is required");

        if (role.opportunityType === "Internship + Full Time" && (!role.CTC || !role.stipend))
            throw new ApiError(401, "CTC and stipend are required");
    });

    const existedRecruiter = await PastRecruiters.findOne({ companyName: name });

    if (existedRecruiter) {
        const updatedBranches = Array.from(new Set([...existedRecruiter.eligibleBranches, ...eligibleBranches]));

        const updatedRoles = [...existedRecruiter.roles];
        roles.forEach(newRole => {
            const duplicate = updatedRoles.find(existingRole =>
                existingRole.roleName === newRole.roleName &&
                existingRole.opportunityType === newRole.opportunityType &&
                existingRole.year === newRole.year &&
                (existingRole.stipend || "") === (newRole.stipend || "") &&
                (existingRole.CTC || "") === (newRole.CTC || "")
            );

            if (!duplicate) {
                updatedRoles.push(newRole);
            }
        });

        const updatedRecruitedStudents = existedRecruiter.recruitedStudents + recruitedStudents

        existedRecruiter.eligibleBranches = updatedBranches;
        existedRecruiter.roles = updatedRoles;
        existedRecruiter.recruitedStudents = updatedRecruitedStudents

        await existedRecruiter.save();

        return res.status(200).json(
            new ApiResponse(200, existedRecruiter, "Past recruiter updated successfully")
        );
    }

    const newRecruiter = await PastRecruiters.create({
        companyName: name,
        eligibleBranches,
        roles,
        recruitedStudents
    });

    return res.status(200).json(
        new ApiResponse(200, newRecruiter, "Past recruiter added successfully")
    );
});

const getAllRecruiter = asyncHandler(async (req, res) => {
    const recruiters = await PastRecruiters.find()

    return res.status(200).json(
        new ApiResponse(
            200,
            recruiters,
            "Recruiters fetched successfully"
        )
    )
})

const getRecruiterById = asyncHandler(async (req, res) => {
    const { companyId } = req.params
    if (!companyId)
        throw new ApiError(400, "Company ID is required")

    const recruiter = await PastRecruiters.findById(companyId)
    if (!recruiter)
        throw new ApiError(404, "Recruiter not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            recruiter,
            "Recruiter fetched successfully"
        )
    )
})

export {
    addPastRecruiter,
    getAllRecruiter,
    getRecruiterById
}
