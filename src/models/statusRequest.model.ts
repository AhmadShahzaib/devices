import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class StatusRequest {
    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean
}