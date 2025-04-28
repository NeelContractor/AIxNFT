'use client'

import { BASIC_PROGRAM_ID as programId, getBasicProgram } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token'

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"); // Token Metadata program ID

interface MintNftParams {
  name: string;
  symbol: string;
  uri: string;
}

export function useBasicProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const { wallet, publicKey, sendTransaction } = useWallet();
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const program = getBasicProgram(provider)

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const MintNFT = useMutation<string, Error, MintNftParams>({
    mutationKey: ['basic', 'mintNft', { cluster }],
    mutationFn: async ({name, symbol, uri}: MintNftParams) => {
      if (!publicKey) throw new Error('Wallet not connected');
      const tx = new Transaction();
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = publicKey;
      const mint = Keypair.generate();
      const metadataPda = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          mint.publicKey.toBuffer(),
          publicKey.toBuffer()
        ],
        programId
      )[0];
      const editionPda = PublicKey.findProgramAddressSync(
        [
          Buffer.from("edition"),
          mint.publicKey.toBuffer(),
          publicKey.toBuffer()
        ],
        programId
      )[0];
      const nftAta = await getAssociatedTokenAddress(
        mint.publicKey,
        publicKey
      );

      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: mint.publicKey,
          lamports: 1000000,
        })
      );

      const instruction = await program.methods.mintNft(name, symbol, uri)
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
          .instruction();

      tx.add(instruction);

      const signature = await sendTransaction(tx, connection, { skipPreflight: true });
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature)
    },
    onError: () => toast.error('Failed to run program'),
  })

  return {
    program,
    programId,
    getProgramAccount,
    MintNFT,
  }
}
