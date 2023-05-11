const { ApiPromise, WsProvider } = require('@polkadot/api');

async function fetchIdentityEvents(api) {
	const blockNumber = '17664915';
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);
	const block = await api.rpc.chain.getBlock(blockHash);

	for (const eventRecord of events) {
		const { event, phase } = eventRecord;
		const { section, method } = event;

		if (api.events.identity.SubIdentityAdded.is(event)) {
			console.log(`Found identity-related event at block #${blockNumber}:`);

			if (phase.isApplyExtrinsic) {
				const extrinsicIndex = phase.asApplyExtrinsic.toNumber();
				const extrinsic = block.block.extrinsics[extrinsicIndex];

				console.log(`Extrinsic : ${JSON.stringify(extrinsic.toHuman())}`);

				// Extract the accountId from the extrinsic
				const accountId = extrinsic.signer.toString();
				console.log(
					`Extrinsic: ${extrinsic.method.section}.${extrinsic.method.method}, AccountId: ${accountId}`
				);
			}
			//fetch extrinsic of event

			if (section === 'identity') {
				const accountId = event.data[0].toString();
				console.log(`event`, event.toString());
				console.log(`  Section: ${section}`);
				console.log(`  Method: ${method}`);
				console.log(`  Event data: ${event.data}`);
			}
		}
	}
}

async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	const api = await ApiPromise.create({ provider, noInitWarn: true });
	await fetchIdentityEvents(api);

	api.disconnect();
}

main();
