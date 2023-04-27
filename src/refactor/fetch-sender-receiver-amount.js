const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
  const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  api.rpc.chain.subscribeNewHeads(async (header) => {
    console.log(`New block #${header.number}: ${header.hash}`);

    const blockHash = header.hash;
    const events = await api.query.system.events.at(blockHash);

    events.forEach(({ phase, event }) => {
      const { method, section } = event;

      // Balances.Transfer event
      if (section === 'balances' && method === 'Transfer') {
        const [sender, receiver, amount] = event.data;
        console.log(`Balances.Transfer: Sender: ${sender}, Receiver: ${receiver}, Amount: ${amount}`);
      }
      // Staking.Bond event
      else if (section === 'staking' && method === 'Bond') {
        const [controller, value,] = event.data;
        console.log(`Staking.Bond: Sender: ${event.data.accountId}, Controller: ${controller}, Value: ${value}`);
      }
      // Democracy.Proposed event
      else if (section === 'democracy' && method === 'Proposed') {
        const [proposer, deposit,] = event.data;
        console.log(`Democracy.Proposed: Proposer: ${proposer}, Deposit: ${deposit}`);
      }
      // Democracy.Seconded event
      else if (section === 'democracy' && method === 'Seconded') {
        const [who, proposalIndex] = event.data;
        console.log(`Democracy.Seconded: Account: ${who}, Proposal index: ${proposalIndex}`);
      }
      // Crowdloan.Contribute event
      else if (section === 'crowdloan' && method === 'Contribute') {
        const [contributor, fundIndex, value] = event.data;
        console.log(`Crowdloan.Contribute: Contributor: ${contributor}, Fund index: ${fundIndex}, Value: ${value}`);
      }
      // Vesting.Vested event
      else if (section === 'vesting' && method === 'Vested') {
        const [who, amount] = event.data;
        console.log(`Vesting.Vested: Account: ${who}, Amount: ${amount}`);
      }
      // Treasury.Deposit event
      else if (section === 'treasury' && method === 'Deposit') {
        const [beneficiary, value] = event.data;
        console.log(`Treasury.Deposit: Beneficiary: ${beneficiary}, Value: ${value}`);
      }
      // Other events
      // Add more events here as needed, depending on the extrinsics you're interested in
    });
  });
}

main().catch(console.error);
