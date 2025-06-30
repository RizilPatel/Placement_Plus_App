import { Alumni } from "../Models/alumni.model.js";
import ApiError from '../Utils/ApiError.js'
import ApiResponse from '../Utils/ApiResponse.js'
import { uploadImageonAppwrite } from "../Utils/appwrite.js";
import asyncHandler from '../Utils/AsyncHandler.js'

const generateAccesandRefreshToken = async (alumniId) => {
    try {
        const alumni = await Alumni.findById(alumniId)
        if (!alumni)
            throw new ApiError(404, "Alumni not found")

        const accessToken = await alumni.generateAccessToken()
        const refreshToken = await alumni.generateRefreshToken()

        alumni.refreshToken = refreshToken
        await alumni.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens" + error)
    }
}

const registerAlumni = asyncHandler(async (req, res) => {
    const { name, email, password, linkedInId, previousCompany, currentCompany, batch } = req.body;

    if (!name || !email || !password || !linkedInId || !currentCompany || !batch)
        throw new ApiError(400, "All details are required");

    const paresdCurrentCompany = JSON.parse(currentCompany) || {}
    const parsedPreviousCompany = JSON.parse(previousCompany) || []

    console.log(parsedPreviousCompany);    

    if (!paresdCurrentCompany || !paresdCurrentCompany.name || !paresdCurrentCompany.position)
        throw new ApiError(400, "Current company details are required");

    const existedAlumni = await Alumni.findOne({ email }).select("-password -refreshToken")
    if (existedAlumni)
        throw new ApiError(400, "Alumni with same email already exists");

    const profilePicLocalPath = req.files?.profilePic[0]?.path
    // console.log("Files:", req.files);
    if (!profilePicLocalPath)
        throw new ApiError(400, "Profile pic is required")
    // console.log(profilePicLocalPath);


    const profilePic = await uploadImageonAppwrite(profilePicLocalPath, `${name}.png`)
    if (!profilePic)
        throw new ApiError(500, "Something went wrong while uploading profile pic")


    const alumni = await Alumni.create([{
        name,
        email,
        password,
        linkedInId,
        currentCompany: paresdCurrentCompany,
        previousCompany: parsedPreviousCompany,
        batch,
        profilePicId: profilePic.$id
    }]);
    if (!alumni)
        throw new ApiError(500, "Failed to create alumni. Please try again later");

    const { accessToken, refreshToken } = await generateAccesandRefreshToken(alumni[0]._id);
    if (!accessToken || !refreshToken)
        throw new ApiError(500, "Something went wrong while generating tokens");

    const newAlumni = await Alumni.findById(alumni[0]._id).select("-password -refreshToken")
    if (!newAlumni)
        throw new ApiError(500, "Something went wrong while creating new alumni");

    return res.status(200).json(
        new ApiResponse(
            200,
            { newAlumni, refreshToken, accessToken },
            "Alumni registered successfully"
        )
    )
});

const loginAlumni = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        throw new ApiError(400, "Email and password is required")

    const alumni = await Alumni.findOne({ email })
    if (!alumni)
        throw new ApiError(400, "Alumni not found")    

    const isPasswordValid = await alumni.isPasswordCorrect(password)
    if (!isPasswordValid)
        throw new ApiError(400, "Password is incorrect")

    const { accessToken, refreshToken } = await generateAccesandRefreshToken(alumni._id)
    if (!accessToken || !refreshToken)
        throw new ApiError(500, "Something went wrong while generating tokens")

    return res.status(200).json(
        new ApiResponse(
            200,
            { alumni, refreshToken, accessToken },
            "Logged in successfully"
        )
    )
})

const logoutAlumni = asyncHandler(async (req, res) => {
    const alumniId = req.alumni._id

    const alumni = await Alumni.findByIdAndUpdate(alumniId,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Alumni logged out successfully"
        )
    )

})

const addPreviousCompany = asyncHandler(async (req, res) => {
    const { previousCompanyDetails } = req.body;

    const alumni = await Alumni.findById(req.alumni._id);
    if (!alumni)
        throw new ApiError(404, "Alumni not found");

    alumni.previousCompany.unshift(previousCompanyDetails);
    await alumni.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Previous company details added successfully"
        )
    );
});

const changeCurrentCompanyDetails = asyncHandler(async (req, res) => {
    const { companyName, companyPosition } = req.body
    if (!companyName || !companyPosition)
        throw new ApiError(400, "Company name and position is required")

    const alumni = await Alumni.findById(req.alumni._id)
    if (!alumni)
        throw new ApiError(404, "Alumni does not exist")

    alumni.currentCompany.name = companyName
    alumni.currentCompany.position = companyPosition

    await alumni.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Company details updated successfully"
        )
    )
})

const getAllAlumniDetails = asyncHandler(async (req, res) => {
    const alumni = await Alumni.find().select(" -password -refreshToken")

    return res.status(200).json(
        new ApiResponse(
            200,
            alumni,
            "Alumni details fetched succesfully"
        )
    )
})

const getAlumniById = asyncHandler(async (req, res) => {
    const { alumniId } = req.params
    if (!alumniId)
        throw new ApiError(400, "Alumni id is required")

    const alumni = await Alumni.findById(alumniId).select("-password -refreshToken")
    if (!alumni)
        throw new ApiError(404, "Alumni not found")
    
    return res.status(200).json(
        new ApiResponse(
            200,
            alumni,
            "Alumni details fetched successfully"
        )
    )
})

export {
    registerAlumni,
    loginAlumni,
    logoutAlumni,
    addPreviousCompany,
    changeCurrentCompanyDetails,
    getAllAlumniDetails,
    getAlumniById
}