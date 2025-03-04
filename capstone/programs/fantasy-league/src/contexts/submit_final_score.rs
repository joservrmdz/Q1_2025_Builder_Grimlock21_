use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(team1: String, team2: String, start_time: i64)]
pub struct SubmitFinalScore<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds= [b"fantasy_match", team1.as_bytes(), team2.as_bytes(), &start_time.to_le_bytes()],
        bump
    )]
    pub fantasy_match: Account<'info, FantasyMatch>,

    pub system_program: Program<'info, System>,
}

impl<'info> SubmitFinalScore<'info> {
    pub fn submit_final_score(&mut self, _team1: String, _team2: String, _start_time: i64, score1: i8, score2: i8, bumps: &SubmitFinalScoreBumps,
    ) -> Result<()> {
        self.fantasy_match.score1 = score1;
        self.fantasy_match.score2 = score2;
        Ok(())
    }
}
