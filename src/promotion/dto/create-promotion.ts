import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsPositive,
  IsISO8601,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO pour le contenu du message (imbriqué)
export class MessageDto {
  @IsNotEmpty()
  @IsString()
  messageTitle: string;

  @IsNotEmpty()
  @IsString()
  messageContent: string;
}

// DTO pour la création d'une Promotion (inclut le Message)
export class CreatePromotionDto {
  // Champs de la Promotion
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  finalPrice: number;

  @IsNotEmpty()
  @IsISO8601()
  deadline: string; // La date limite est envoyée comme une chaîne ISO

  @IsNotEmpty()
  @IsString()
  storeId: string;

  // Champs imbriqués pour le Message
  // Nécessite @ValidateNested() et @Type(() => MessageDto) pour la validation et la transformation
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MessageDto)
  message: MessageDto;
}

// DTO pour la mise à jour d'une Promotion (tous les champs sont optionnels)
export class UpdatePromotionDto {
  // Champs optionnels de la Promotion
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  finalPrice?: number;

  @IsOptional()
  @IsISO8601()
  deadline?: string;

  // Champ optionnel pour la mise à jour du Message associé
  @IsOptional()
  @ValidateNested()
  @Type(() => MessageDto)
  message?: MessageDto; // Si ce champ est présent, le service mettra à jour l'entité Message liée.
}
