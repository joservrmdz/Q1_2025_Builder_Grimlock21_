use crate::state::Escrow;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface, TransferChecked};

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    maker: Signer<'info>,
    #[account(
        mint::token_program = token_program
    )]
    mint_a: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        payer=maker,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    maker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        close = maker,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref() ],
        bump=escrow.bump
    )]
    escrow: Account<'info, Escrow>,
    #[account(
        mut,
        // payer = maker, We don't need a payer, it already exists
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    vault: InterfaceAccount<'info, TokenAccount>,
    associated_token_program: Program<'info, AssociatedToken>, //calculates ata
    token_program: Interface<'info, TokenInterface>, // token transfers, opening mints
    system_program: Program<'info, System>, //open the escrow state

}

impl<'info> Refund<'info> {
    pub fn withdraw_and_close(&mut self) -> Result<()> {
        let maker = self.maker.to_account_info().key();
        let seed = self.escrow.seed.to_le_bytes();
        let bump = [self.escrow.bump];
        let signer_seeds = [&[b"escrow",
           maker.as_ref(),
            &seed.as_ref(),
            &bump][..]];

        let accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.maker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let ctx = CpiContext::new_with_signer(self.token_program.to_account_info(), accounts, &signer_seeds);
        transfer_checked(ctx, self.vault.amount, self.mint_a.decimals)?;
        let accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            &signer_seeds);
        close_account(ctx)
    }
}