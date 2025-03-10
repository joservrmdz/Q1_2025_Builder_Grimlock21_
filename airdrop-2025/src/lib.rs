use solana_sdk::{signature::{Keypair, Signer}, pubkey::Pubkey};

#[cfg(test)]
mod tests {
    use solana_sdk;
    use solana_sdk::signature::{Keypair, Signer};

    #[test]
    fn keygen() {

        // Create a new keypair
        let kp = Keypair::new();
        println!("You've generated a new Solana wallet: {}", kp.pubkey().to_string()); println!("");
        println!("To save your wallet, copy and paste the following into a JSON file:");

        println!("{:?}", kp.to_bytes());
    }
    #[test]
    fn airdop() {}
    #[test]
    fn transfer_sol() {}
}