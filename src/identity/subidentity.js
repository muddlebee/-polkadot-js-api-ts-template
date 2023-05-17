const { ApiPromise, WsProvider } = require("@polkadot/api");

let api;

async function main() {
	const provider = new WsProvider("wss://kusama-rpc.polkadot.io");
	api = await ApiPromise.create({ provider });
	const accountId = "HTyzs9XAxUpHpNe7Kwhp3M5kCJuxFm4AYRCpYjcHdhiVDFE";
	await getAccount(accountId)
	api.disconnect();
}

async function getAccount(accountId) {
	const subIdentityAccount =  await api.query.identity.superOf(accountId);

	if(subIdentityAccount.isSome){
		const [, raw ] = subIdentityAccount.unwrap();
		const display = raw.asRaw.toHuman();
		console.log(`superAccount`, display);
	}
	console.log(`subIdentityAccount`, subIdentityAccount.toString());
	const identityInfo = await api.query.identity.identityOf(accountId);
	if (identityInfo.isSome) {
		const identity = identityInfo.unwrap();
		console.log(`identity`, identity.toString());
		const { judgements, deposit} = identity;
		console.log('deposit', deposit.toNumber());
		console.log("Pending judgements for account:", accountId);
		judgements.forEach(([registrarIndex, judgement]) => {
			if (judgement.isRequested) {
				console.log(`Registrar #${registrarIndex.toString()}:`, judgement.toString());
			}
		});
	} else {
		console.log(`No identity info found for account ${accountId}`);
	}
}


main();
