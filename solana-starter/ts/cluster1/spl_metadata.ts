import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import {
    createMetadataAccountV3,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args, fetchMetadataFromSeeds, updateV1
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Define our Mint address
const mint = publicKey("EDyR1Cy2Rx3NWxXV3X8GoaEh1MSsCSHoCzJutkHPfGD4")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: mint,
            mintAuthority: signer,
        }

        let data: DataV2Args = {
            name: "GrimlockCoin-2025",
            symbol: "$GRMLCK25$",
            uri: "https://bafybeib7ndcpd2eect4wscv3utacpbkitcxkvqi3wykoueiwx4gu7hd7na.ipfs.w3s.link/metadata.json",
            sellerFeeBasisPoints: 3,
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: false,
            collectionDetails: null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        );

        // const initialMetadata = await fetchMetadataFromSeeds(umi, { mint })
        // console.log(initialMetadata);
        // await updateV1(umi, {
        //     mint,
        //     authority: signer,
        //     data: { ...initialMetadata, name: "Dinobot\'s Coin", symbol: "$DINO$", uri: "https://bafybeihyfcq2runkkrpeeqpvbxxyjfgztwp4abj6modv4hiztco6bppoxm.ipfs.w3s.link/metadata.json" },
        // }).sendAndConfirm(umi)

        let result = await tx.sendAndConfirm(umi);

        // const signature = umi.transactions.deserialize(result.signature);
        console.log(bs58.encode(result.signature));
        console.log(`Succesfully Minted!. Transaction Here: https://explorer.solana.com/tx/${result.signature}cluster=devnet`)
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
