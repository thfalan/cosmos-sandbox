import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { coins, DirectSecp256k1HdWallet, SigningCosmWasmClient } from "cosmwasm";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const runAll = async (): Promise<void> => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    "enlist hip relief stomach skate base shallow young switch frequent cry park",
    { prefix: "mantra" }
  );
  
  // Create a client connected an RPC endpoint
  const client = await SigningCosmWasmClient.connect(
    "http://sentry0.testnet.mantrachain.io:26657",
  );
  
  // Create an offline client for signing the transaction
  const offline = await SigningCosmWasmClient.offline(wallet);
  
  // Get the account address
  const account = await wallet.getAccounts();
  
  // Encode a send message.
  const msg = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.fromPartial({
      fromAddress: account[0].address,
      toAddress: "mantra1kt020racf4prpjz7jlnzs4z6l0xval0vf5jxww",
      amount: coins(1000, "uaum"),
    }),
  };
  const fee = {
    amount: coins(2000, "uaum"),
    gas: "200000",
  };
  const memo = "PKMT test";
  
  // Sign a message
  const signed = await offline?.sign(account[0].address, [msg], fee, memo);
  
  // Broadcast the transaction the transaction, note it must be encode as raw protobuf transaction
  client
    .broadcastTx(Uint8Array.from(TxRaw.encode(signed).finish()))
    .then((res) => {
      console.log(res);
    });32
};


runAll();