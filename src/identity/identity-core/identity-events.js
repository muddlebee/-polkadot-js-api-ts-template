const { ApiPromise, WsProvider } = require('@polkadot/api');

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let api;
async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	api = await ApiPromise.create({ provider });
	const accountId = 'HTyzs9XAxUpHpNe7Kwhp3M5kCJuxFm4AYRCpYjcHdhiVDFE';
	await getIdentity(accountId);
	api.disconnect();
}

async function dropCollectionRegistrars() {
	try {
		await client.connect();
		const db = client.db('kusama');
		const timelineEvents = db.collection('identity');
		await timelineEvents.drop();
		console.log('Collection dropped');
	} catch (err) {
		console.error(err);
	} finally {
		await client.close();
	}
}

async function insertRegistrars(event) {
	try {
		await client.connect();
		const db = client.db('kusama');
		const timelineEvents = db.collection('registrars');
		await timelineEvents.insertOne(event);
		console.log('Event inserted');
	} catch (err) {
		console.error(err);
	} finally {
		await client.close();
	}
}

//update the registrar collection
async function updateRegistrars(event) {
	try {
		await client.connect();
		const db = client.db('kusama');
		const timelineEvents = db.collection('identity');
		await timelineEvents.updateOne({ index: event.accountId }, { $set: event }, { upsert: true });
		console.log('Event updated');
	} catch (err) {
		console.error(err);
	} finally {
		await client.close();
	}
}

//delete the identity collection if accountId is matched
async function deleteIdentity(accountId) {
	try {
		await client.connect();
		const db = client.db('kusama');
		const timelineEvents = db.collection('identity');
		await timelineEvents.deleteOne({ accountId: accountId });
		console.log('Event deleted');
	} catch (err) {
		console.error(err);
	} finally {
		await client.close();
	}
}

async function getIdentity(accountId) {
	let registrarInfo = {};
	const identity = await api.query.identity.identityOf(accountId);
	if (identity.isSome) {
		const { info, judgements, deposit } = identity.unwrap();
		registrarInfo = {
			display: info.display.asRaw.toHuman(),
			legal: info.legal.asRaw.toHuman(),
			web: info.web.asRaw.toHuman(),
			riot: info.riot.asRaw.toHuman(),
			email: info.email.asRaw.toHuman(),
			image: info.image.asRaw.toHuman(),
			twitter: info.twitter.asRaw.toHuman(),
			pgpFingerprint: info.pgpFingerprint.isSome ? info.pgpFingerprint.unwrap().toHex() : null,
			deposit: deposit.toHuman()
		};

		if (judgements) {
			let judgementsList = [];
			judgements.forEach(([registrarIndex, judgement]) => {
				let judgementInfo = {
					registrarIndex: registrarIndex.toNumber(),
					judgement: judgement.toString()
				};
				judgementsList.push(judgementInfo);
				console.log(`Registrar `, judgementInfo);
			});
			registrarInfo.judgements = judgementsList;
		}
	}
	registrarInfo.accountId = accountId;
	registrarInfo.updatedAt = new Date();
	console.log(`registrarInfo`, registrarInfo);
	updateRegistrars(registrarInfo);
}

main().catch(console.error);
