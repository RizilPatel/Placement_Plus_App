import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import ApiError from "../Utils/ApiError.js";
import axios from "axios"
import FormData from "form-data"
import fs from "fs"
import natural from "natural"
import cosineSimilarity from "cosine-similarity";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);

const parseResume = asyncHandler(async (req, res) => {
    const resumeLocalPath = req.files?.resume[0]?.path;
    if (!resumeLocalPath) throw new ApiError(400, "Resume is required");

    const form = new FormData();
    form.append("document", fs.createReadStream(resumeLocalPath));

    try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(resumeLocalPath));

        const response = await axios.post(
            "https://api.apilayer.com/resume_parser/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "apikey": process.env.APILAYER_API_KEY,
                },
            }
        );


        console.log("Parsed data: ", response);

        return res.status(200).json(
            new ApiResponse(
                200,
                response,
                "Resume parsed successfully"
            )
        );
    } catch (error) {
        console.error("Parsing Error:", error);

        throw new ApiError(500, "Error parsing resume");
    } finally {
        fs.unlinkSync(resumeLocalPath);
    }
});

const jobSkills = ["JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Python", "GitHub"];
const degreeLevels = { "Masters": 15, "Bachelors": 12, };
const certificationWeight = 5;
const projectWeight = 10;

const tokenizer = new natural.WordTokenizer();

const calculateSkillScore = (resumeSkills) => {
    if (!resumeSkills || resumeSkills.length === 0) return 0;

    const jobVector = jobSkills.map(skill => (resumeSkills.includes(skill) ? 1 : 0));
    const resumeVector = resumeSkills.map(skill => (jobSkills.includes(skill) ? 1 : 0));

    return Math.round(cosineSimilarity(jobVector, resumeVector) * 30);
};

const calculateExperienceScore = (experience) => {
    if (!experience || experience.length === 0) return 0;

    let totalYears = experience.reduce((sum, job) => sum + (job.years || 0), 0);
    return Math.min(totalYears * 5, 25);
};

const calculateEducationScore = (education) => {
    if (!education || education.length === 0) return 0;

    let highestDegree = 0;
    education.forEach(edu => {
        if (degreeLevels[edu.degree]) {
            highestDegree = Math.max(highestDegree, degreeLevels[edu.degree]);
        }
    });

    return highestDegree;
};

const calculateCertificationScore = (certifications) => {
    return Math.min(certifications?.length * certificationWeight, 10);
};

const calculateProjectScore = (projects) => {
    return projects.length > 0 ? projectWeight : 0;
};

const calculateReadabilityScore = (summary) => {
    if (!summary || summary.length < 50) return 0;

    const words = tokenizer.tokenize(summary);
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    return averageWordLength > 4 ? 10 : 5;
};

const calculateResumeScore = (resumeData) => {
    return {
        skillScore: calculateSkillScore(resumeData.skills),
        experienceScore: calculateExperienceScore(resumeData.experience),
        educationScore: calculateEducationScore(resumeData.education),
        certificationScore: calculateCertificationScore(resumeData.certifications),
        projectScore: calculateProjectScore(resumeData.projects),
        readabilityScore: calculateReadabilityScore(resumeData.summary),
    };
};

const getFinalResumeScore = asyncHandler((req, res) => {
    const resumeData = req.body
    if (!resumeData)
        throw new ApiError(400, "Resume data is required")

    const scores = calculateResumeScore(resumeData);
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...scores,
                totalScore: Object.values(scores).reduce((sum, score) => sum + score, 0),
            },
            "Resume score calculated successfully"
        )
    )
});

const getResumeSuggestion = asyncHandler(async (req, res) => {
    const { resume } = req.body;
    if (!resume) throw new ApiError(400, "Resume data is required");

    const prompt = `Analyze the given resume and suggest improvements. Provide actionable advice for each section (Skills, Experience, Education, Projects, Summary, Achievements). Keep it concise but impactful.

    Resume Data: ${JSON.stringify(resume)}
    
    Output format:
    {
        "resume_score": (score out of 100),
        "suggestions": {
            "skills": "Suggested skill improvements...",
            "experience": "Suggested experience improvements...",
            "projects": "Suggested project improvements...",
            "summary": "Suggested summary improvements...",
            "achievements": "Suggested achievement improvements..."
        }
    }`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });

        const responseText = response?.response?.candidates[0]?.content?.parts[0]?.text;
        if (!responseText) throw new ApiError(500, "Invalid response from Gemini AI");

        const simplifiedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        console.log("Suggestions: ", simplifiedResponse);

        const suggestions = JSON.parse(simplifiedResponse);

        return res.status(200).json(
            new ApiResponse(200, suggestions, "Suggestions fetched successfully")
        );
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw new ApiError(500, "Something went wrong while fetching suggestions" || error);
    }
});

export { parseResume, getFinalResumeScore, getResumeSuggestion };
