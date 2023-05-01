const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	const api = await ApiPromise.create({ provider });

	const pendingJudgements = new Map();

	await api.query.system.events(async (events) => {
		events.forEach(({ event }) => {
			if (api.events.identity.JudgementRequested.is(event)) {
				const [accountId, registrarIndex] = event.data;
				const key = `${accountId}-${registrarIndex}`;
				pendingJudgements.set(key, { accountId: accountId.toString(), registrarIndex: registrarIndex.toNumber() });
			} else if (api.events.identity.JudgementGiven.is(event)) {
				const [accountId, registrarIndex] = event.data;
				const key = `${accountId}-${registrarIndex}`;
				pendingJudgements.delete(key);
			}
		});

		console.log('\nPending judgements:');
		for (const { accountId, registrarIndex } of pendingJudgements.values()) {
			console.log(`Account: ${accountId}, Registrar #${registrarIndex}`);
		}
	});

	// To disconnect, you can call `api.disconnect();` when needed.
}

main().catch(console.error);
