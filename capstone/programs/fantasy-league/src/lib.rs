mod contexts;
mod state;

use contexts::*;
use state::*;

use anchor_lang::prelude::*;

declare_id!("FkDw72oGUgZb62C2A3jymQo2gRQoSwv2er2s47AhCHe8");

#[program]
pub mod fantasy_league {

    use super::*;

    pub fn create_match(ctx: Context<CreateMatch>, team1: String, team2: String, start_time: i64) -> Result<()> {
        ctx.accounts.create_match(team1, team2, start_time, &ctx.bumps)?;
        Ok(())
    }
}

