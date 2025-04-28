/*  this test was the first test that I did, it was erroring out because the metadata program id was wrong 

import * as anchor from '@coral-xyz/anchor'
import { Basic } from "../target/types/basic"
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, createMint } from '@solana/spl-token';
import "dotenv/config"
import BasicIDL from "../target/idl/basic.json"; 

// const PROGRAM_ID = new PublicKey("HFBzjWDJqt5ELfiB627uJYXeqw3e2AoMw1HczDtmYjcd");
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const SEEDS_PROGRAM_ID = new PublicKey(BasicIDL.address);


describe("NFTxAI", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const wallet = provider.wallet as anchor.Wallet;

    const program = anchor.workspace.Basic as anchor.Program<Basic>;

    const payer = Keypair.fromSecretKey(
        // Uint8Array.from(process.env.SECRET_KEY!)
        Uint8Array.from([249, 209, 127, 202, 229, 193, 116, 99, 211, 186, 102, 100, 164, 66, 190, 54, 20, 21, 43, 238, 52, 98, 140, 117, 105, 178, 239, 196, 147, 49, 126, 60, 5, 139, 194, 81, 250, 187, 9, 181, 24, 7, 47, 250, 165, 48, 195, 120, 141, 207, 42, 126, 228, 254, 241, 79, 121, 249, 170, 108, 147, 71, 249, 214])
      );

    const name = 'Homer NFT 2';
    const symbol = 'HOMR2';
    const uri = 'https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/nft.json';  

    const findMetadataPda = (mint: PublicKey) => {
        const [pda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
          ],
          SEEDS_PROGRAM_ID
        );
        return pda;
      };
    
      const findMasterEditionPda = (mint: PublicKey) => {
        const [pda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
          ],
          SEEDS_PROGRAM_ID
        );
        return pda;
      };

      it("minting nft", async () => {
        // Generate a new keypair for the mint account
        const mint = Keypair.generate();
        const metadata = findMetadataPda(mint.publicKey);
        const edition = findMasterEditionPda(mint.publicKey);
        const ata = getAssociatedTokenAddressSync(mint.publicKey, payer.publicKey);

        console.log("Payer: ", payer.publicKey.toString());
        console.log("Mint: ", mint.publicKey.toString());
        console.log("Metadata: ", metadata.toString());
        console.log("Edition: ", edition.toString());
        console.log("ATA: ", ata.toString());
        console.log("Token Program: ", TOKEN_PROGRAM_ID.toString());
        console.log("Metadata Program: ", METADATA_PROGRAM_ID.toString());


        const initIx = await program.methods
            .mintNft(name, symbol, uri)
            .accounts({
                signer: payer.publicKey,
                mintAccount: mint.publicKey,
                metadataAccount: metadata,
                editionAccount: edition,
                associatedTokenAccount: ata,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: METADATA_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            } as any).instruction();

        const blockhash = await provider.connection.getLatestBlockhash();

        const tx = new anchor.web3.Transaction({
            feePayer: payer.publicKey,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight
        }).add(initIx);

        const signature = await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [payer, mint], { skipPreflight: true });
        console.log("Signature: ", signature);
    })
})

*/