import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {FantasyLeague} from "../target/types/fantasy_league";

import {Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram} from "@solana/web3.js";
import {confirmTransaction} from '@solana-developers/helpers';
import {expect} from "chai";
import dayjs from 'dayjs';


describe("fantasy-league program allows to", () => {


    const time = dayjs().add(5, "hour").valueOf();
    // Configure the client to use the loca
    // dayjs().add(5, "hour" )l cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;
    const user = provider.wallet as anchor.Wallet;
    const fantasyPlayer1 = Keypair.generate();
    const fantasyPlayer2 = Keypair.generate();
    const fantasyPlayer3 = Keypair.generate();
    const startTime = Math.floor(time/1000); // Current timestamp in seconds
    const team1 = "FC Barcelona";
    const team2 = "Rayo Vallecano";

    const programId = new PublicKey('DN7ry5Ymg1Erzo8xmtgMSRZhnQV3PzezeAnvDW3FqPQ8');
    const admin = new PublicKey("3ztBce2GBtHKgK6cyWsrkVemULAdujwTGmsHQgSwWmQP");
    const program = anchor.workspace.FantasyLeague as Program<FantasyLeague>;

    before('Preparing environment for testing:', async () => {
        let tx1 = await provider.connection.requestAirdrop(
            admin,
            100 * LAMPORTS_PER_SOL
        );
        let tx2 = await provider.connection.requestAirdrop(
            fantasyPlayer1.publicKey,
            100 * LAMPORTS_PER_SOL
        );

        await provider.connection.requestAirdrop(
            fantasyPlayer2.publicKey,
            100 * LAMPORTS_PER_SOL
        );

        await provider.connection.requestAirdrop(
            fantasyPlayer3.publicKey,
            100 * LAMPORTS_PER_SOL
        );
        await confirmTransaction(connection, tx1, 'confirmed')
    });


    it("Create a match!", async () => {

        const seed = Buffer.from("fantasy_match");
        const seedTeam1 = Buffer.from(team1);
        const seedTeam2 = Buffer.from(team2);
        const startTimeBuffer = toLEBytes(startTime);
        const stake = new anchor.BN(3 * LAMPORTS_PER_SOL);


        const [matchPda, bump] = PublicKey.findProgramAddressSync(
            [seed, seedTeam1, seedTeam2, startTimeBuffer],
            program.programId
        );

        const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), matchPda.toBuffer()],
            program.programId
        );

        await program.methods
            .createMatch(team1, team2, new anchor.BN(startTime), stake)
            .accountsPartial({
                admin,
                fantasyMatch: matchPda,
                vault: vaultPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    });

    it("Retrieves data from a match", async () => {
        const seed = Buffer.from("fantasy_match");
        const seedTeam1 = Buffer.from(team1);
        const seedTeam2 = Buffer.from(team2);
        const startTimeBuffer = toLEBytes(startTime);


        const [matchPda, bump] = PublicKey.findProgramAddressSync(
            [seed, seedTeam1, seedTeam2, startTimeBuffer],
            program.programId
        );
        const matchData = await program.account.fantasyMatch.fetch(matchPda);
        expect(matchData.team1).to.equal(team1);
        expect(matchData.team2).to.equal(team2);
        expect(matchData.score1).to.eq(0);
        expect(matchData.score2).to.eq(0);
        expect(matchData.startTime.toNumber()).to.equal(startTime);
    });

    it("Input Match Predictions and update them", async () => {
        const seed = Buffer.from("fantasy_match");
        const seedTeam1 = Buffer.from(team1);
        const seedTeam2 = Buffer.from(team2);
        const startTimeBuffer = toLEBytes(startTime);


        const [matchPda, bump] = PublicKey.findProgramAddressSync(
            [seed, seedTeam1, seedTeam2, startTimeBuffer],
            program.programId
        );

        let [predictionPda, bump2] = PublicKey.findProgramAddressSync(
            [Buffer.from("prediction"), matchPda.toBuffer(), fantasyPlayer1.publicKey.toBuffer()],
            program.programId
        );

        let [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), matchPda.toBuffer()],
            program.programId
        );

        await program.methods
            .submitPrediction(team1, team2, new anchor.BN(startTime), 2, 0)
            .accountsPartial({
                player: fantasyPlayer1.publicKey,
                fantasyMatch: matchPda,
                matchPrediction: predictionPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([fantasyPlayer1])
            .rpc();

        let matchPredictionData = await program.account.matchPrediction.fetch(predictionPda);
        expect(matchPredictionData.score1).to.eq(2);
        expect(matchPredictionData.score2).to.eq(0);

        await program.methods
            .submitPrediction(team1, team2, new anchor.BN(startTime), 3, 2)
            .accountsPartial({
                player: fantasyPlayer1.publicKey,
                fantasyMatch: matchPda,
                matchPrediction: predictionPda,
                vault: vaultPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([fantasyPlayer1])
            .rpc();
        matchPredictionData = await program.account.matchPrediction.fetch(predictionPda);
        expect(matchPredictionData.score1).to.eq(3);
        expect(matchPredictionData.score2).to.eq(2);

        [predictionPda, bump2] = PublicKey.findProgramAddressSync(
            [Buffer.from("prediction"), matchPda.toBuffer(), fantasyPlayer2.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .submitPrediction(team1, team2, new anchor.BN(startTime), 1, 1)
            .accountsPartial({
                player: fantasyPlayer2.publicKey,
                fantasyMatch: matchPda,
                matchPrediction: predictionPda,
                vault: vaultPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([fantasyPlayer2])
            .rpc();
        matchPredictionData = await program.account.matchPrediction.fetch(predictionPda);
        expect(matchPredictionData.score1).to.eq(1);
        expect(matchPredictionData.score2).to.eq(1);

        [predictionPda, bump2] = PublicKey.findProgramAddressSync(
            [Buffer.from("prediction"), matchPda.toBuffer(), fantasyPlayer3.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
            .submitPrediction(team1, team2, new anchor.BN(startTime), 0, 0)
            .accountsPartial({
                player: fantasyPlayer3.publicKey,
                fantasyMatch: matchPda,
                matchPrediction: predictionPda,
                vault: vaultPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([fantasyPlayer3])
            .rpc();
        matchPredictionData = await program.account.matchPrediction.fetch(predictionPda);
        expect(matchPredictionData.score1).to.eq(0);
        expect(matchPredictionData.score2).to.eq(0);

    });

    it("allows an admin to submit the final result for a match", async () => {
        const seed = Buffer.from("fantasy_match");
        const seedTeam1 = Buffer.from(team1);
        const seedTeam2 = Buffer.from(team2);
        const startTimeBuffer = toLEBytes(startTime);

        let [matchPda, bump] = PublicKey.findProgramAddressSync(
            [seed, seedTeam1, seedTeam2, startTimeBuffer],
            program.programId
        );

        // Prepare the transaction
        await program.methods
            .submitFinalScore(team1, team2, new anchor.BN(startTime), 1, 1)
            .accountsPartial({
                admin,
                fantasyMatch: matchPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();



    });

    it.skip("settles the rewards",async()  =>{
        const seed = Buffer.from("fantasy_match");
        const seedTeam1 = Buffer.from(team1);
        const seedTeam2 = Buffer.from(team2);
        const startTimeBuffer = toLEBytes(startTime);
        let [matchPda, bump] = PublicKey.findProgramAddressSync(
            [seed, seedTeam1, seedTeam2, startTimeBuffer],
            program.programId
        );

        const [vaultPda, bump2] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), matchPda.toBuffer()],
            program.programId
        );

        let matchPredictions = await program.account.matchPrediction.all([
            {
                memcmp: {
                    offset: 8, // Skip Anchor's 8-byte discriminator
                    bytes: matchPda.toBase58(), // Match PDA filter
                },
            },
        ]);

        let adminAccount = await connection.getAccountInfo(admin);
        let player = await connection.getAccountInfo(fantasyPlayer2.publicKey);
        let vault = await connection.getAccountInfo(vaultPda);
        console.log(`Player lamports before ${player.lamports}`);
        console.log(`Admin lamports before ${adminAccount.lamports}`);
        console.log(`Vault lamports before ${vault.lamports}`);
        const matchData = await program.account.fantasyMatch.fetch(matchPda);
        let winners = [];
        for (let matchPrediction of matchPredictions) {
            if (matchPrediction.account.score1 === matchData.score1
                && matchPrediction.account.score2 === matchData.score2) {
                winners.push(matchPrediction);
                console.log(`Settling Rewards for ${matchPrediction.publicKey}, ${matchPda}, ${vaultPda}, ${matchPrediction.account.player}`);
                await program.methods
                    .settleRewards(new anchor.BN(1))
                    .accountsPartial({
                        admin,
                        fantasyMatch: matchPda,
                        vault: vaultPda,
                        systemProgram: SystemProgram.programId,
                        player: matchPrediction.account.player
                    })
                    .signers([admin])
                    .rpc();
            }
        }

        adminAccount = await connection.getAccountInfo(admin);
        player = await connection.getAccountInfo(fantasyPlayer2.publicKey);
        vault = await connection.getAccountInfo(vaultPda);
        console.log(`Player lamports after ${player.lamports}`);
        console.log(`Admin lamports after ${adminAccount.lamports}`);
        console.log(`Vault is closed =  ${vault === undefined}`);
    });




// it("Input Retrieves all Predictions", async () => {
//     const accounts = await connection.getProgramAccounts(programId);
//     for (let account of accounts) {
//         try {
//             const matchData = await program.account.matchPrediction.fetch(account.pubkey);
//             console.log(`Match found at address ${account.pubkey.toBase58()}:`, JSON.stringify(matchData));
//         } catch (e) {
//             console.log(`No match data at account ${account.pubkey.toBase58()}`);
//         }
//     }
//
// });

    function toLEBytes(value) {
        const buffer = new ArrayBuffer(8); // 8 bytes for i64
        const dataView = new DataView(buffer);
        dataView.setBigInt64(0, BigInt(value), true); // true for little-endian
        return new Uint8Array(buffer);
    }

})
;

