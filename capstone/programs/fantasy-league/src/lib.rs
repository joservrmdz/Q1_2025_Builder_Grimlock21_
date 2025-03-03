mod contexts;
mod state;

use contexts::*;
use state::*;

use anchor_lang::prelude::*;

declare_id!("DN7ry5Ymg1Erzo8xmtgMSRZhnQV3PzezeAnvDW3FqPQ8");

#[program]
pub mod fantasy_league {
    use super::*;

    pub fn create_match(ctx: Context<CreateMatch>, team1: String, team2: String, start_time: i64, stake: u64) -> Result<()> {
        let message = format!("Created match: {} vs {}", team1, team2);
        msg!("{}", message);
        ctx.accounts.create_match(team1, team2, start_time, stake, &ctx.bumps)?;
        Ok(())
    }

    pub fn submit_prediction(ctx: Context<SubmitPrediction>,
                             team1: String,
                             team2: String,
                             start_time: i64,
                             score1: i8,
                             score2: i8) -> Result<()> {
        let message = format!("Created prediction: {}:{} vs {}:{}", team1, score1, team2, score2);
        msg!("{}", message);
        ctx.accounts.submit_prediction(team1, team2, start_time, score1, score2, &ctx.bumps)?;
        Ok(())
    }

    pub fn submit_final_score(
        ctx: Context<SubmitFinalScore>,
        team1: String,
        team2: String,
        start_time: i64,
        score1: i8,
        score2: i8,
    ) -> Result<()> {
        &mut ctx.accounts.submit_final_score(team1, team2, start_time, score1, score2, &ctx.bumps)?;

        // Pass ctx.remaining_accounts correctly
        let remaining_accounts= ctx.remaining_accounts.to_vec();
        ctx.accounts.settle_rewards_and_close_vault(remaining_accounts, &ctx.bumps)?;

        Ok(())
    }

}

