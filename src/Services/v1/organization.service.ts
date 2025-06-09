import { Type } from "class-transformer";
import logger from "@/lib/winston";
import { ApiKey } from "@/models/v1/Authentication/api";
import { Organization } from "@/models/v1/Authentication/organisation";
import {
    InternalServerException,
  NotFoundException,
  OrganizationAlreadyExistsException,
} from "@/utils/app-error";
import { generateApiKey, generateAPIkeyId } from "@/utils/generate-api-key";
import { CreateOrganizationDto } from "@/validations/dtos";
import { Types } from "mongoose";
import { User } from "@/models/v1/Authentication/user";

export const createOrganizationService = async (
  data: CreateOrganizationDto
) => {
  const { orgName, orgSlug, orgDomain, plan } = data;

  const existingOrg = await Organization.findOne({
    $or: [{ orgSlug: orgSlug }, { orgDomain: orgDomain }],
  });
  if (existingOrg) {
    logger.error(
      "Organization already exists with this slug or domain:",
      orgSlug,
      orgDomain
    );
    throw new OrganizationAlreadyExistsException(
      "Organization already exists with this slug or domain"
    );
  }

  const newOrganization = new Organization({
    orgName,
    orgSlug,
    orgDomain,
    plan,
  });

  const newOrg = await newOrganization.save();

  const apiKey = generateApiKey();

  const api = await ApiKey.findOne({
    orgId: newOrg._id,
  });
  if (api) {
    logger.error(
      "API Key already exists for this organization:",
      newOrg.orgName
    );
    throw new OrganizationAlreadyExistsException(
      "API Key already exists for this organization"
    );
  }
  const keyId = generateAPIkeyId();

  const newApiKey = new ApiKey({
    orgId: newOrg._id,
    key: apiKey,
    keyId: keyId,
    type: "test",
    isActive: true,
    permissions: ["posts.read", "posts.write", "users.read", "users.write"],
  });

  await newApiKey.save();

  return {
    organization: newOrg,
    apiKey: newApiKey,
  };
};

export const getOrganizationService = async (id: Types.ObjectId) => {
  const organization = await Organization.findById(id);
  if (!organization) {
    logger.error("Organization not found with ID:", id);
    throw new NotFoundException("Organization not found");
  }

  return organization;
};

export const updateOrganizationService = async (
  data: CreateOrganizationDto,
  id: Types.ObjectId
) => {
  const { orgName, orgSlug, orgDomain, plan } = data;

  const organization = await Organization.findById(id);
  if (!organization) {
    logger.error("Organization not found with ID:", id);
    throw new NotFoundException("Organization not found");
  }

  organization.orgName = orgName || organization.orgName;
  organization.orgSlug = orgSlug || organization.orgSlug;
  organization.orgDomain = orgDomain || organization.orgDomain;

  const updatedOrganization = await organization.save();
  logger.info(
    "Organization updated successfully:",
    updatedOrganization.orgName
  );
  return updatedOrganization;
};
export const deleteOrganizationService = async (id: Types.ObjectId) => {
  try {
    const org = await Organization.findByIdAndDelete(id);

    if (!org) {
      logger.error("Organization not found with ID:", id);
      throw new NotFoundException("Organization not found");
    }
    const users = await User.deleteMany({ orgId: id });
    const apiKey = await ApiKey.deleteMany({ orgId: id });

    logger.info("Organization deleted successfully:", org.orgName);
  } catch (error) {
    logger.error("Error deleting organization:", error);
    throw new InternalServerException("Error deleting organization");}
};
