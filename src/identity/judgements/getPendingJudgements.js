const { ApiPromise, WsProvider } = require("@polkadot/api");

async function fetchIdentityEvents(api) {


	const blockNumber = "17740803";
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);

	for (const eventRecord of events) {
		const { event } = eventRecord;
		const { section, method } = event;
		//  console.log(`event`, event.toString());
		if (api.events.identity.JudgementGiven.is(event)) {
			api.events.identity.BatchCompleted;
			if (section === "identity") {
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
	const provider = new WsProvider("wss://kusama-rpc.polkadot.io");
	const api = await ApiPromise.create({ provider, noInitWarn: true });
	await fetchIdentityEvents(api);

	api.disconnect();
}

main();
