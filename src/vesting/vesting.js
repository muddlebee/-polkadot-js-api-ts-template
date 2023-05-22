const { ApiPromise, WsProvider } = require('@polkadot/api');

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	const api = await ApiPromise.create({ provider });
	const accountId = 'DtRgaYr63H1JuDz6UUfihiAKEGfERrHuAaWxTD1ryzx5w3Q';
	const accountInfo = await api.query.vesting.vesting(accountId);
	console.log(`accountInfo`, JSON.stringify(accountInfo.isSome));
	const vestingStorage = await api.query.vesting.storageVersion()
	console.log(`vestingStorage`, JSON.stringify(vestingStorage));
	const history = await api.query.system.account(accountId);
	console.log(`history`, JSON.stringify(history));


	// await getIdentity(accountId);
	await api.disconnect();
}

main();
