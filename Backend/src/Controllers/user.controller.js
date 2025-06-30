import ApiError from '../Utils/ApiError.js'
import ApiResponse from '../Utils/ApiResponse.js'
import { User } from '../Models/user.model.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import bcrypt from 'bcrypt'
import { uploadResumeOnAppwrite, getResumeFromAppwrite } from '../Utils/appwrite.js'
import { sendEmail } from '../Utils/NodeMailer.js'

const generateAccesandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, rollNo, password, mobileNo, branch, semester, CGPA, batch, course, pushToken } = req.body
    // console.log(name);
    

    if ([name, email, rollNo, password, mobileNo, branch, semester, CGPA, batch, course].some((field) => !field))
        throw new ApiError(400, "All fields are required")

    if (!email?.includes('@nitdelhi.ac.in'))
        throw new ApiError(400, "Only institute email address is allowed")

    if (rollNo.toString().trim().length !== 9)
        throw new ApiError(400, "Invalid Roll Number")

    if (password.trim().length < 5)
        throw new ApiError(400, "Password must contain 6 or more characters")

    if (email.trim().substring(0, 9) !== String(rollNo))
        throw new ApiError(400, "Email should contain roll no")


    const existedUser = await User.findOne({
        $or: [{ email, rollNo }]
    })

    if (existedUser)
        throw new ApiError(400, "User with same email or roll number already exists")

    const resumeLocalPath = req.files?.resume?.[0]?.path
    if (!resumeLocalPath)
        throw new ApiError(400, "Resume is required")

    const resume = await uploadResumeOnAppwrite(resumeLocalPath, req?.user?.name)
    if (!resume)
        throw new ApiError(500, "Something went wrong while uploading resume")

    const user = await User.create({
        name,
        email,
        rollNo,
        password,
        mobileNo,
        CGPA,
        semester,
        branch,
        resumeLink: resume.$id,
        batch,
        course,
        notificationPushToken: pushToken
    })    

    const { refreshToken, accessToken } = await generateAccesandRefreshToken(user._id)

    const createdUser = await User.findById(user._id).select(" -password -refreshToken")
    if (!createdUser)
        throw new ApiError(500, "Something went wrong while creating user")

    const message = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <!-- Header Section with Gradient -->
    <div style="background: linear-gradient(135deg, #4a90e2, #5f6caf); padding: 30px 20px; text-align: center;">
        <img src="https://img.icons8.com/color/96/000000/handshake.png" alt="Welcome Icon" style="background: white; padding: 15px; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <h1 style="color: white; margin: 20px 0 5px; font-weight: 600;">Welcome to Placement Plus!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">${createdUser.name}</p>
    </div>
    
    <!-- Content Section -->
    <div style="background-color: white; padding: 30px;">
        <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 20px;">
            We're <span style="font-weight: bold; color: #4a90e2;">thrilled to have you on board</span>! 🚀
        </p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #4a90e2; padding: 15px; margin: 25px 0;">
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin: 0;">
                Placement Plus is your one-stop solution for all things related to college placements. From company listings and eligibility to resume reviews and real-time stats, we've got you covered.
            </p>
        </div>
        
        <!-- Features Section -->
        <div style="display: flex; justify-content: space-between; margin: 30px 0; flex-wrap: wrap;">
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/000000/briefcase.png" alt="Companies">
                <p style="font-size: 14px; font-weight: bold; color: #555;">Company Listings</p>
            </div>
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/000000/document.png" alt="Resume">
                <p style="font-size: 14px; font-weight: bold; color: #555;">Resume Reviews</p>
            </div>
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/000000/group.png" alt="Alumni">
                <p style="font-size: 14px; font-weight: bold; color: #555;">Alumni Network</p>
            </div>
        </div>
        
        <p style="font-size: 16px; color: #444; line-height: 1.6;">
            Start exploring your dashboard, connect with alumni, and get one step closer to your dream job.
        </p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 35px 0 25px;">
            <a href="https://placementplus.app/dashboard" style="background: linear-gradient(to right, #4a90e2, #5f6caf); color: white; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 8px rgba(74,144,226,0.3); transition: all 0.3s;">Go to Dashboard →</a>
        </div>
    </div>
    
    <!-- Footer Section -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #777; margin-bottom: 15px;">
            If you have any questions, feel free to reply to this email or contact us at:
        </p>
        <p style="font-size: 16px; color: #4a90e2; font-weight: bold; margin-bottom: 20px;">
            support@placementplus.app
        </p>
        <div style="margin-top: 20px;">
            <a href="https://twitter.com/placementplus" style="text-decoration: none; margin: 0 10px;">
                <img src="https://img.icons8.com/color/24/000000/twitter.png" alt="Twitter">
            </a>
            <a href="https://linkedin.com/company/placementplus" style="text-decoration: none; margin: 0 10px;">
                <img src="https://img.icons8.com/color/24/000000/linkedin.png" alt="LinkedIn">
            </a>
            <a href="https://instagram.com/placementplus" style="text-decoration: none; margin: 0 10px;">
                <img src="https://img.icons8.com/color/24/000000/instagram-new.png" alt="Instagram">
            </a>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
            © 2025 Placement Plus. All rights reserved.
        </p>
    </div>
</div>`

    sendEmail(createdUser.email, "Ready to ace your placements? Welcome to Placement Plus!", message)

    return res.status(201).json(
        new ApiResponse(
            200,
            { createdUser, accessToken, refreshToken },
            "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email)
        throw new ApiError(400, "Email is Required")
    if (!password)
        throw new ApiError(400, "Password is Required")

    const user = await User.findOne({ email }).select(" -refreshToken")
    if (!user)
        throw new ApiError(400, "User does not exist")

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid)
        throw new ApiError(400, "Invalid Password")

    const { accessToken, refreshToken } = await generateAccesandRefreshToken(user._id)
    if (!accessToken || !refreshToken)
        throw new ApiError(500, "Something went wrong while generating tokens")

    const message = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <!-- Header Section with Gradient -->
    <div style="background: linear-gradient(135deg, #4a90e2, #5f6caf); padding: 30px 20px; text-align: center;">
        <img src="https://img.icons8.com/color/96/000000/handshake.png" alt="Welcome Icon" style="background: white; padding: 15px; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <h1 style="color: white; margin: 20px 0 5px; font-weight: 600;">Welcome to Placement Plus!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">${user.name}</p>
    </div>
    
    <!-- Content Section -->
    <div style="background-color: white; padding: 30px;">
        <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 20px;">
            We're <span style="font-weight: bold; color: #4a90e2;">thrilled to have you on board</span>! 🚀
        </p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #4a90e2; padding: 15px; margin: 25px 0;">
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin: 0;">
                Placement Plus is your one-stop solution for all things related to college placements. From company listings and eligibility to resume reviews and real-time stats, we've got you covered.
            </p>
        </div>
        
        <!-- Features Section -->
        <div style="display: flex; justify-content: space-between; margin: 30px 0; flex-wrap: wrap;">
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/000000/briefcase.png" alt="Companies">
                <p style="font-size: 14px; font-weight: bold; color: #555;">Company Listings</p>
            </div>
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/000000/document.png" alt="Resume">
                <p style="font-size: 14px; font-weight: bold; color: #555;">Resume Reviews</p>
            </div>
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/000000/group.png" alt="Alumni">
                <p style="font-size: 14px; font-weight: bold; color: #555;">Alumni Network</p>
            </div>
        </div>
        
        <p style="font-size: 16px; color: #444; line-height: 1.6;">
            Start exploring your dashboard, connect with alumni, and get one step closer to your dream job.
        </p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 35px 0 25px;">
            <a href="https://placementplus.app/dashboard" style="background: linear-gradient(to right, #4a90e2, #5f6caf); color: white; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 8px rgba(74,144,226,0.3); transition: all 0.3s;">Go to Dashboard →</a>
        </div>
    </div>
    
    <!-- Footer Section -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #777; margin-bottom: 15px;">
            If you have any questions, feel free to reply to this email or contact us at:
        </p>
        <p style="font-size: 16px; color: #4a90e2; font-weight: bold; margin-bottom: 20px;">
            support@placementplus.app
        </p>
        <div style="margin-top: 20px;">
            <a href="https://twitter.com/placementplus" style="text-decoration: none; margin: 0 10px;">
                <img src="https://img.icons8.com/color/24/000000/twitter.png" alt="Twitter">
            </a>
            <a href="https://linkedin.com/company/placementplus" style="text-decoration: none; margin: 0 10px;">
                <img src="https://img.icons8.com/color/24/000000/linkedin.png" alt="LinkedIn">
            </a>
            <a href="https://instagram.com/placementplus" style="text-decoration: none; margin: 0 10px;">
                <img src="https://img.icons8.com/color/24/000000/instagram-new.png" alt="Instagram">
            </a>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
            © 2025 Placement Plus. All rights reserved.
        </p>
    </div>
</div>`

    // await sendEmail(user.email, "Ready to ace your placements? Welcome to Placement Plus!", message)

    return res.status(200).json(
        new ApiResponse(
            200,
            { user, accessToken, refreshToken },
            "User logged in successfully")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    const loggedOutUser = await User.findByIdAndUpdate(req.user._id,
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
            "User logged out successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(" -password -refreshToken")
    if (!user)
        throw new ApiError(400, "User not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User found successfully"
        )
    )
})

const changePassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body

    const hashPassword = await bcrypt.hash(newPassword, 10)

    const user = await User.findByIdAndUpdate(req.user._id,
        { password: hashPassword },
        { new: true }
    ).select(" -password -refreshToken")
    if (!user)
        throw new ApiError(500, "Something went wrong while updating password")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Password changed successfully"
        )
    )

})

const uploadResume = asyncHandler(async (req, res) => {

    const resumeLocalPath = req.files?.resume?.[0]?.path || null
    if (!resumeLocalPath)
        throw new ApiError(400, "Resume is required")

    const resume = await uploadResumeOnAppwrite(resumeLocalPath, req?.user?.name, req?.user?.resumeLink)
    if (!resume)
        throw new ApiError(500, "Something went wrong while uploading resume")

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            resumeLink: resume.$id
        },
        { new: true }
    ).select(" -password -refreshToken")
    if (!user)
        throw new ApiError(500, "Something went wrong while updating resume")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Resume updated successfully"
        )
    )
})

const updateDeatils = asyncHandler(async (req, res) => {
    const { name, email, rollNo, mobileNo, branch, semester, CGPA } = req.body
    if (!name && !email && !rollNo && !mobileNo && !branch && !semester && !CGPA)
        throw new ApiError(400, "Data is required")

    const newDetails = {}
    if (name) newDetails.name = name
    if (email) newDetails.email = email
    if (mobileNo) newDetails.mobileNo = mobileNo
    if (rollNo) newDetails.rollNo = rollNo
    if (branch) newDetails.branch = branch
    if (semester) newDetails.semester = semester
    if (CGPA) newDetails.CGPA = CGPA

    const user = await User.findByIdAndUpdate(req.user._id,
        newDetails,
        { new: true }
    ).select(" -password -refreshToken")
    if (!user)
        throw new ApiError(500, "Something went wrong while updating details")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Details updated successfully"
        )
    )
})

const viewResume = asyncHandler(async (req, res) => {
    const resume = await getResumeFromAppwrite(req.user.resumeLink)
    if (!resume)
        throw new ApiError(500, "Something went wrong while fetching resume")

    return res.status(200).json(
        new ApiResponse(
            200,
            resume,
            "resume fetched successfully"
        )
    )
})

const sendOtpForReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const message = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <!-- Header Section -->
    <div style="background: linear-gradient(135deg, #4a90e2, #5f6caf); padding: 25px 20px; text-align: center; border-radius: 12px;">
        <img src="https://cdn-icons-png.flaticon.com/512/6195/6195696.png" alt="Password Reset" style="width: 90px; height: 90px; object-fit: contain;">        
        <h1 style="color: white; margin: 15px 0 5px; font-weight: 600; font-size: 24px;">Password Reset</h1>
        <p style="color: rgba(255, 255, 255, 0.85); margin: 0; font-size: 16px;">Placement Plus Security</p>
    </div>

    
    <!-- Content Section -->
    <div style="background-color: white; padding: 30px; text-align: center;">
        <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password. Use the OTP below to complete the process:
        </p>
        
        <!-- OTP Display - Styled prominently -->
        <div style="background-color: #f8f9fa; border: 1px dashed #ccc; border-radius: 8px; padding: 20px; margin: 20px 40px; text-align: center;">
            <p style="font-size: 14px; color: #777; margin: 0 0 10px;">Your One-Time Password</p>
            <h2 style="font-family: 'Courier New', monospace; letter-spacing: 5px; color: #4a90e2; margin: 0; font-size: 32px; font-weight: 700;">${otp}</h2>
        </div>
        
        <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 12px; margin: 25px 0; text-align: left;">
            <p style="font-size: 14px; color: #795548; line-height: 1.4; margin: 0;">
                <strong>Important:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone.
            </p>
        </div>
        
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
            If you didn't request a password reset, please ignore this email or contact our support team immediately.
        </p>
    </div>
    
    <!-- Footer Section -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #777; margin-bottom: 10px;">
            Need help? Contact us at:
        </p>
        <p style="font-size: 15px; color: #4a90e2; font-weight: bold; margin-bottom: 20px;">
            support@placementplus.app
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 15px;">
            © 2025 Placement Plus. All rights reserved.
        </p>
    </div>
</div>
    `;

    await sendEmail(user.email, "Your OTP for Password Reset", message);

    res.status(200).json(
        new ApiResponse(200, {}, "OTP sent to your email")
    );
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp)
        throw new ApiError(400, "Email and OTP are required")

    const user = await User.findOne({ email })

    if (!user.otpExpiry || user.otpExpiry < Date.now()
    ) {
        throw new ApiError(400, "Expired OTP");
    }

    const isOTPValid = await bcrypt.compare(otp, user.otp)
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save({ validateBeforeSave: false })

    if (!isOTPValid)
        throw new ApiError(401, "Invalid OTP")

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "OTP verified successfully"
        )
    )
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        throw new ApiError(400, "Email and password is required")

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.findOne({ email })
    if (!user)
        throw new ApiError(404, "User not found")

    const updatedUser = await User.findOneAndUpdate({ email }, { password: hashedPassword })
    if (!updatedUser)
        throw new ApiError(500, "Something went wrong whie changing password")

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    changePassword,
    uploadResume,
    updateDeatils,
    viewResume,
    sendOtpForReset,
    verifyOtp,
    resetPassword
}