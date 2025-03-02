use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MatchPrediction {
    pub match_pda: Pubkey,
    pub player: Pubkey,
    pub score1: i8,
    pub score2: i8,
    pub bump: u8
}