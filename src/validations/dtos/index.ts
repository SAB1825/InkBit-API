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
  ValidateIf,
  ValidationArguments,
  Validate,
  IsArray,
  IsObject,
  MinLength,
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
  @IsEnum(["admin", "user"], {
    message: "Role must be either super_admin, org_admin, or org_user",
  })
  role!: "admin" | "user";

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

export class updateOrganizationDto {
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

function IsEmailOrUsernamePresent(_: any, args: ValidationArguments) {
  const { email, username } = args.object as any;
  return !!email || !!username;
}

export class LoginUserDto {
  @ValidateIf((o) => !o.username)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
    message: "Please enter a valid email address",
  })
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  username?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @Validate(IsEmailOrUsernamePresent, {
    message: "Either email or username must be provided",
  })
  dummyFieldToTriggerValidation: boolean = true; // Needed to apply the custom validator
}
// ...existing code...
class BlogBannerDto {
  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: "Must be a valid URL with http or https",
  })
  url!: string;

  @IsNumber()
  @Min(1)
  width!: number;

  @IsNumber()
  @Min(1)
  height!: number;
}
export class CreateBlogDto {
  @IsString()
  @MaxLength(100, {
    message: "Title must be less than 100 characters",
  })
  @Transform(({ value }) => value?.trim())
  title!: string;

  @IsString()
  @MinLength(100, {
    message: "Content must be at least 100 characters long",
  })
  content!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => BlogBannerDto)
  banner!: BlogBannerDto;

  @IsEnum(["draft", "published"], {
    message: "Status must be either 'draft' or 'published'",
  })
  @IsOptional()
  status?: "draft" | "published" = "draft";

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(200, {
    message: "Description must be less than 200 characters",
  })
  description?: string;
}
export class UpdateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, {
    message: "Title must be less than 100 characters",
  })
  @Transform(({ value }) => value?.trim())
  title!: string;

  @IsString()
  @MinLength(100, {
    message: "Content must be at least 100 characters long",
  })
  @IsOptional()
  content!: string;

  @IsObject()
  @ValidateNested()
  @IsOptional()
  @Type(() => BlogBannerDto)
  banner!: BlogBannerDto;

  @IsEnum(["draft", "published"], {
    message: "Status must be either 'draft' or 'published'",
  })
  @IsOptional()
  status?: "draft" | "published" = "draft";

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(200, {
    message: "Description must be less than 200 characters",
  })
  description?: string;
}


export class createCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
export class updateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}