import { readFile } from "fs/promises"
import { DirectSecp256k1HdWallet, OfflineDirectSigner, makeSignDoc  } from "@cosmjs/proto-signing"
import { IndexedTx, SigningStargateClient, StargateClient, StdFee, GasPrice } from "@cosmjs/stargate"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import axios from 'axios'
import { coins } from "@cosmjs/launchpad";
import { createAddress, createWalletFromMnemonic, signTx } from '@tendermint/sig';

const mnemonic = 'reason comfort usage fix ship nuclear cream father human enjoy exhaust vote bitter cement hamster rose remove jealous awkward actress fiscal rather lumber fox';

const wallet = createWalletFromMnemonic(mnemonic);

const rpcEndpoint = "http://sentry0.testnet.mantrachain.io:26657";
const apiEndpoint = "https://api.testnet.mantrachain.io/cosmos/tx/v1beta1/txs";

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((await readFile("./testnet.alice.mnemonic.key")).toString(), {
        prefix: "mantra",
    })
}

const broadcastTx = async (txBytesBase64: any) => {
    const broadcastBody = {
        tx_bytes: txBytesBase64,
        mode: "BROADCAST_MODE_SYNC" // or BROADCAST_MODE_SYNC or BROADCAST_MODE_ASYNC
    };

    try {
        const response = await axios.post(apiEndpoint, broadcastBody, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error broadcasting transaction:', error);
    }
};

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpcEndpoint);
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight());
    console.log(
        "Alice balances:",
        await client.getAllBalances("mantra1kt020racf4prpjz7jlnzs4z6l0xval0vf5jxww")
    );

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic();
    const aliceAccountInfo = (await aliceSigner.getAccounts())[0];
    const aliceAddress = aliceAccountInfo.address;
    console.log("Alice's address from signer", aliceAddress);

    /*
    const alicePubkey = aliceAccountInfo.pubkey;
    if (alicePubkey) {
        // Convert the Uint8Array to a hex string.
        const alicePubkeyHex = Buffer.from(alicePubkey).toString('hex');
        console.log("Alice's public key (Uint8Array)", alicePubkey);
        console.log("Alice's public key (hex)", alicePubkeyHex);
    } else {
        console.log("Alice's public key is not available");
    }
    */

    const tx = {
        fee:  {
            amount: [{ amount: '0', denom: 'uaum' }],
            gas:    '10000'
        },
        memo: '',
        msg:  [{
            type:  'cosmos-sdk/MsgSend',
            value: {
                from_address: 'mantra14h6q6wrdct902et3p4khhdjhv59s9z0fwdf5hh',
                to_address:   'mantra1kt020racf4prpjz7jlnzs4z6l0xval0vf5jxww',
                amount:       [{ amount: '1000', denom: 'uaum' }]
            }
        }]
    };

    let chainId = await client.getChainId();
    console.log("Chain ID: " + chainId)
    const signMeta = {
        account_number: '1',
        chain_id:       chainId,
        sequence:       '0'
    };
    
    const stdTx = signTx(tx, signMeta, wallet);
    console.log(JSON.stringify(stdTx));
    const txBytesBase64 = Buffer.from(JSON.stringify(stdTx)).toString('base64');
    const result = await broadcastTx(txBytesBase64);
    
    console.log(result);
    
};

runAll()
