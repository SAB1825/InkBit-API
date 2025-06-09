import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler, asyncHandlerAndValidation } from "@/middlewares/async-handler";
import { createOrganizationService, deleteOrganizationService, getOrganizationService, updateOrganizationService } from "@/Services/v1/organization.service";
import { CreateOrganizationDto, updateOrganizationDto } from "@/validations/dtos";
import {  Request, Response } from "express";

export const createOrganization = asyncHandlerAndValidation(
  CreateOrganizationDto,
  "body",
  async (req: Request, res: Response, data) => {
    const { organization, apiKey } = await createOrganizationService(data);
    res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Organization created successfully with API Key",
      data: {
        organization,
        apiKey,
      },
    });
  }
);


export const getOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.orgId;
    
    const organization = await getOrganizationService(id!);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Organization retrieved successfully",
      data: {
        organization,
      },
    });
  }
);


export const updateOrganization = asyncHandlerAndValidation(
  updateOrganizationDto,
  "body",
  async (req: Request, res: Response, data) => {
    const id = req.orgId;
    if (!id) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Organization ID is required to update the organization",
      });
    }

    const updatedOrganization = await updateOrganizationService(data, id);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Organization updated successfully",
      data: {
        organization: updatedOrganization,
      },
    });
  }
)

export const deleteOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.orgId;
    if (!id) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Organization ID is required to delete the organization",
      });
    }

    await deleteOrganizationService(id);  
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Organization deleted successfully",
    });
  }
)