import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, StdFee} from "@cosmjs/stargate";
import { coins } from "@cosmjs/launchpad";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

const mnemonic = "enlist hip relief stomach skate base shallow young switch frequent cry park";
const rpcEndpoint = "http://sentry0.testnet.mantrachain.io:26657";

const signAndBroadcastTx = async (wallet: DirectSecp256k1HdWallet, recipient: string, amount: string, denom: string, fee: StdFee, memo: string = "") => {
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
  const [account] = await wallet.getAccounts();

  console.log(account.address);
  console.log(account.pubkey);

  const msgSend = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.fromPartial({
      fromAddress: account.address,
      toAddress: recipient,
      amount: coins(amount, denom),
    }),
  };

  // Sign the transaction
  const signingClient = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
  const signedTx = await signingClient.sign(account.address, [msgSend], fee, memo);
  console.log(signedTx);
  // Broadcast the transaction
  const txRaw = TxRaw.encode(signedTx).finish();
  const broadcastResult = await signingClient.broadcastTx(txRaw);
  return broadcastResult;
};

const runAll = async (): Promise<void> => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "mantra",
  });

  const recipient = "mantra1kt020racf4prpjz7jlnzs4z6l0xval0vf5jxww"; // Replace with the recipient's address
  const amountToSend = "1000"; // The amount to send
  const denomToSend = "uaum"; // The denom to send

  const fee: StdFee = {
    amount: coins(2000, "uaum"),
    gas: "200000",
  };

  const memo = "PKMT test";

  try {
    const result = await signAndBroadcastTx(wallet, recipient, amountToSend, denomToSend, fee, memo);
    console.log("Transaction result:", result);
  } catch (error) {
    console.error("Error signing and broadcasting transaction:", error);
  }
};

runAll();