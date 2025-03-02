import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {FantasyLeague} from "../target/types/fantasy_league";

import {Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram} from "@solana/web3.js";
import {confirmTransaction} from '@solana-developers/helpers';
import {expect} from "chai";
import * as crypto from "crypto";


describe("fantasy-league program allows to", () => {

    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;
    const user = provider.wallet as anchor.Wallet;
    const player = Keypair.generate();
    const startTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const team1 = "FC Barcelona";
    const team2 = "Rayo Vallecano";

    const programId = new PublicKey('DN7ry5Ymg1Erzo8xmtgMSRZhnQV3PzezeAnvDW3FqPQ8');
    const admin = new PublicKey("3ztBce2GBtHKgK6cyWsrkVemULAdujwTGmsHQgSwWmQP");
    const program = anchor.workspace.FantasyLeague as Program<FantasyLeague>;

    console.log(`User ${JSON.stringify(user)}`);

    before('Preparing environment for testing:', async () => {
        let tx1 = await provider.connection.requestAirdrop(
            admin,
            2 * LAMPORTS_PER_SOL
        );
        let tx2 = await provider.connection.requestAirdrop(
            player.publicKey,
            2 * LAMPORTS_PER_SOL
        );
        await confirmTransaction(connection, tx1, 'confirmed')
    });


    it("Create a match!", async () => {

        const seed = Buffer.from("fantasy_match");
        const seedTeam1 = Buffer.from(team1);
        const seedTeam2 = Buffer.from(team2);
        const startTimeBuffer = toLEBytes(startTime);
        const stake =  5;


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

    it("Retrieve data from a match", async () => {
        const seed = Buffer.from("fantasy_match");
        const seedTeam1 = Buffer.from(team1);
        const seedTeam2 = Buffer.from(team2);
        const startTimeBuffer = toLEBytes(startTime);


        const [pda, bump] = PublicKey.findProgramAddressSync(
            [seed, seedTeam1, seedTeam2, startTimeBuffer],
            program.programId
        );
        const matchData = await program.account.fantasyMatch.fetch(pda);
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

        const [predictionPda, bump2] = PublicKey.findProgramAddressSync(
            [Buffer.from("prediction"), matchPda.toBuffer(), player.publicKey.toBuffer()],
            program.programId
        );
        await program.methods
            .submitPrediction(team1, team2, new anchor.BN(startTime), 2,  0)
            .accountsPartial({
                player: player.publicKey,
                fantasyMatch: matchPda,
                matchPrediction: predictionPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([player])
            .rpc();

        let matchPredictionData = await program.account.matchPrediction.fetch(predictionPda);
        expect(matchPredictionData.score1).to.eq(2);
        expect(matchPredictionData.score2).to.eq(0);

        await program.methods
            .submitPrediction(team1, team2, new anchor.BN(startTime), 3, 2)
            .accountsPartial({
                player: player.publicKey,
                fantasyMatch: matchPda,
                matchPrediction: predictionPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([player])
            .rpc();
        matchPredictionData = await program.account.matchPrediction.fetch(predictionPda);
        expect(matchPredictionData.score1).to.eq(3);
        expect(matchPredictionData.score2).to.eq(2);

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

});

