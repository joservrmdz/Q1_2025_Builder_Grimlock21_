use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(team1: String, team2: String, start_time: i64, stake:i32)]
pub struct CreateMatch<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer= admin,
        space= 8 + FantasyMatch::INIT_SPACE,
        seeds= [b"fantasy_match", team1.as_bytes(), team2.as_bytes(), &start_time.to_le_bytes()],
        bump
    )]
    pub fantasy_match: Account<'info, FantasyMatch>,

    #[account(
        init,
        payer= admin,
        space= 8 + RewardVault::INIT_SPACE,
        seeds= [b"vault", fantasy_match.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, RewardVault>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateMatch<'info> {
    pub fn create_match(&mut self, team1: String, team2: String, start_time: i64, stake: i32, bumps: &CreateMatchBumps) -> Result<()> {
        self.fantasy_match.set_inner(FantasyMatch {
            team1,
            team2,
            start_time,
            score1: 0,
            score2: 0,
            is_settled: false,
            admin: self.admin.key(),
            bump: bumps.fantasy_match,
            stake
        });
        Ok(())
    }
}