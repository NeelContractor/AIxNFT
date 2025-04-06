
import { describe, it } from 'node:test';
import * as anchor from '@coral-xyz/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { BankrunProvider } from 'anchor-bankrun';
import { startAnchor } from 'solana-bankrun';
import type { Basic } from '../../anchor/target/types/basic';

const IDL = require('../../anchor/target/idl/basic.json');
const PROGRAM_ID = new PublicKey("Bqgso2hFGxdix41GTHmPf9L2zArPpKRJLP4uMKC4eRPt");
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

describe('NFT bankrun Minter', async () => {
  const context = await startAnchor(
    '',
    [
      { name: 'basic', programId: PROGRAM_ID },
      { name: 'token_metadata', programId: METADATA_PROGRAM_ID },
    ],
    [],
  );
  const provider = new BankrunProvider(context);
  anchor.setProvider(provider);
  const payer = Keypair.fromSecretKey( Uint8Array.from([ 249, 209, 127, 202, 229, 193, 116, 99, 211, 186, 102, 100, 164, 66, 190, 54, 20, 21, 43, 238, 52, 98, 140, 117, 105, 178, 239, 196, 147, 49, 126, 60, 5, 139, 194, 81, 250, 187, 9, 181, 24, 7, 47, 250, 165, 48, 195, 120, 141, 207, 42, 126, 228, 254, 241, 79, 121, 249, 170, 108, 147, 71, 249, 214, ]) );
  const program = new anchor.Program<Basic>(IDL, provider);

  // The metadata for our NFT

  const name = 'Homer NFT';
  const symbol = 'HOMR';
  const uri = 'https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/nft.json';

  const findMetadataPda = (mint: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      METADATA_PROGRAM_ID
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
      METADATA_PROGRAM_ID
    );
    return pda;
  };

  it('Create an NFT!', async () => {
    const mint = Keypair.generate();
    const metadata = findMetadataPda(mint.publicKey);
    const edition = findMasterEditionPda(mint.publicKey);
    const ata = getAssociatedTokenAddressSync(mint.publicKey, payer.publicKey);

    const transactionSignature = await program.methods
      .mintNft(name, symbol, uri)
      .accounts({
        signer: payer.publicKey,
        // mintAccount: mint.publicKey,
        // metadataAccount: metadata,
        // editionAccount: edition,
        // associatedTokenAccount: ata,
        // tokenProgram: TOKEN_PROGRAM_ID,
        // tokenMetadataProgram: METADATA_PROGRAM_ID,
        // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        // systemProgram: SystemProgram.programId,
        // rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([payer, mint])
      .rpc({ skipPreflight: true });

    console.log('Success!');
    console.log(`   Mint Address: ${mint.publicKey}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });
});