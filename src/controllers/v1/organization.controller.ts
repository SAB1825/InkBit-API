import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandlerAndValidation } from "@/middlewares/async-handler";
import { createOrganizationService } from "@/Services/v1/organization.service";
import { CreateOrganizationDto } from "@/validations/dtos";
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
