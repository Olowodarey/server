#!/usr/bin/env tsx

/**
 * Test script to mint a certificate NFT directly
 * Usage: tsx scripts/test-mint-certificate.ts
 */

import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    uintCV,
    principalCV,
} from "@stacks/transactions";
import { generateWallet, getStxAddress } from "@stacks/wallet-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const NETWORK = "testnet";
const API_URL = "https://api.testnet.hiro.so";
const CONTRACT_ADDRESS = process.env.CERTIFICATE_CONTRACT_ADDRESS || "STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191";
const CONTRACT_NAME = process.env.CERTIFICATE_CONTRACT_NAME || "stacks-academy-cert";
const MNEMONIC = process.env.STACKS_ADMIN_PRIVATE_KEY;

// Test parameters
const RECIPIENT_ADDRESS = "STY1XRRA93GJP9YMS2CTHB6M08M11BKPDVRM0191"; // Minting to deployer address
const MODULE_ID = 6; // Final module
const SCORE = 95; // Excellent score!

async function getNonce(address: string): Promise<bigint> {
    const url = `${API_URL}/v2/accounts/${address}?proof=0`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch nonce: ${response.statusText}`);
    }
    const data = await response.json();
    return BigInt(data.nonce);
}

async function mintCertificate() {
    console.log("🎓 Stacks Academy Certificate Minting Test\n");

    if (!MNEMONIC) {
        console.error("❌ Error: STACKS_ADMIN_PRIVATE_KEY not set in .env");
        process.exit(1);
    }

    // Generate wallet from mnemonic
    console.log("🔑 Generating wallet from mnemonic...");
    const wallet = await generateWallet({
        secretKey: MNEMONIC,
        password: "",
    });

    const account = wallet.accounts[0];
    const senderAddress = getStxAddress({ account, network: NETWORK });
    const senderKey = account.stxPrivateKey;

    console.log("✅ Wallet loaded");
    console.log("📍 Sender address:", senderAddress);
    console.log("📍 Recipient address:", RECIPIENT_ADDRESS);
    console.log("📝 Contract:", `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log("📚 Module ID:", MODULE_ID);
    console.log("🎯 Score:", SCORE);

    // Get nonce
    console.log("\n⏳ Fetching account nonce...");
    const nonce = await getNonce(senderAddress);
    console.log("✅ Nonce:", nonce.toString());

    // Build transaction
    console.log("\n🔨 Building transaction...");
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "mint",
        functionArgs: [
            principalCV(RECIPIENT_ADDRESS),
            uintCV(MODULE_ID),
            uintCV(SCORE),
        ],
        senderKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        nonce,
        fee: 100000n, // 0.1 STX
    };

    const transaction = await makeContractCall(txOptions);
    console.log("✅ Transaction built");
    console.log("💰 Fee: 0.1 STX");

    // Broadcast transaction
    console.log("\n📡 Broadcasting transaction to Stacks testnet...");
    try {
        const broadcastResponse = await broadcastTransaction({
            transaction,
            network: NETWORK,
        });

        let txId: string;
        if (typeof broadcastResponse === "string") {
            txId = broadcastResponse;
        } else if (typeof broadcastResponse === "object" && "txid" in broadcastResponse) {
            txId = (broadcastResponse as any).txid;
        } else {
            console.error("❌ Unexpected response:", broadcastResponse);
            process.exit(1);
        }

        console.log("\n✅ Certificate NFT minted successfully!");
        console.log("📋 Transaction ID:", txId);
        console.log("🔗 View on explorer:");
        console.log(`   https://explorer.hiro.so/txid/${txId}?chain=testnet`);
        console.log("\n📜 Contract address:");
        console.log(`   ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
        console.log("🔗 View contract:");
        console.log(`   https://explorer.hiro.so/address/${CONTRACT_ADDRESS}?chain=testnet`);
        console.log("\n⏳ Transaction will confirm in ~10 minutes on testnet");
        console.log("🎉 Once confirmed, the NFT will appear in the recipient's wallet!");

        // Show metadata info
        console.log("\n📸 NFT Metadata:");
        console.log("   Name: Stacks Academy Certificate");
        console.log("   Image: Stacks Academy Logo");
        console.log("   URL:", process.env.CERTIFICATE_IMAGE_URL);
        console.log("\n✨ The certificate includes:");
        console.log("   - Module ID:", MODULE_ID);
        console.log("   - Score:", SCORE);
        console.log("   - Recipient:", RECIPIENT_ADDRESS);

    } catch (error) {
        console.error("\n❌ Error broadcasting transaction:");
        console.error(error);
        process.exit(1);
    }
}

// Run the script
mintCertificate().catch((error) => {
    console.error("\n❌ Script error:");
    console.error(error);
    process.exit(1);
});
