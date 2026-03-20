import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
} from "@stacks/transactions";
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";

interface MintParams {
  recipientAddress: string;
  moduleId: number;
  score: number;
  certId: string;
}

@Injectable()
export class StacksNftService {
  private readonly logger = new Logger(StacksNftService.name);
  private readonly network: typeof STACKS_TESTNET | typeof STACKS_MAINNET;
  private readonly networkType: "testnet" | "mainnet";

  constructor(private readonly config: ConfigService) {
    this.networkType = this.config.get<string>("stacks.network", "testnet") as
      | "testnet"
      | "mainnet";
    this.network =
      this.networkType === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;
  }

  /**
   * Mint a SIP-009 NFT certificate on Stacks blockchain.
   *
   * This function:
   * 1. Builds a Clarity contract call transaction
   * 2. Signs with the platform admin key
   * 3. Broadcasts to the Stacks network
   * 4. Returns the transaction ID
   */
  async mintCertificate(
    params: MintParams,
  ): Promise<{ txId: string; tokenId?: number }> {
    const contractAddress = this.config.get<string>(
      "stacks.certificateContractAddress",
    );
    const contractName = this.config.get<string>(
      "stacks.certificateContractName",
    );
    const senderKey = this.config.get<string>("stacks.adminPrivateKey");

    if (!contractAddress || !contractName) {
      throw new InternalServerErrorException(
        "Stacks contract configuration missing. Please set CERTIFICATE_CONTRACT_ADDRESS and CERTIFICATE_CONTRACT_NAME",
      );
    }

    if (!senderKey) {
      throw new InternalServerErrorException(
        "Stacks admin private key not configured. Please set STACKS_ADMIN_PRIVATE_KEY",
      );
    }

    this.logger.log(
      `Minting certificate NFT: cert=${params.certId}, module=${params.moduleId}, score=${params.score}, recipient=${params.recipientAddress}`,
    );

    try {
      // Get current nonce for the sender
      const nonce = await this.getNonce(contractAddress);

      // Build the contract call transaction
      const txOptions = {
        contractAddress,
        contractName,
        functionName: "mint",
        functionArgs: [
          principalCV(params.recipientAddress),
          uintCV(params.moduleId),
          uintCV(params.score),
        ],
        senderKey,
        network: this.networkType,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        nonce,
        fee: 100000n, // 0.1 STX fee
      };

      this.logger.debug(`Building transaction with options:`, {
        contract: `${contractAddress}.${contractName}`,
        function: "mint",
        args: {
          recipient: params.recipientAddress,
          moduleId: params.moduleId,
          score: params.score,
        },
        network: this.networkType,
      });

      const transaction = await makeContractCall(txOptions);

      // Broadcast the transaction
      this.logger.debug("Broadcasting transaction to Stacks network...");
      const broadcastResponse = await broadcastTransaction({
        transaction,
        network: this.networkType,
      });

      // Handle response - can be string (txid) or object with txid
      let txId: string;
      if (typeof broadcastResponse === "string") {
        txId = broadcastResponse;
      } else if (
        typeof broadcastResponse === "object" &&
        "txid" in broadcastResponse
      ) {
        txId = (broadcastResponse as { txid: string }).txid;
      } else {
        this.logger.error("Unexpected broadcast response:", broadcastResponse);
        throw new InternalServerErrorException(
          "Failed to broadcast transaction",
        );
      }

      this.logger.log(`Certificate NFT minted successfully! TxID: ${txId}`);
      this.logger.log(
        `View transaction: ${this.getExplorerUrl()}/txid/${txId}?chain=${this.networkType}`,
      );

      return { txId };
    } catch (error) {
      this.logger.error("Failed to mint certificate NFT:", error);
      throw new InternalServerErrorException(
        `Failed to mint certificate: ${error.message}`,
      );
    }
  }

  /**
   * Get the current nonce for an address
   */
  private async getNonce(address: string): Promise<bigint> {
    const apiUrl = this.config.get<string>("stacks.apiUrl");
    const url = `${apiUrl}/v2/accounts/${address}?proof=0`;

    try {
      // eslint-disable-next-line no-undef
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch nonce: ${response.statusText}`);
      }
      const data = await response.json();
      return BigInt(data.nonce);
    } catch (error) {
      this.logger.error(`Failed to fetch nonce for ${address}:`, error);
      throw new InternalServerErrorException("Failed to fetch account nonce");
    }
  }

  /**
   * Get the explorer URL based on network
   */
  private getExplorerUrl(): string {
    return "https://explorer.hiro.so";
  }

  /**
   * Get NFT metadata for a certificate
   * This is called by the contract's get-token-uri function
   */
  async getCertificateMetadata(certId: string, tokenId: number) {
    const imageUrl = this.config.get<string>(
      "stacks.certificateImageUrl",
      "https://purple-accessible-swift-921.mypinata.cloud/ipfs/bafybeicaa5ezzbru2ji2neiwamgcg4pol2i5c74lwlwvpkdogy6z5glkfm",
    );

    // Return SIP-009 compliant metadata with rich attributes
    return {
      name: `Stacks Academy Certificate #${tokenId}`,
      description:
        "Official certificate of completion for Stacks Academy. This NFT certifies that the holder has successfully completed the comprehensive Stacks blockchain development curriculum, demonstrating proficiency in Clarity smart contracts, Web3 development, and decentralized application architecture.",
      image: imageUrl,
      external_url: `https://stacksacademy.xyz/certificates/${certId}`,
      attributes: [
        {
          trait_type: "Certificate ID",
          value: certId,
        },
        {
          trait_type: "Token ID",
          value: tokenId,
        },
        {
          trait_type: "Institution",
          value: "Stacks Academy",
        },
        {
          trait_type: "Certification Type",
          value: "Course Completion",
        },
        {
          trait_type: "Blockchain",
          value: "Stacks",
        },
        {
          trait_type: "Standard",
          value: "SIP-009",
        },
      ],
      properties: {
        category: "Education",
        collection: "Stacks Academy Certificates",
        issuer: "Stacks Academy",
        blockchain: "Stacks",
      },
    };
  }
}
