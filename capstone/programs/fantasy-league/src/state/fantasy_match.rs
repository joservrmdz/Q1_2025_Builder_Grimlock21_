use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct FantasyMatch {
    #[max_len(28)]
    pub team1: String,
    #[max_len(28)]
    pub team2: String,
    pub start_time: i64,
    pub score_team1: i8,
    pub score_team2: i8,
    pub is_settled: bool,
    pub admin: Pubkey,
    pub bump: u8
}