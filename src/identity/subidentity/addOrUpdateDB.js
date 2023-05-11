const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const subIdentityToUpdate = {
	subAccountId: '5G5b5q5yQLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE',
	display: 'Updated Display',
	email: 'updated-email@example.com'
};

const subIdentityToAdd = {
	subAccountId: '5G7d7s7tQLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE1',
	display: 'New Sub Identity',
	email: 'new-sub-identity@example.com'
};

async function main() {
	try {
		await client.connect();
		await addOrUpdateDB(
			'5Gw3s7q4QLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE',
			subIdentityToUpdate,
			subIdentityToAdd
		);
	} catch (err) {
		console.error(`Error occurred while adding/updating sub-identity: ${err}`);
	} finally {
		await client.close();
	}
}

async function addOrUpdateDB(accountId, subIdentityToUpdate, subIdentityToAdd) {
	try {
		const db = client.db('kusama');
		const identityCollection = db.collection('identityTest');

		await identityCollection.drop();
		const newIdentity = {
			_id: '5fda0a5c7b89192c665e35d7',
			accountId: '5Gw3s7q4QLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE',
			display: 'Alice',
			web: '<https://alice.example.com>',
			subIdentities: [
				{
					subAccountId: '5G5b5q5yQLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE',
					display: 'Alice Sub 1',
					email: 'alice-sub1@example.com'
				},
				{
					subAccountId: '5G6c6r6zQLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE',
					display: 'Alice Sub 2',
					email: 'alice-sub2@example.com'
				}
			]
		};

		const result = await identityCollection.insertOne(newIdentity);
		// Update existing subIdentity
		const updateResult = await identityCollection.updateOne(
			{ accountId: accountId, 'subIdentities.subAccountId': subIdentityToUpdate.subAccountId },
			{ $set: { 'subIdentities.$': subIdentityToUpdate } }
		);
		console.log(
			`${updateResult.matchedCount} document(s) matched the filter, updated ${updateResult.modifiedCount} document(s)`
		);

		// Add new subIdentity
		const addResult = await identityCollection.updateOne(
			{ accountId: accountId },
			{ $addToSet: { subIdentities: subIdentityToAdd } }
		);
		console.log(
			`${addResult.matchedCount} document(s) matched the filter, updated ${addResult.modifiedCount} document(s)`
		);
	} catch (err) {
		console.error(`Error occurred while adding/updating sub-identity: ${err}`);
	}
}

main().catch(console.error);
