import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler, asyncHandlerAndValidation } from "@/middlewares/async-handler";
import { createOrganizationService, getOrganizationService } from "@/Services/v1/organization.service";
import { CreateOrganizationDto, GetOrganizationDto } from "@/validations/dtos";
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
    const { id } = req.params
    
    const organization = await getOrganizationService(id);
    res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Organization retrieved successfully",
      data: {
        organization,
      },
    });
  }
)