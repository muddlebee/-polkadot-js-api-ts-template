const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
  const wsProvider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  const seenExtrinsicHashes = new Map();
  const finalizedExtrinsicHashes = new Set();

  api.rpc.chain.subscribeNewHeads(async (header) => {
    console.log(`New block #${header.number}: ${header.hash}`);

    try {
      const blockHash = header.hash;
      const block = await api.rpc.chain.getBlock(blockHash);
      const extrinsics = block.block.extrinsics;

      const events = await api.query.system.events.at(blockHash);

      for (const extrinsic of extrinsics) {
        const { method, section } = extrinsic.method;
        const extrinsicHash = extrinsic.toHex();

        if (!seenExtrinsicHashes.has(extrinsicHash)) {
          let details = { method: `${section}.${method}` };

          const extrinsicIdx = extrinsics.indexOf(extrinsic);
          const extrinsicEvents = events.filter(
            (event) =>
              event.phase.isApplyExtrinsic &&
              event.phase.asApplyExtrinsic.toNumber() === extrinsicIdx
          );

          details.events = extrinsicEvents.map((event) => {
            const { method, section } = event.event;
            const eventData = {
              method: `${section}.${method}`,
              data: event.data.map((data) => data.toString()),
            };

            // Add specific extrinsic details based on event.method and event.section
            if (section === 'balances' && (method === 'Transfer' || method === 'TransferKeepAlive')) {
              const [, from, to, amount] = event.data;
              eventData.sender = from.toString();
              eventData.receiver = to.toString();
              eventData.value = amount.toString();
            }

            // Add other extrinsic details based on event.method and event.section here

            return eventData;
          });

          seenExtrinsicHashes.set(extrinsicHash, details);
        }
      }

      const finalizedHeadHash = await api.rpc.chain.getFinalizedHead();
      const finalizedHeader = await api.rpc.chain.getHeader(finalizedHeadHash);
      console.log(`Finalized block #${finalizedHeader.number}: ${finalizedHeadHash}`);

      const finalizedBlock = await api.rpc.chain.getBlock(finalizedHeadHash);
      const finalizedExtrinsics = finalizedBlock.block.extrinsics;

      finalizedExtrinsics.forEach((extrinsic) => {
        finalizedExtrinsicHashes.add(extrinsic.toHex());
      });

      const notFinalizedExtrinsicHashes = Array.from(seenExtrinsicHashes.keys()).filter((hash) => !finalizedExtrinsicHashes.has(hash));

      console.log('Extrinsics not finalized:', notFinalizedExtrinsicHashes);
      notFinalizedExtrinsicHashes.forEach((hash) => {
        console.log(`Extrinsic ${hash} details:`, seenExtrinsicHashes.get(hash));
      });
    } catch (error) {
      console.error('Error fetching extrinsics:', error);
    }
  });
}

main().catch(console.error);
