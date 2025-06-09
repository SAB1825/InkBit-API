import logger from "@/lib/winston";
import { Organization } from "@/models/v1/Authentication/organisation";
import { User } from "@/models/v1/Authentication/user";
import { NotFoundException, UsageExceededException, UserAlreadyExistsException } from "@/utils/app-error";
import { createSuperAdminDto } from "@/validations/dtos";


export const createUserService = async (data: createSuperAdminDto) => {
    const existingSuperAdmin = await User.findOne({
        email: data.email
    });

    if (existingSuperAdmin) {
        logger.error("User already exists with this email:", data.email);
        throw new UserAlreadyExistsException("User already exists with this email");
    }
    const organization = await Organization.findOne({
        _id: data.orgId
    })
    if(!organization){
        throw new NotFoundException("Organization not found with this ID");
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
        orgId : data.orgId,
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