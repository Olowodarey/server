import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class VerifySignatureDto {
  @ApiProperty({ example: "SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD1" })
  @IsString()
  @Matches(/^(SP|SM|ST)[A-Z0-9]+$/)
  walletAddress: string;

  @ApiProperty({ description: "SIP-018 structured data signature" })
  @IsString()
  signature: string;

  @ApiProperty({ description: "Compressed secp256k1 public key" })
  @IsString()
  publicKey: string;
}
