use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::errors::MarketplaceError;
use crate::state::MarketPlace;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [b"marketplace", name.as_str().as_bytes()],
        bump,
        space = MarketPlace::INIT_SPACE
    )]
    pub market_place: Account<'info, MarketPlace>,
    #[account(
        seeds = [b"treasury", market_place.key().as_ref()],
        bump,
    )]
    pub treasury: SystemAccount<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [b"rewards", market_place.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = market_place,
    )]
    pub rewards_mint: InterfaceAccount<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> Initialize<'info> {
    pub fn init(&mut self, name: String, fee: u16, bumps: &InitializeBumps) -> Result<()> {
        require!(name.len() > 0 && name.len() < 4 + 33, MarketplaceError::NameTooLong);
        self.market_place.set_inner(MarketPlace {
            admin: self.admin.key(),
            fee,
            bump: bumps.market_place,
            treasury_bump: bumps.treasury,
            rewards_mint_bump: bumps.rewards_mint,
            name,
        });

        Ok(())
    }
}