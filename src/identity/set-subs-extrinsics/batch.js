const { ApiPromise, WsProvider } = require('@polkadot/api');
const { GenericCall } = require("@polkadot/types");

async function printExtrinsics(api) {
	const blockNumber = "18057711";
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);
	const signedBlock = await api.rpc.chain.getBlock(blockHash);

	for (const extrinsic of signedBlock.block.extrinsics) {
		const { method: { method, section } } = extrinsic;

		// If the extrinsic is a batch or batchAll, we iterate over the calls inside it
		if ((section === 'utility' && (method === 'batch' || method === 'batchAll'))) {
			console.log('extrinsic', extrinsic.toHuman());
			const calls = extrinsic.method.args[0];
			console.log('Batched call:', calls.toHuman());

			for (const call of calls) {
				console.log('Extrinsic:', call.toHuman());
				console.log(`Batched call: ${call.section}.${call.method}`);
			}
		} else {
			console.log(`Extrinsic: ${section}.${method}`);
		}
	}
}

async function printProxyExtrinsics(api) {
	const blockNumber = '18058089';
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);
	const signedBlock = await api.rpc.chain.getBlock(blockHash);

	for (const extrinsic of signedBlock.block.extrinsics) {
		const { method: { method, section } } = extrinsic;

		if (section === 'proxy') {
			console.log(`Extrinsic: ${JSON.stringify(extrinsic.toHuman())}`);
			const proxyType = extrinsic.method.args[0].toString();
			const realExtrinsic = extrinsic.method.args;
			console.log(`Proxy ${proxyType}`);
			console.log(`Real extrinsic signer: ${JSON.stringify(realExtrinsic)}`);
			const [, , innerCall] = extrinsic.method.args;
      console.log(`innerCall`,innerCall.toHuman());

		}
	}
}

// print multiSig extrinsics
async function printMultiSigExtrinsics(api) {
	const blockNumber = '18068116';
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);
	const signedBlock = await api.rpc.chain.getBlock(blockHash);

	for (const extrinsic of signedBlock.block.extrinsics) {
		const { method: { method, section } } = extrinsic;

		if (section === 'multisig') {
			const proxyType = extrinsic.method.args[0].toString();
			const realExtrinsic = extrinsic.method.args;
			for(const arg of realExtrinsic) {
				console.log(`arg`, arg.toHuman());
			}
			const callHex = extrinsic.method.args[3];
			console.log(`callHex`, callHex.toJSON());
			const innerCall = callHex.args[0];

			for (const arg of innerCall) {
				console.log(`innerCall`, arg.toHuman());
			}
			console.log(`call`, JSON.stringify(innerCall));
		}
	}
}

async function printMultiSig(api) {
	const blockNumber = '18068116';

	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const { block } = await api.rpc.chain.getBlock(blockHash);

	// Loop through all extrinsics in the block
	for (let index = 0; index < block.extrinsics.length; index++) {
		const extrinsic = block.extrinsics[index];
		const method = extrinsic.method;

		// If it's a multisig.asMulti call, then try to unbundle the batch
		if (method.section === 'multisig' && method.method === 'asMulti') {
			const { threshold, otherSignatories, maybeTimepoint, call } = method.args;
			console.log(`Threshold: ${threshold}, Other signatories: ${otherSignatories}`);

			if (call.isSome) {
				const innerCall = call.unwrap();

				// If the call inside multisig.asMulti is a batch call
				if (innerCall.section === 'utility' && (innerCall.method === 'batch' || innerCall.method === 'batchAll')) {
					const calls = innerCall.args[0];

					// Loop through each call in the batch
					for (const batchCall of calls) {
						console.log(`Batch call: ${batchCall.toHuman()}`);
					}
				}
			}
		}
	}
}

async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	const api = await ApiPromise.create({ provider, noInitWarn: true });
	await printExtrinsics(api);
//	await printProxyExtrinsics(api);
//	await printMultiSigExtrinsics(api);
//	await printMultiSig(api);
//	await sample(api);
  await api.disconnect();
}



// print multiSig extrinsics
async function sample(api) {
	const blockNumber = '18068116';
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);
	const signedBlock = await api.rpc.chain.getBlock(blockHash);
	for (const { method } of signedBlock.block.extrinsics) {
		const { section, method: methodName, args } = method.toJSON();
		console.log(`Call: ${section}.${methodName}`);
		console.log(`Args:`, args);
	}

}

main();
