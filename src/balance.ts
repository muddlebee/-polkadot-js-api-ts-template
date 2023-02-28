    // needed as of 7.x series, see CHANGELOG of the api repo.
import '@polkadot/api-augment';
import '@polkadot/types-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { Balance } from '@polkadot/types/interfaces/runtime';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { BN , formatBalance} from '@polkadot/util';

const optionsPromise = yargs(hideBin(process.argv)).option('endpoint', {
	alias: 'e',
	type: 'string',
	default: 'wss://rpc.ibp.network/westend',
	description: 'the wss endpoint. It must allow unsafe RPCs.',
	required: true
}).argv;

async function main() {
	const options = await optionsPromise;
	const provider = new WsProvider(options.endpoint);
	const api = await ApiPromise.create({ provider });
    const chainDecimals = await api.registry.chainDecimals[0];
    const unit = await api.registry.chainTokens[0];
	console.log(
		`Connected to node: ${options.endpoint} ${(await api.rpc.system.chain()).toHuman()} [ss58: ${
			api.registry.chainSS58
		}]`
	);

	// reading a constant
	const ED: Balance = api.consts.balances.existentialDeposit;
	console.log(`ED Balance ${ED.toHuman()}`);
    const free = formatBalance(ED, {withUnit:unit,decimals:chainDecimals });
    console.log(`free:::::::::: ${JSON.stringify(free)}`);
    console.log(`amount:::::::::: ${JSON.stringify(toUnit(ED,chainDecimals))}`);
    const { tokenSymbol } = await api.rpc.system.properties();
    console.log(`tokenSymbol:::::::::: ${JSON.stringify(tokenSymbol)}`);
    console.log(`properties:::::::::: ${JSON.stringify(await api.rpc.system.properties())}`);

}



main().catch(console.error);

function toUnit(balance: string | number | number[] | BN | Uint8Array | Buffer, decimals: string | number | number[] | BN | Uint8Array | Buffer) {
    const base = new BN(10).pow(new BN(decimals));
    const dm = new BN(balance).divmod(base);
    return parseFloat(dm.div.toString() + "." + dm.mod.toString())
}