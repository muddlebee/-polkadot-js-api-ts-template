const { ApiPromise, WsProvider } = require('@polkadot/api');

async function fetchIdentityEvents(api) {
	const blockNumber = '17884357';
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);

	for (const eventRecord of events) {
		const { event } = eventRecord;
		const { section, method } = event;
		//  console.log(`event`, event.toString());
		if (api.events.identity.IdentitySet.is(event)) {
			if (section === 'identity') {
				const accountId = event.data[0].toString();
				let identityInfo = await getIdentityStorage(api, accountId);
				console.log(`identityInfo: ${JSON.stringify(identityInfo)}`);
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


async function getIdentityStorage(api, accountId) {
	try {
		const accountId32 = api.createType('AccountId32', accountId);
		console.log("getIdentityStorage accountId: ", accountId32.toHuman());

		const identityInfo = await api.query.identity.identityOf(accountId32);
		let identity = {};
		if (identityInfo.isSome) {
			const {info, judgements, deposit} = identityInfo.unwrap();
			identity.info = {
				display: info.display.asRaw.toUtf8(),
				legal: info.legal.asRaw.toHuman(),
				web: info.web.asRaw.toHuman(),
				riot: info.riot.asRaw.toHuman(),
				email: info.email.asRaw.toHuman(),
				image: info.image.asRaw.toHuman(),
				twitter: info.twitter.asRaw.toHuman(),
				pgpFingerprint: info.pgpFingerprint.isSome ? info.pgpFingerprint.unwrap().toHex() : null,
			};
			if (judgements.length > 0) {
				let judgementsList = [];
				judgements.forEach(([registrarIndex, judgement]) => {
					let judgementInfo = {
						registrarIndex: registrarIndex.toNumber(),
						judgement: judgement.toString()
					};
					judgementsList.push(judgementInfo);
				});
				identity.judgements = judgementsList;
			}
		}
		identity.accountId = accountId;

		return identity;
	} catch (error) {
		console.error('An error occurred:', error);
	}

}

main();
