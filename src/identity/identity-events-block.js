const { ApiPromise, WsProvider } = require('@polkadot/api');

async function fetchIdentityEvents(api, address) {


  const blockNumber = '17596536';
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  const events = await api.query.system.events.at(blockHash);
  const block = await api.rpc.chain.getBlock(blockHash);

     for (const eventRecord of events) {
      const { event } = eventRecord;
      const { section, method } = event;

       if (api.events.identity.JudgementRequested.is(event)) {

       }
         if (section === 'identity') {
        let eventAddress = '';
        console.log(`event`,event.toString());
         // console.log(`Found identity-related event at block #${blockNumber}:`);
          console.log(`  Section: ${section}`);
          console.log(`  Method: ${method}`);
          console.log(`  Event data: ${event.data}`);

      }
    }
  }

async function main() {
  const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider , noInitWarn: true});

  const address = 'D3F5XpKS18xgf8DUxeMuD29FBSM1qJPL6S55JnQWtHn7PdN';
  const numberOfBlocks = 1000; // Number of past blocks to scan

  await fetchIdentityEvents(api, address, numberOfBlocks);

  api.disconnect();
}

main();
