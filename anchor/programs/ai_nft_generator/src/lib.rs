#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata},
        token::{mint_to, MintTo, Mint, Token, TokenAccount},
};

declare_id!("Bqgso2hFGxdix41GTHmPf9L2zArPpKRJLP4uMKC4eRPt");

#[program]
pub mod ai_nft_generator {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNFT>, nft_name: String, nft_symbol: String, nft_uri: String) -> Result<()> {
        msg!("Minting NFT");

        mint_to(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ), 1)?;

        msg!("Creating metadata account");

        create_metadata_accounts_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata_account.to_account_info(),
                    mint: ctx.accounts.mint_account.to_account_info(),
                    mint_authority: ctx.accounts.signer.to_account_info(),
                    payer: ctx.accounts.signer.to_account_info(),
                    update_authority: ctx.accounts.signer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info()
                },
            ), 
            DataV2 { 
                name: nft_name, 
                symbol: nft_symbol, 
                uri: nft_uri, 
                seller_fee_basis_points: 0, 
                creators: None, 
                collection: None, 
                uses: None 
            }, 
                false, 
                true, 
                None
            )?;

            msg!("Creating master edition account");

            create_master_edition_v3(
                CpiContext::new(
                    ctx.accounts.token_metadata_program.to_account_info(),
                    CreateMasterEditionV3 {
                        edition: ctx.accounts.edition_account.to_account_info(),
                        mint: ctx.accounts.mint_account.to_account_info(),
                        update_authority: ctx.accounts.signer.to_account_info(),
                        mint_authority: ctx.accounts.signer.to_account_info(),
                        payer: ctx.accounts.signer.to_account_info(),
                        metadata: ctx.accounts.metadata_account.to_account_info(),
                        token_program: ctx.accounts.token_program.to_account_info(),
                        system_program: ctx.accounts.system_program.to_account_info(),
                        rent: ctx.accounts.rent.to_account_info(),
                    },
                ),
                None,
            )?;

        msg!("NFT minted successfully");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Validate address by deriving pda
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub edition_account: UncheckedAccount<'info>,

    // create a new NFT mint
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key()
    )]
    pub mint_account: Account<'info, Mint>,

    // create Assoicates token account for nft, if needed
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint_account,
        associated_token::authority = signer
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
