'use client'

import { useBasicProgram } from './basic-data-access'

export function BasicCreate() {
  const { MintNFT } = useBasicProgram()
  return (
    <button className="btn btn-xs lg:btn-md btn-primary" onClick={() => MintNFT.mutateAsync({ name: 'test', symbol: 'test', uri: 'test' })} disabled={MintNFT.isPending}>
      Run program{MintNFT.isPending && '...'}
    </button>
  )
}

export function BasicProgram() {
  const { getProgramAccount } = useBasicProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  )
}

export function BasicMint() {
  const { MintNFT } = useBasicProgram()
  return (
    <button className="btn btn-xs lg:btn-md btn-primary" onClick={() => MintNFT.mutateAsync({ name: 'test', symbol: 'test', uri: 'test' })} disabled={MintNFT.isPending}>
      Mint NFT{MintNFT.isPending && '...'}
    </button>
  )
} 