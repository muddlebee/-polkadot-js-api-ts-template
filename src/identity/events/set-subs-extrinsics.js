const { ApiPromise, WsProvider } = require('@polkadot/api');

async function fetchIdentityEvents(api) {
	const blockNumber = '18000128';
	const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
	const events = await api.query.system.events.at(blockHash);
	const block = await api.rpc.chain.getBlock(blockHash);

	for (const eventRecord of events) {
		const { event, phase } = eventRecord;
		const { section, method } = event;

		if (phase.isApplyExtrinsic) {
			const extrinsicIndex = phase.asApplyExtrinsic;
			const extrinsic = block.block.extrinsics[extrinsicIndex];
			//	console.log(`Extrinsic : ${JSON.stringify(extrinsic.toHuman())}`);
			if (api.events.system.ExtrinsicSuccess.is(event)) {
				const { section, method } = extrinsic.method;

				if (method === 'setSubs') {
					console.log(`event`,event.toHuman())
					console.log(`Extrinsic:`,extrinsic.toHuman());
					const extrinsicData = extrinsic.method.args[0]; // assuming the data you're interested in is the first argument
					console.log(`extrinsicData`, extrinsicData.toHuman());
					console.log(`Found identity-related event at block #${blockNumber}:`);

					extrinsicData.forEach(([accountId, display]) => {
						console.log(`accountId`, accountId.toString());
						console.log(`display`, display.asRaw.toUtf8());
					});
				}
			}
		}
	}
}


// add or update the subidentity collection
async function main() {
	const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
	const api = await ApiPromise.create({ provider, noInitWarn: true });
	await fetchIdentityEvents(api);

/*

	extrinsicData[0].value = extrinsicData[0].value.map((obj) => {
		const [key, value] = Object.entries(obj.col2)[0];
		return {
			col1: obj.col1,
			col2: {
				Raw: value
			}
		}
	});

	extrinsicData[0].value.forEach(value => {
		const accountId = api.createType('AccountId', value.col1);
		const data = api.createType('Data', value.col2);

		console.log(`AccountId: ${accountId.toString()}`);
		console.log(`Data: ${data.asRaw.toUtf8()}`);
	});
*/

	/*	extrinsicData[0].value.forEach(value => {
			const accountId = api.createType('AccountId', value.col1);

			const rawData = Object.values(value.col2)[0];
			const data = api.createType('Bytes', rawData);

			// Convert hex data to string
			const dataString = Buffer.from(data.toHex().substring(2), 'hex').toString();

			console.log(`AccountId: ${accountId.toString()}`);
			console.log(`Data: ${dataString}`);
	}); */
	await api.disconnect();
}
let extrinsicData = [
	{
		name: "subs",
		type: "Vec<Tuple:[U8; 32]pallet_identity:types:Data>",
		type_name: "Vec<(AccountId, Data)>",
		value: [
			{
				col1: "0x72795595ce1298481aeca61391ee534ab7955411342e091fcb079401a784d438",
				col2: {
					Raw2: "02"
				}
			},
			{
				col1: "0xd6bacc09599d6647899ed6734cc33a655c56e6bf08d2273ba8464eb1d4a0830b",
				col2: {
					Raw8: "projects"
				}
			},
			{
				col1: "0x6e5b9e2cbd37299c34a07fe45c6f143aa715e1bfccc4db8c82814dd82a0aa35c",
				col2: {
					Raw16: "OpenGov Delegate"
				}
			}
		]
	}
];



main();
