"use client"
import generateImageFromPromptOpenAi from "@/utils/openai";
import { uploadToNftStorage } from "@/utils/uploadToNftStorage";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useState } from "react";
import BasicIdl from '@/../../anchor/target/idl/basic.json'
import type { Basic } from '@/../../anchor/target/types/basic'
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

const programId = new PublicKey(BasicIdl.address);
console.log("Program ID:", programId.toBase58());
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"); // Token Metadata program ID

export default function MintForm() {
    const { publicKey, wallet, sendTransaction, signTransaction } = useWallet();
    const { connection } = useConnection();
    console.log("Connection status:", connection);

    const [loading, setLoading] = useState(false);

    const handleMint = async() => {
        if (!publicKey || !wallet) return alert("Connect wallet first!");
        console.log("PublicKey:", publicKey.toBase58());
        console.log("Wallet:", wallet);

        // try {
            setLoading(true);

            const provider = new AnchorProvider(connection, wallet as unknown as Wallet, {});
            const program = new Program<Basic>(BasicIdl as any, provider);

            const mint = Keypair.generate();
            console.log("🧬 New Mint Keypair generated:", mint.publicKey.toBase58());

            const blockhashContext = await connection.getLatestBlockhash();
            
            const tx = new Transaction({
              feePayer: wallet.adapter.publicKey,
              blockhash: blockhashContext.blockhash,
              lastValidBlockHeight: blockhashContext.lastValidBlockHeight
            });
            
            tx.add(
              SystemProgram.transfer({
                fromPubkey: publicKey,  // From wallet
                toPubkey: mint.publicKey,  // To mint account
                lamports: 1000000,  // 0.001 SOL (Adjust based on current rent-exemption requirement)
              })
            );
            
            if (!signTransaction) throw new Error("Wallet does not support signing transactions");
            const signedTx = await signTransaction(tx);
            await connection.sendRawTransaction(signedTx.serialize());

            // Step 2: Derive Associated Token Account
            const nftAta = await getAssociatedTokenAddress(
              mint.publicKey,
              publicKey
            );
            console.log("📦 Associated Token Account:", nftAta.toBase58());

            const [metadataPda] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                METADATA_PROGRAM_ID.toBuffer(),
                mint.publicKey.toBuffer(),
              ],
              METADATA_PROGRAM_ID
            );
            console.log("📝 Metadata PDA:", metadataPda.toBase58());

            const [editionPda] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                METADATA_PROGRAM_ID.toBuffer(),
                mint.publicKey.toBuffer(),
                Buffer.from("edition"),
              ],
              METADATA_PROGRAM_ID
            );
            console.log("🎨 Master Edition PDA:", editionPda.toBase58());

            const txSignature = await program.methods
              .mintNft("AI NFT", "AINFT", "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/nft.json")
              .accounts({
                signer: publicKey,
                mintAccount: mint.publicKey,
                metadataAccount: metadataPda,
                editionAccount: editionPda,
                associatedTokenAccount: nftAta,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: METADATA_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
              } as any)
              .signers([mint])
              .instruction(); 

              console.log("Instruction:", txSignature);

              const transaction = new Transaction().add(txSignature);

              const txid = await sendTransaction(transaction, connection, { skipPreflight: true });

                console.log("Transaction ID:", txid);
                console.log(`View transaction: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
                setLoading(false);    
                alert("NFT minted!");
            
        // } catch (error) {
        //     console.error("Error minting nft: ",error);
        //     alert("Minting failed");
        // } finally {
        //     setLoading(false);
        // }
    }


    return (
        <div className="flex flex-col gap-4 max-w-md mx-auto">
      {/* <input
        type="text"
        className="p-2 border rounded"
        placeholder="Describe your NFT..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      /> */}
      <button
        onClick={handleMint}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {loading ? "Minting..." : "Generate & Mint NFT"}
      </button>
    </div>
    )
}