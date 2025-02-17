import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {FantasyLeague} from "../target/types/fantasy_league";

// import wallet from ".//capstone/dev-wallet.json";
import {Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {confirmTransaction, makeKeypairs} from '@solana-developers/helpers';

// const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));


describe("fantasy-league", () => {

    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;
    const payer = provider.wallet as anchor.Wallet;

    const program = anchor.workspace.FantasyLeague as Program<FantasyLeague>;

    const admin = Keypair.generate();

    before('Preparing enviorement for testing:', async () => {
        console.log('--------- Airdroping Lamports ----------');

        //airdrop  Admin
        let tx1 = await provider.connection.requestAirdrop(
            admin.publicKey,
            2 * LAMPORTS_PER_SOL
        );
        await confirmTransaction(connection, tx1, 'confirmed');

    });


    it("Creates a match!", async () => {
        const team1 = "Team Alpha";
        const team2 = "Team Beta";
        const startTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds

        // Generate a new Keypair for the match account
        const matchAccount = anchor.web3.Keypair.generate();

        const tx = await program.methods
            .createMatch(team1, team2, new anchor.BN(startTime))
           .rpc();

        console.log("Transaction signature:", tx);
    });

    // it("Retrieves data from a match!", async () => {
    //   const team1 = "Team Alpha";
    //   const team2 = "Team Beta";
    //   const startTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    //
    //   // Generate a new Keypair for the match account
    //   const matchAccount = anchor.web3.Keypair.generate();
    //
    //   const tx = await program.methods
    //       .createMatch(team1, team2, new anchor.BN(startTime)).rpc();
    //
    //   console.log("Transaction signature:", tx);
    // });

});

