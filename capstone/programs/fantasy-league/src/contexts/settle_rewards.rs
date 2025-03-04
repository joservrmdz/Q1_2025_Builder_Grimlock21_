use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke;
use crate::state::{*};

#[derive(Accounts)]
pub struct SettleReward<'info> {

    #[account(
        mut,
    )]
    pub fantasy_match: Account<'info, FantasyMatch>,

    #[account(
        mut,
        close = admin
    )]
    pub vault: Account<'info, RewardVault>,

    /// CHECK:
    #[account(mut)]
    pub player: AccountInfo<'info>,


    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,

}

impl<'info> SettleReward<'info> {
    pub fn settle_rewards_and_close_vault(&mut self,
                                          number_of_winners: i64,
                                          bumps: &SettleRewardBumps,
    ) -> Result<()> {
        require!(number_of_winners > 0, CustomError::NoWinners);

        let reward_per_winner = self.fantasy_match.stake / number_of_winners as u64;


        let vault_account_info = self.vault.to_account_info();
        let mut vault_lamports = vault_account_info.try_borrow_mut_lamports()?;



        let winner_key = self.player.key;
        msg!("Sending {} lamports to {}", reward_per_winner, winner_key);

        require!(**vault_lamports >= reward_per_winner, CustomError::InsufficientFunds);
        drop(vault_lamports);

        let transfer_instruction = transfer(
            &vault_account_info.key, // From vault
            &self.player.key(),              // To winner
            reward_per_winner,        // Amount to transfer
        );
        invoke(
            &transfer_instruction,
            &[vault_account_info.clone().to_account_info(), self.player.to_account_info(),self.system_program.to_account_info() ],
        )?;
        //
        // drop(vault_account_info);
        //
        // let remaining_lamports = self.vault.to_account_info().lamports();
        // if remaining_lamports > 0 {
        //     msg!(
        //         "Sending remaining {} lamports to {}",
        //         remaining_lamports,
        //         self.admin.key
        //     );
        //
        //     let vault_account_info = self.vault.to_account_info(); // Re-borrow `vault`
        //     let transfer_instruction = transfer(
        //         &vault_account_info.key, // From vault
        //         &self.admin.key,         // To admin
        //         remaining_lamports,      // Remaining amount to transfer
        //     );
        //     invoke(
        //         &transfer_instruction,
        //         &[vault_account_info.clone(), self.admin.to_account_info()],
        //     )?;
        //
        // }
        //
        // msg!("Vault successfully closed.");
        //
        Ok(())
    }
}