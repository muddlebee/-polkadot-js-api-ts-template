const { ApiPromise, WsProvider } = require("@polkadot/api");

let api;

async function main() {
	const provider = new WsProvider("wss://kusama-rpc.polkadot.io");
	api = await ApiPromise.create({ provider , noInitWarn: true});
	const accountId = "HTyzs9XAxUpHpNe7Kwhp3M5kCJuxFm4AYRCpYjcHdhiVDFE";

	//judgment pending for this account
	//const accountId = "EwGFsop19Jm9GWALMvVWDiaiqPH4bAyTdwRBgGLAgbLD5B7";

	await getAllRegistrars();
	await getChildren(accountId);
	await getJudgements(accountId);
	await getPendingJudgements(accountId);
	api.disconnect();
}

async function getAllRegistrars() {
	const registrars = await api.query.identity.registrars();
	console.log("All registrars:");
	for (const maybeRegistrar of registrars) {
		const index = registrars.indexOf(maybeRegistrar);
		if (maybeRegistrar.isSome) {
			const registrar = maybeRegistrar.unwrap();
			console.log(`registrar`, registrar.toString());
			console.log(`account`, registrar.account.toString());
			const identity = await api.query.identity.identityOf(registrar.account.toString());
/* 			if (identity.isSome) {
				const identityU = identity.unwrap();
				const { info } = identityU;
				console.log(`identity`, info.toHuman());
				console.log(`Twitter`, info.twitter.asRaw.toHuman());
				console.log('Display:', info.display.asRaw.toHuman());
				console.log('Legal:', info.legal.asRaw.toHuman());
				console.log('Web:', info.web.asRaw.toHuman());
				console.log('Riot:', info.riot.asRaw.toHuman());
				console.log('Email:', info.email.asRaw.toHuman());
				console.log('Image:', info.image.asRaw.toHuman());
			} */
		}
	}
}


async function getChildren(accountId) {
	const children = await api.query.identity.subsOf(accountId);
	console.log("Children of account:", accountId);
	children.forEach((child) => {
		console.log(child.toString());
	});
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
