import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import { CSFundamentals } from "../Models/csFundamentals.model.js";
import { uploadFileOnAppwrite, getFileFromAppwrite } from "../Utils/appwrite.js";

const addPdf = asyncHandler(async (req, res) => {
    const { subjectName, description, fileName } = req.body
    if (!subjectName || !fileName)
        throw new ApiError(400, "Subject name and file name is required")

    const pdfLocalPath = req.files?.pdf[0]?.path
    if (!pdfLocalPath)
        throw new ApiError(400, "Pdf is required")

    const uploadedPdf = await uploadFileOnAppwrite(pdfLocalPath)
    if (!uploadedPdf)
        throw new ApiError(500, "Something went wrong while uploading resume")

    const newMaterial = await CSFundamentals.create({
        subjectName,
        description,
        pdfLink: uploadedPdf.$id,
        fileName
    })

    const addedMaterial = await CSFundamentals.findById(newMaterial._id)
    if (!addedMaterial)
        throw new ApiError(500, "Something went wrong while adding study material")

    return res.status(200).json(
        new ApiResponse(
            200,
            addedMaterial,
            "Material added successfully"
        )
    )
})

const getPdf = asyncHandler(async (req, res) => {
    const { fileId } = req.params
    if (!fileId)
        throw new ApiError(400, "File Id is required")

    const pdf = await getFileFromAppwrite(fileId)
    if (!pdf)
        throw new ApiError(500, "Something went wrong while fetching study material")

    return res.status(200).json(
        new ApiResponse(
            200,
            pdf,
            "study material successfully"
        )
    )
})

const getAllPdf = asyncHandler(async (req, res) => {
    const allPdfs = await CSFundamentals.find()
    if (allPdfs.length === 0)
        throw new ApiError(404, "No Study material found")

    return res.status(200).json(
        new ApiResponse(
            200,
            allPdfs,
            "All study materials fetch successfully"
        )
    )
})

export { addPdf, getPdf, getAllPdf }