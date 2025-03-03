use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke;
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

    #[account(
        mut,
        seeds= [b"vault", fantasy_match.key().as_ref()],
        bump,
        close = admin
    )]
    pub vault: Account<'info, RewardVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> SubmitFinalScore<'info> {
    pub fn submit_final_score(&mut self, _team1: String, _team2: String, _start_time: i64, score1: i8, score2: i8, bumps: &SubmitFinalScoreBumps,
    ) -> Result<()> {
        self.fantasy_match.score1 = score1;
        self.fantasy_match.score2 = score2;
        Ok(())
    }

    pub fn settle_rewards_and_close_vault<'settle>(&mut self,
                                          winners: Vec<AccountInfo<'info>>,
                                          bumps: &SubmitFinalScoreBumps,
    ) -> Result<()> {
        let number_of_winners = winners.len();
        require!(number_of_winners > 0, CustomError::NoWinners);

        let reward_per_winner = self.fantasy_match.stake / number_of_winners as u64;

        msg!(
            "Distributing {} lamports among {} winners",
            reward_per_winner,
            number_of_winners
        );

        let vault_account_info = self.vault.to_account_info();
        let vault_lamports = vault_account_info.try_borrow_mut_lamports()?;

        for winner in winners.iter() {
            let winner_key = winner.key;
            msg!("Sending {} lamports to {}", reward_per_winner, winner_key);

            require!(**vault_lamports >= reward_per_winner, CustomError::InsufficientFunds);

            let transfer_instruction = transfer(
                &vault_account_info.key, // From vault
                &winner.key,              // To winner
                reward_per_winner,        // Amount to transfer
            );
            invoke(
                &transfer_instruction,
                &[vault_account_info.clone(), winner.clone()],
            )?;
        }

        let remaining_lamports = self.vault.to_account_info().lamports();
        if remaining_lamports > 0 {
            msg!(
                "Sending remaining {} lamports to {}",
                remaining_lamports,
                self.admin.key
            );

            let transfer_instruction = transfer(
                &vault_account_info.key, // From vault
                &self.admin.key,         // To admin
                remaining_lamports,      // Remaining amount to transfer
            );
            invoke(
                &transfer_instruction,
                &[vault_account_info.clone(), self.admin.to_account_info()],
            )?;
        }

        msg!("Vault successfully closed.");

        Ok(())
    }
}
