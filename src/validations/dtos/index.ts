import "reflect-metadata";
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsNumber,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";

class OrganizationLimitsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  users?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  posts?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  apiCallsPerMonth?: number;
}

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, {
    message: "Organization name must be less than 50 characters",
  })
  @Transform(({ value }) => value?.trim())
  orgName!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  })
  orgSlug!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: "Must be a valid domain with http or https",
  })
  orgDomain!: string;

  @IsOptional()
  @IsEnum(["starter", "professional", "enterprise"])
  plan?: "starter" | "professional" | "enterprise";
}

export class createSuperAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  username!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
    message: "Please enter a valid email address",
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        "Password must be minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character",
    }
  )
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(["super_admin", "org_admin", "org_user"], {
    message: "Role must be either super_admin, org_admin, or org_user",
  })
  role!: "super_admin" | "org_admin" | "org_user";

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.+/, {
    message: "Avatar must be a valid URL",
  })
  avatar?: string;
}

export class updateOrganizationDto{ 
  @IsString()
  @IsOptional()
  @MaxLength(50, {
    message: "Organization name must be less than 50 characters",
  })
  @Transform(({ value }) => value?.trim())
  orgName!: string;

  @IsString()
  @IsOptional()
  @Matches(/^https?:\/\/.+/, {
    message: "Must be a valid domain with http or https",
  })
  orgDomain!: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @Matches(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  })
  orgSlug!: string;
}