const { ApiPromise, WsProvider } = require("@polkadot/api");

async function fetchIdentityEvents(api) {


	const blockNumber = "17769329";
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const block = await api.rpc.chain.getBlock(blockHash);
	const events = await api.query.system.events.at(blockHash);

	const extrinsics = block.block.extrinsics;

	extrinsics.forEach((extrinsic,index) => {
		const method = extrinsic.method;

		// Check if the extrinsic is a batch call
		if (method.method === 'batch' && method.section === 'utility') {
			console.log(`JSON of batch call: ${JSON.stringify(method.toJSON())}`);
			const calls = extrinsic.args[0];

			// Iterate through the batched calls
			calls.forEach((call) => {
				console.log(`Event inside batch call: ${call.section}.${call.method}`);
			});

			events.forEach(({ phase, event }) => {
				// Check if the event is associated with the extrinsic
				if (phase.       && phase.asApplyExtrinsic.toNumber() === index) {
					console.log(`  Event: ${event.section}.${event.method}`);
				}
			});
		}
	});
}

async function main() {
	const provider = new WsProvider("wss://kusama-rpc.polkadot.io");
	const api = await ApiPromise.create({ provider, noInitWarn: true });
	await fetchIdentityEvents(api);

	api.disconnect();
}

main();
