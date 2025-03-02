use anchor_lang::prelude::*;
#[account]
#[derive(InitSpace)]
pub struct RewardVault {
    pub bump: u8,
}