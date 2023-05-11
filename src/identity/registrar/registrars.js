const { ApiPromise, WsProvider } = require('@polkadot/api');

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let api;
async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	api = await ApiPromise.create({ provider });
	await getAllRegistrars();
	api.disconnect();
}

async function dropCollectionRegistrars() {
	try {
		await client.connect();
		const db = client.db('kusama');
		const timelineEvents = db.collection('registrars');
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
		const timelineEvents = db.collection('registrars');
		await timelineEvents.updateOne({ index: event.index }, { $set: event }, { upsert: true });
		console.log('Event updated');
	} catch (err) {
		console.error(err);
	} finally {
		await client.close();
	}
}

async function getAllRegistrars() {
	const registrars = await api.query.identity.registrars();
	console.log(`total registrars`, registrars.length);
	for (const registrar of registrars) {
		let registrarInfo = {};
		registrarInfo.index = registrars.indexOf(registrar);
		if (registrar.isSome) {
			let accountId = registrar.unwrap().account.toString();
			registrarInfo.accountId = accountId;
			const identity = await api.query.identity.identityOf(accountId);
			if (identity.isSome) {
				const { info } = identity.unwrap();
				registrarInfo.identity = {
					display: info.display.asRaw.toHuman(),
					legal: info.legal.asRaw.toHuman(),
					web: info.web.asRaw.toHuman(),
					riot: info.riot.asRaw.toHuman(),
					email: info.email.asRaw.toHuman(),
					image: info.image.asRaw.toHuman(),
					twitter: info.twitter.asRaw.toHuman(),
					pgpFingerprint: info.pgpFingerprint.isSome ? info.pgpFingerprint.unwrap().toHex() : null
				};
				registrarInfo.ok = true;
			}
		}
		console.log(`registrarInfo`, registrarInfo);
		updateRegistrars(registrarInfo);
	}
}

main();
