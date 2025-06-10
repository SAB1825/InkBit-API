import  bcrypt from 'bcrypt';
import logger from "@/lib/winston";
import { Organization } from "@/models/v1/Authentication/organisation";
import { User } from "@/models/v1/Authentication/user";
import { InternalServerException, InvalidPasswordException, InvalidTokenException, NotFoundException, UsageExceededException, UserAlreadyExistsException, UserNotFoundException } from "@/utils/app-error";
import { createSuperAdminDto, LoginUserDto } from "@/validations/dtos";
import { Types } from "mongoose";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/jwt';
import { Token } from '@/models/v1/Authentication/token';
import { access } from 'fs';


export const createUserService = async (data: createSuperAdminDto, orgId : Types.ObjectId) => {
    const existingSuperAdmin = await User.findOne({
        orgId: orgId
    });

    if (existingSuperAdmin) {
        logger.error("User already exists with this email:", data.email);
        throw new UserAlreadyExistsException("User already exists with this email");
    }
    const organization = await Organization.findOne({
        _id:orgId
    })
    if(!organization){
        throw new NotFoundException("Organization not found with this ID");
    }
    let role = "";
    if(data.role === "admin") {
        role = "admin";
    }
    else {
        role = "user"
    }
    const user  = new User({
        orgId : orgId,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        bio :data.bio,
        email: data.email,
        password: data.password,
        role: role
    })

    if(organization.usage.currentUsers > organization.limits.users) {
        logger.error("User limit exceeded for this organization:", organization.orgName);
        throw new UsageExceededException("User limit exceeded for this organization");
    }
    organization.usage.currentUsers += 1;
    
    await user.save();
    await organization.save();
    

    return user;
}

export const loginUserService = async(data : LoginUserDto) => {
    try {
        console.log(data)
        const user = await User.findOne({
            $or: [{ email: data.email }, { username: data.username }],  
        }).select('+password');
        console.log("FROM DB",user)
        if (!user) {
            logger.error("User not found with this email or username:", data.email || data.username);
            throw new UserNotFoundException("User not found with this email or username");
        }
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        console.log(isPasswordValid)
        if (!isPasswordValid) {
            logger.error("Invalid password for user:", user.email);
            throw new InvalidPasswordException("Invalid password");
        }
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        const token = new Token({
            userId: user._id,
            token : refreshToken,
            type : "refresh_token",
            expiresAt : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        })
        await token.save();
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        logger.error("Error logging in user:", error);
        throw new InternalServerException("Error logging in user");
    }
}

export const refreshTokenService = async (token : string) => {
    try {
        console.log(token)
        const existingToken = await Token.findOne({
            token : token
        })
        console.log(existingToken)
        if(!existingToken) {
            logger.error("Token not found");
            throw new InvalidTokenException("Token not found in DB")
        }
        const decodedData = verifyRefreshToken(token);
        const accessToken = generateAccessToken(decodedData.userId)
        logger.info("Created accessToken")
        return accessToken;
        
    } catch (error) {
        logger.error("Error in creating the token", error);
        throw new InternalServerException("Error refreshing token");


    }
}