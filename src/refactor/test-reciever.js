// Import required packages
const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
  // Connect to a Kusama node
  const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  // Subscribe to new block headers
  api.rpc.chain.subscribeNewHeads(async (header) => {
    console.log(`New block #${header.number}: ${header.hash}`);

    try {
      // Fetch the block and its extrinsics
      const blockHash = header.hash;
      const block = await api.rpc.chain.getBlock(blockHash);
      const extrinsics = block.block.extrinsics;

      // Process each extrinsic
      extrinsics.forEach((extrinsic) => {
        const { method, signer, nonce } = extrinsic;
   //     console.log(`\t method.toJSON(): ${JSON.stringify(method)}`);
        const { method: methodName, section: pallet } = method.registry.findMetaCall(method.callIndex);

        console.log(`Extrinsic: ${pallet}.${methodName}, Signer: ${signer}, Nonce: ${nonce}`);

        let sender, receiver, value;

        if (pallet === 'balances' && methodName === 'transfer') {
          [receiver, value] = method.args;
          sender = signer;
        } else if (pallet === 'staking' && methodName === 'bond') {
          [receiver, value,] = method.args; // Here, the receiver represents the controller
          sender = signer; // Stash account
        } else if (pallet === 'multisig' && methodName === 'asMulti') {
          const [threshold, other_signatories, maybe_timepoint, call, store_call, max_weight] = method.args;
          if (call.callIndex === api.tx.balances.transfer.callIndex) {
            [receiver, value] = call.args;
            sender = signer;
          }
        } // Add more extrinsic types here as needed

        if (sender && receiver && value) {
          console.log(`\n\n Sender: ${sender}, Receiver: ${receiver}, Amount: ${value}`);
        }
      });
    } catch (error) {
      console.error('Error processing extrinsics:', error);
    }
  });
}

main().catch(console.error);
