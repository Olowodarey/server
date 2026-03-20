import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { verifyMessageSignatureRsv } from "@stacks/encryption";

import { User } from "@app/database/entities/user.entity";
import { VerifySignatureDto } from "./dto/verify-signature.dto";

// In-memory nonce store (replace with Redis in production)
const nonceStore = new Map<string, { nonce: string; expiresAt: Date }>();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Generate a sign challenge nonce for the given wallet address.
   */
  async generateChallenge(walletAddress: string) {
    const nonce = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    nonceStore.set(walletAddress, { nonce, expiresAt });

    const message = `Sign this message to authenticate with Stacks Academy.\n\nNonce: ${nonce}`;

    console.log("[Auth] Challenge generated for wallet:", walletAddress);
    console.log("[Auth] Nonce:", nonce);
    console.log("[Auth] Message:", message);

    return {
      nonce,
      expiresAt,
      message,
    };
  }

  /**
   * Verify a signed challenge and issue a JWT.
   */
  async verifySignature(dto: VerifySignatureDto) {
    try {
      const { walletAddress, signature, publicKey } = dto;

      console.log("[Auth] Verifying signature for wallet:", walletAddress);
      console.log("[Auth] Signature length:", signature?.length);
      console.log("[Auth] PublicKey length:", publicKey?.length);

      const stored = nonceStore.get(walletAddress);
      if (!stored) {
        console.error("[Auth] No stored nonce for wallet:", walletAddress);
        throw new BadRequestException(
          "No pending challenge for this wallet address",
        );
      }

      if (new Date() > stored.expiresAt) {
        nonceStore.delete(walletAddress);
        console.error("[Auth] Challenge expired for wallet:", walletAddress);
        throw new UnauthorizedException(
          "Challenge has expired. Please request a new one.",
        );
      }

      // Verify the signature against the nonce message
      const message = `Sign this message to authenticate with Stacks Academy.\n\nNonce: ${stored.nonce}`;

      console.log("[Auth] Verifying message:", message);

      let isValid = false;
      try {
        isValid = verifyMessageSignatureRsv({
          message,
          signature,
          publicKey,
        });
        console.log("[Auth] Signature verification result:", isValid);
      } catch (error) {
        console.error("[Auth] Signature verification error:", error);
        console.error("[Auth] Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw new UnauthorizedException(
          `Invalid signature format: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      if (!isValid) {
        console.error("[Auth] Signature validation failed");
        throw new UnauthorizedException("Invalid signature");
      }

      nonceStore.delete(walletAddress);

      // Find or create user
      console.log("[Auth] Looking up user:", walletAddress);
      let user = await this.userRepo.findOne({ where: { walletAddress } });

      if (!user) {
        console.log("[Auth] Creating new user:", walletAddress);
        user = this.userRepo.create({ walletAddress });
        try {
          user = await this.userRepo.save(user);
          console.log("[Auth] User created successfully:", user.id);
        } catch (dbError) {
          console.error("[Auth] Database error creating user:", dbError);
          throw dbError;
        }
      } else {
        console.log("[Auth] Existing user found:", user.id);
      }

      const tokens = this.issueTokens(user);
      console.log("[Auth] Tokens issued successfully");
      return { ...tokens, user: this.sanitizeUser(user) };
    } catch (error) {
      // Log any unexpected errors
      if (
        !(error instanceof BadRequestException) &&
        !(error instanceof UnauthorizedException)
      ) {
        console.error("[Auth] Unexpected error in verifySignature:", error);
        console.error("[Auth] Error type:", error?.constructor?.name);
        console.error("[Auth] Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
      throw error;
    }
  }

  issueTokens(user: User) {
    const payload = {
      sub: user.id,
      walletAddress: user.walletAddress,
      level: user.level,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    return { accessToken, refreshToken };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  private sanitizeUser(user: User) {
    const { ...rest } = user;
    return rest;
  }
}
