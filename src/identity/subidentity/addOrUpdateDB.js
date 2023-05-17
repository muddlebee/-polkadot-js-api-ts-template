const { client, getCol } = require('../db');

const subIdentityToUpdate = {
	subAccountId: '5G6c6r6zQLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE',
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
		//	await client.connect();
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
		const col = await getCol();
		// await identityCollection.drop();
		const newIdentity = {
			_id: '5fda0a5c7b89192c665e35d7',
			accountId: '5Gw3s7q4QLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE',
			display: 'Alice',
			web: '<https://alice.example.com>',
			subIdentities: [
				{
					subAccountId: '5G5b5q5yQLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE3',
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

		await col.updateOne({ accountId: accountId }, { $set: newIdentity }, { upsert: true });

		const identity = await col.findOne({
			accountId,
			'subIdentities.subAccountId': subIdentityToAdd.subAccountId
		});

		if (identity) {
			// Subidentity exists, update it
			const result = await col.updateOne(
				{
					accountId,
					'subIdentities.subAccountId': subIdentityToUpdate.subAccountId
				},
				{
					$set: {
						'subIdentities.$': subIdentityToUpdate
					}
				}
			);
			console.log(`${result.modifiedCount} document(s) was/were updated.`);
		} else {
			// Subidentity doesn't exist, add it
			const result = await col.updateOne(
				{ accountId },
				{
					$push: {
						subIdentities: subIdentityToAdd
					}
				}
			);
			console.log(`${result.modifiedCount} document(s) was/were updated.`);
		}
	} catch (err) {
		console.error(`Error occurred while adding/updating sub-identity: ${err}`);
	}
}

main().catch(console.error);
