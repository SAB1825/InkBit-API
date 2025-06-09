import logger from "@/lib/winston";
import { User } from "@/models/v1/Authentication/user";
import { UserAlreadyExistsException } from "@/utils/app-error";
import { createSuperAdminDto } from "@/validations/dtos";


export const createUserService = async (data: createSuperAdminDto) => {
    const existingSuperAdmin = await User.findOne({
        email: data.email
    });

    if (existingSuperAdmin) {
        logger.error("User already exists with this email:", data.email);
        throw new UserAlreadyExistsException("User already exists with this email");
    }
    let role = "";
    if(data.role === "super_admin") {
        role = "super_admin";
    }else if(data.role === "org_admin") {
        role = "org_admin";
    }
    else {
        role = "org_user"
    }
    const user  = new User({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        bio :data.bio,
        email: data.email,
        password: data.password,
        role: role
    })

    await user.save();

    return user;
}