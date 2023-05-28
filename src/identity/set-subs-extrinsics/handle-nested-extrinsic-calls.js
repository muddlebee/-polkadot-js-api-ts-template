const { ApiPromise, WsProvider } = require('@polkadot/api');
const { GenericCall } = require("@polkadot/types");

async function handleExtrinsic(api, call) {
	const { section, method, args } = call;
	console.log(`Extrinsic: ${section}.${method}`);

/*	if(section === 'utility' && (method === 'batch' || method === 'batchAll')) {
		for (const c of call.args[0]) {
			console.log(`Batched call: ${c.section}.${c.method}`);
			console.log('Batched call:', c.toHuman());
			await handleExtrinsic(api, c)
		}
	}*/

	if(method === 'proposeCurator'){
		console.log('childBounties args', call.toHuman());
	}
	switch (section) {
	case 'identity':
		// handle identity method here
		break;
	case 'batch':
	case 'utility':
		for (const callData of call.args[0]) {
			console.log('batchAll:::::::::::::::::::::::::::::::::::', callData.toHuman());
			await handleExtrinsic(api, callData);
		}
		break;
	case 'proxy':
		await handleExtrinsic(api, call.args[2]);
		break;
	case 'multisig':
		await handleExtrinsic(api, call.args[3]);
		break;
	case 'sudo':
		await handleExtrinsic(api, call.args[0]);
		break;
	default:
		// handle other methods here
		break;
	}
}

async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	const api = await ApiPromise.create({ provider });

	const blockNumber = '18068116';
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const signedBlock = await api.rpc.chain.getBlock(blockHash);

	for (const extrinsic of signedBlock.block.extrinsics) {
		const methodCall = extrinsic.method;
		await handleExtrinsic(api, methodCall);
	}

	await api.disconnect();
}

main().catch(console.error);
