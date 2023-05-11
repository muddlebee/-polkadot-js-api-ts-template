const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
	// Connect to a Polkadot node
	const wsProvider = new WsProvider('wss://rpc.polkadot.io');
	const api = await ApiPromise.create({ provider: wsProvider });

	// Replace this with the account ID you want to query
	const accountId = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFacTz';

	// Fetch the free balance of the account from the Balances pallet
	const freeBalance = await api.query.balances.freeBalance(accountId);
	console.log(`Free balance for account ${accountId}:`, freeBalance.toString());

	// Fetch the validator information for the account from the Staking pallet (if it's a validator)
	const validatorInfo = await api.query.staking.validators(accountId);
	if (validatorInfo.isSome) {
		console.log(`Validator information for account ${accountId}:`, validatorInfo.unwrap().toHuman());
	} else {
		console.log(`Account ${accountId} is not a validator.`);
	}

	// Disconnect from the Polkadot node
	api.disconnect();
}

main().catch(console.error);
