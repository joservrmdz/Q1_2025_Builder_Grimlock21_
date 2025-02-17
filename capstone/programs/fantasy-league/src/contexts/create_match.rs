use std::io::Read;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(team1: String, team2: String, start_time: i64)]
pub struct CreateMatch<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init_if_needed,
        payer= admin,
        space= 8 + FantasyMatch::INIT_SPACE,
        seeds= [b"fantasy_match", admin.key().as_ref(), team1.as_bytes(), team2.as_bytes()],
        bump
    )]
    pub fantasy_match: Account<'info, FantasyMatch>,

    pub system_program: Program<'info, System>,

}

impl<'info> CreateMatch<'info> {
    pub fn create_match(&mut self, team1: String, team2: String, start_time: i64, bumps: &CreateMatchBumps) -> Result<()> {
        self.fantasy_match.set_inner(FantasyMatch {
            team1,
            team2,
            start_time,
            score_team1: 0,
            score_team2: 0,
            is_settled: false,
            admin: self.admin.key(),
            bump: bumps.fantasy_match,
        });
        Ok(())
    }
}