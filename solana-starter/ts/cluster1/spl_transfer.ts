import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("EVCgkUS3dGLYaK8Yk5iPZBmQBK1yobJ7bfZov2uXmq2A");

// Recipient address
const to = new PublicKey("AYnYh4u4tyANs9KJo1xegohEQcA2pWxeqHFMwUhE15eT");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromWallet = await getOrCreateAssociatedTokenAccount(connection,keypair, mint, keypair.publicKey);
        console.log(`My Wallet is ${fromWallet.address}`)

        // Get the token account of the toWallet address, and if it does not exist, create it
        const toWallet = await getOrCreateAssociatedTokenAccount(connection,keypair, mint, to);
        console.log(`recipient Wallet is ${toWallet.address}`)
        // Transfer the new token to the "toTokenAccount" we just created
        const tx = await transfer(connection, keypair,fromWallet.address, toWallet.address, keypair,1_000_000);
        console.log(`Transfer id is ${tx}`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();