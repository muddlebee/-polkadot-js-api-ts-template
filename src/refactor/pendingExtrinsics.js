// Import required packages
const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
  // Connect to a Kusama node
  const wsProvider = new WsProvider('wss://rpc.polkadot.io');

  const api = await ApiPromise.create({ provider: wsProvider });

  // Store a list of extrinsics seen in the blocks
  const seenExtrinsicHashes = new Set();

  // Subscribe to new block headers
  api.rpc.chain.subscribeNewHeads(async (header) => {
    console.log(` \n\n\n\n ################################
    New block: ${header.number}: ${header.hash} \n ################################ \n\n\n\n`);
      // Fetch the block and its extrinsics
      const blockHash = header.hash;
      const block = await api.rpc.chain.getBlock(blockHash);
      const extrinsics = block.block.extrinsics;

      // Add extrinsics to the seenExtrinsicHashes set
      extrinsics.forEach((extrinsic) => {
        const decodedExtrinsic = api.createType('Extrinsic', extrinsic);
        console.log(`  Hash: ${decodedExtrinsic.hash}`);
        seenExtrinsicHashes.add(decodedExtrinsic.hash);
      });

      // Fetch finalized block header
      const finalizedHeadHash = await api.rpc.chain.getFinalizedHead();
      const finalizedHeader = await api.rpc.chain.getHeader(finalizedHeadHash);
      console.log(`Finalized block #${finalizedHeader.number}: ${finalizedHeadHash}`);

      // Fetch the finalized block and its extrinsics
      const finalizedBlock = await api.rpc.chain.getBlock(finalizedHeadHash);
      const finalizedExtrinsics = finalizedBlock.block.extrinsics;

      // Remove finalized extrinsics from the seenExtrinsicHashes set
      finalizedExtrinsics.forEach((extrinsic) => {
        const decodedExtrinsic = api.createType('Extrinsic', extrinsic);
        console.log(`  Extrinsics not finalized:: ${decodedExtrinsic.hash}`);
        seenExtrinsicHashes.delete(decodedExtrinsic.hash);
      });

      // Print extrinsics that are not yet finalized
      //print hash from seenExtrinsicHashes
      for (const hash of seenExtrinsicHashes) {
        console.log(`  Extrinsics not finalized:: ${hash}`);
      }
  
  });
}

main().catch(console.error);
