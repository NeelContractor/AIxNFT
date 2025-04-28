import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { assert } from "chai";
import { Basic } from "../target/types/basic"; // adjust if your program name is different
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"); // Token Metadata program ID

describe("basic", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Basic as Program<Basic>;

  let mint: Keypair;
  let nftAta: PublicKey;
  let metadataPda: PublicKey;
  let editionPda: PublicKey;
  let signer = provider.wallet as anchor.Wallet;

  it("Mints an NFT!", async () => {
    // Step 1: Create a new keypair for the Mint
    console.log("🚀 Starting NFT mint test...");

    mint = Keypair.generate();
    console.log("🧬 New Mint Keypair generated:", mint.publicKey.toBase58());

    // Step 2: Derive Associated Token Account
    nftAta = await getAssociatedTokenAddress(
      mint.publicKey,
      signer.publicKey
    );
    console.log("📦 Associated Token Account:", nftAta.toBase58());


    // Step 3: Derive Metadata PDA
    [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
    console.log("📝 Metadata PDA:", metadataPda.toBase58());

    // Step 4: Derive Master Edition PDA
    [editionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      METADATA_PROGRAM_ID
    );
    console.log("🎨 Master Edition PDA:", editionPda.toBase58());

    console.log("📡 Sending transaction to mint NFT...");
    // Step 5: Call your mint_nft instruction
    const txSignature = await program.methods
      .mintNft(
        "My NFT",
        "MYNFT",
        "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/nft.json"
      )
      .accounts({
        signer: signer.publicKey,
        mintAccount: mint.publicKey,
        metadataAccount: metadataPda,
        editionAccount: editionPda,
        associatedTokenAccount: nftAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .signers([mint]) // Mint must sign! because it's being created
      .rpc();

    console.log("NFT minted successfully!");
    console.log("✅ NFT minted successfully!");
    console.log("🔗 Transaction Signature:", txSignature);
    console.log(`🔎 View transaction: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
  });
});
