const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
  const wsProvider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  const seenExtrinsicHashes = new Map();
  const finalizedExtrinsicHashes = new Set();

  api.rpc.chain.subscribeNewHeads(async (header) => {
    console.log(`\n
 ################################\n New block #${header.number}: ${header.hash} `);

    try {
      const blockHash = header.hash;
      const block = await api.rpc.chain.getBlock(blockHash);
      const extrinsics = block.block.extrinsics;
      const events = await api.query.system.events.at(blockHash);

      extrinsics.forEach((extrinsic, index) => {
        const { method, section } = extrinsic.method;
        const extrinsicHash = extrinsic.hash.toHex();

        if (!seenExtrinsicHashes.has(extrinsicHash)) {
          let details = { method: `${section}.${method}` };
          const extrinsicEvents = events
            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic &&
                phase.asApplyExtrinsic.eq(index)
            )

          details.events = extrinsicEvents.map((event) => {
            console.log(`event is ${JSON.stringify(event)}`)
            const { method, section } = event;
            //print method and section
            console.log(`method is ${method} and section is ${section}`)
            const eventData = {};

            if (section === 'balances' && (method === 'Transfer' || method === 'TransferKeepAlive')) {
              const [, from, to, amount] = event.data;
              eventData.sender = from.toString();
              eventData.receiver = to.toString();
              eventData.value = amount.toString();
            }

            // Add other extrinsic details based on event.method and event.section here

            return eventData;
          });

          if (extrinsic.isSigned) {
            console.log(`Details of signed extrinsic ${extrinsicHash} are ${JSON.stringify(details)} \n`)
            seenExtrinsicHashes.set(extrinsicHash, details);
          }
        }
      });

      const finalizedHeadHash = await api.rpc.chain.getFinalizedHead();
      const finalizedHeader = await api.rpc.chain.getHeader(finalizedHeadHash);
      console.log(` Finalized block #${finalizedHeader.number}: ${finalizedHeadHash} \n ################################ \n`);

      const finalizedBlock = await api.rpc.chain.getBlock(finalizedHeadHash);
      const finalizedExtrinsics = finalizedBlock.block.extrinsics;

      finalizedExtrinsics.forEach((extrinsic) => {
        finalizedExtrinsicHashes.add(extrinsic.hash.toHex());
      });

      const notFinalizedExtrinsics = new Map(
        Array.from(seenExtrinsicHashes.entries()).filter(([hash]) => !finalizedExtrinsicHashes.has(hash))
      );

      notFinalizedExtrinsics.forEach((v, k) => {
        if (v.events.length > 0) {
         console.log(`notFinalizedExtrinsics of hash ${k} are ${JSON.stringify(v)} \n
`)
        }
      });
    } catch (error) {
      console.error('Error fetching extrinsics:', error);
    }
  });
}

main().catch(console.error);
