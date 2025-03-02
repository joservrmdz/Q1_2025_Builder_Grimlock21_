use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(team1: String, team2: String, start_time: i64, team1score: i8, team2score: i8)]
pub struct SubmitPrediction<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [b"fantasy_match", team1.as_bytes(), team2.as_bytes(), &start_time.to_le_bytes()],
        bump
    )]
    pub fantasy_match: Account<'info, FantasyMatch>,

    #[account(
        init_if_needed,
        payer= player,
        space= 8 + MatchPrediction::INIT_SPACE,
        seeds= [b"prediction", fantasy_match.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub match_prediction: Account<'info, MatchPrediction>,

    #[account(
        mut,
        seeds= [b"vault", fantasy_match.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, RewardVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> SubmitPrediction<'info> {
    pub fn submit_prediction(&mut self,
                             _team1: String,
                             _team2: String,
                             _start_time: i64,
                             score1: i8,
                             score2: i8,
                             bumps: &SubmitPredictionBumps) -> Result<()> {
        self.match_prediction.set_inner(MatchPrediction {
            player: self.player.key(),
            score1,
            score2,
            bump: bumps.match_prediction,
        });
        Ok(())
    }
}
