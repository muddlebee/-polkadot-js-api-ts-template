const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
	const provider = new WsProvider('wss://rpc.polkadot.io');
	const api = await ApiPromise.create({ provider });

	// Subscribe to new block headers
	const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
		console.log(`Block #${header.number} produced by ${header.author}`);

		// Retrieve the events and extrinsics for the current block
		const [events, extrinsics] = await Promise.all([
			api.query.system.events.at(header.hash),
			api.rpc.chain.getBlock(header.hash),
		]);

		// Iterate through the events
		events.forEach((record, index) => {
			const { event, phase } = record;
			console.log(`Event: ${event.section}.${event.method}`);

			// Check if the event is part of an extrinsic
			if (phase.isApplyExtrinsic) {
				const extrinsicIndex = phase.asApplyExtrinsic.toNumber();
				const extrinsic = extrinsics.block.extrinsics[extrinsicIndex];

				// Extract the accountId from the extrinsic
				const accountId = extrinsic.signer.toString();
				console.log(`Extrinsic: ${extrinsic.method.section}.${extrinsic.method.method}, AccountId: ${accountId}`);
			}
		});
	});

	// To stop listening to events, you can call the `unsubscribe` function
	// setTimeout(() => {
	//   unsubscribe();
	//   api.disconnect();
	// }, 60000);
}

main().catch(console.error);
