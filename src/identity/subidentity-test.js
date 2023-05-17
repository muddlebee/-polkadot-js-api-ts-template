const { ApiPromise, WsProvider } = require("@polkadot/api");

let api;

async function main() {
	const provider = new WsProvider("wss://kusama-rpc.polkadot.io");
	api = await ApiPromise.create({ provider , noInitWarn: true});
	const accountId = "HTyzs9XAxUpHpNe7Kwhp3M5kCJuxFm4AYRCpYjcHdhiVDFE";

	//judgment pending for this account
	//const accountId = "EwGFsop19Jm9GWALMvVWDiaiqPH4bAyTdwRBgGLAgbLD5B7";

	await getJudgements(accountId);
	await getPendingJudgements(accountId);
	api.disconnect();
}


async function getJudgements(accountId) {
	const identityInfo = await api.query.identity.identityOf(accountId);
	if (identityInfo.isSome) {
		const identity = identityInfo.unwrap();
		const { judgements } = identity;
		console.log("Judgements for account:", accountId);
		judgements.forEach(([registrarIndex, judgement]) => {
			console.log(`Registrar #${registrarIndex.toString()}:`, judgement.toString());
		});
	} else {
		console.log(`No identity info found for account ${accountId}`);
	}
}

async function getPendingJudgements(accountId) {
	const identityInfo = await api.query.identity.identityOf(accountId);
	if (identityInfo.isSome) {
		const identity = identityInfo.unwrap();
		console.log(`identity`, identity.toString());
		const { judgements } = identity;
		console.log("Pending judgements for account:", accountId);
		judgements.forEach(([registrarIndex, judgement]) => {
			console.log(`judgement`, judgement.toString());
			if (judgement.isRequested) {
				console.log(`Registrar #${registrarIndex.toString()}:`, judgement.toString());
			}
		});
		judgements.forEach((judgement) => {
			// print judgement object
			console.log(`judgement json`, JSON.stringify(judgement));
		});
	} else {
		console.log(`No identity info found for account ${accountId}`);
	}
}


main();
