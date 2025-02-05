import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorMarketplaces } from "../target/types/anchor_marketplaces";

describe("anchor-marketplaces", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AnchorMarketplaces as Program<AnchorMarketplaces>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize("name", 10).rpc();
    console.log("Your transaction signature", tx);
  });
});
