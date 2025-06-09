import logger from '@/lib/winston';
import { ApiKey } from '@/models/v1/Authentication/api';
import { Organization } from '@/models/v1/Authentication/organisation';
import { NotFoundException, OrganizationAlreadyExistsException } from '@/utils/app-error';
import { generateApiKey, generateAPIkeyId } from '@/utils/generate-api-key';
import { CreateOrganizationDto } from '@/validations/dtos';


export const createOrganizationService = async (data : CreateOrganizationDto) => {
    const { orgName, orgSlug, orgDomain, plan } = data;

    const existingOrg = await Organization.findOne({
        $or: [
            { orgSlug: orgSlug },
            { orgDomain: orgDomain }
        ]
    })
    if( existingOrg ) {
        logger.error("Organization already exists with this slug or domain:", orgSlug, orgDomain);
        throw new OrganizationAlreadyExistsException("Organization already exists with this slug or domain");
    }

    const newOrganization = new Organization({
        orgName,
        orgSlug,
        orgDomain,
        plan
    });

    const newOrg = await newOrganization.save();

    const apiKey = generateApiKey();

    const api = await ApiKey.findOne({
        orgId: newOrg._id
    })
    if( api ) {
        logger.error("API Key already exists for this organization:", newOrg.orgName);
        throw new OrganizationAlreadyExistsException("API Key already exists for this organization");
    }
    const keyId = generateAPIkeyId();

    const newApiKey = new ApiKey({
        orgId: newOrg._id,
        key: apiKey,
        keyId: keyId,
        type: "test",
        isActive: true,
        permissions: [
            "posts.read",
            "posts.write",
            "users.read",
            "users.write"
        ]
    });

    await newApiKey.save();

    return {
        organization: newOrg,
        apiKey: newApiKey
    };
}

export const getOrganizationService = async (id : string) => {

    const organization = await Organization.findById(id);
    if (!organization) {
        logger.error("Organization not found with ID:", id);
        throw new NotFoundException("Organization not found");
    }

    return organization;
}