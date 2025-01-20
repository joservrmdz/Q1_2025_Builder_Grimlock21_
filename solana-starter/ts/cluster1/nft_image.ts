import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import {readFileSync} from "fs";

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        const image = await readFile("/Users/jose/RustroverProjects/2025/solana-starter/ts/cluster1/generug.png");
        //2. Convert image to generic file.
        let genericFile = createGenericFile(image,"rug.png",{contentType: "image/png"});
        //3. Upload image
        let upload = await umi.uploader.upload([genericFile]);
        // const image = ???

        // const [myUri] = ??? 
        console.log("Your image URI: ", upload);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
