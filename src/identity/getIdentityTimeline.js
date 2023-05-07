const { ApiPromise, WsProvider } = require('@polkadot/api');

async function getIdentityTimeline(api, accountId, startBlock = 0, endBlock = null) {
  if (!endBlock) {
    endBlock = (await api.rpc.chain.getBlock()).block.header.number.toNumber();
  }

  console.log('Identity timeline for account:', accountId);

  for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    const { block: { extrinsics } } = await api.rpc.chain.getBlock(blockHash);
    const events = await api.query.system.events.at(blockHash);

    extrinsics.forEach((extrinsic, index) => {
      if (extrinsic.signer.toString() === accountId) {
        const { method, section } = extrinsic.method;

        if (section === 'identity') {
          const eventName = `${section}_${method}`;

          if (events[index].event.data[0].toString() === accountId) {
            console.log(`Block #${blockNumber} - ${eventName}:`, extrinsic.method.args.toString());
          }
        }
      }
    });
  }
}

async function main() {
  const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  const accountId = 'YOUR_ACCOUNT_ID_HERE';

  await getIdentityTimeline(api, accountId);

  api.disconnect();
}

main().catch(console.error);
