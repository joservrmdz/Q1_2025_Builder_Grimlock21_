import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FantasyLeague } from "../../../fantasy-league/target/types/fantasy_league";

describe("fantasy-league", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.FantasyLeague as Program<FantasyLeague>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.createMatch("olimpia", "motagua", Date.now()).rpc();
    console.log("Your transaction signature", tx);
  });
});
