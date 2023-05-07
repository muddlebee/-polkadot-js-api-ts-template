const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	const api = await ApiPromise.create({ provider , noInitWarn: true});

	// Subscribe to events
	api.query.system.events((events) => {
		events.forEach((record) => {
			const { event, phase } = record;
			const eventName = event.method;

			// Check if the event is a batch call event
			if (eventName === 'Batch') {
				console.log(`\nBatch event found: ${event.toJSON()}`);

				// Access the associated extrinsics
				const extrinsics = event.data[0].toJSON();
				console.log(`\nExtrinsics in batch call: ${extrinsics}`);
			}
		});
	});
}

main().catch(console.error);
