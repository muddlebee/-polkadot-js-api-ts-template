const { ApiPromise, WsProvider } = require('@polkadot/api');

async function fetchIdentityEvents(api, address, numberOfBlocks) {
  const currentHeader = await api.rpc.chain.getHeader();
  const currentBlockNumber = currentHeader.number.toNumber();
  const startBlockNumber = Math.max(currentBlockNumber - numberOfBlocks, 0);

  for (let blockNumber = startBlockNumber; blockNumber <= currentBlockNumber; blockNumber++) {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    const events = await api.query.system.events.at(blockHash);

    for (const eventRecord of events) {
      const { event } = eventRecord;
      const { section, method } = event;

      if (section === 'identity') {
        let eventAddress = '';
          console.log(`Found identity-related event at block #${blockNumber}:`);
          console.log(`  Section: ${section}`);
          console.log(`  Method: ${method}`);
          console.log(`  Event data: ${event.data}`);
        
      }
    }
  }
}

async function main() {
  const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });

  const address = 'D3F5XpKS18xgf8DUxeMuD29FBSM1qJPL6S55JnQWtHn7PdN';
  const numberOfBlocks = 1000; // Number of past blocks to scan

  await fetchIdentityEvents(api, address, numberOfBlocks);

  api.disconnect();
}

main();
