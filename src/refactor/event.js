const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
    const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider ,noInitWarn: true});

    const seenExtrinsicHashes = new Map();
    const finalizedExtrinsicHashes = new Set();

    api.rpc.chain.subscribeNewHeads(async (header) => {
        console.log(`\n\n ################################\n New block #${header.number}: ${header.hash} `);
        
        try {
            const blockHash = header.hash;
            const block = await api.rpc.chain.getBlock(blockHash);
            const extrinsics = block.block.extrinsics;

            extrinsics.forEach((extrinsic) => {
                const { method, section } = extrinsic.method;
                const extrinsicHash = extrinsic.hash.toHex();

                if (!seenExtrinsicHashes.has(extrinsicHash)) {
                    let details = { method: `${section}.${method}` };

                    if (section === 'staking') {
                        if (method === 'bond') {
                            const [controller, value] = extrinsic.args;
                            details.sender = extrinsic.signer.toString();
                            details.controller = controller.toString();
                            details.value = value.toString();
                        } else if (method === 'unbond') {
                            const [value] = extrinsic.args;
                            details.sender = extrinsic.signer.toString();
                            details.value = value.toString();
                        }
                        // Add other staking methods here
                    }
                    if(extrinsic.isSigned){
                        seenExtrinsicHashes.set(extrinsicHash, details);
                    }
                }
            });

            const finalizedHeadHash = await api.rpc.chain.getFinalizedHead();
            const finalizedHeader = await api.rpc.chain.getHeader(finalizedHeadHash);
            console.log(` Finalized block #${finalizedHeader.number}: ${finalizedHeadHash} \n ################################ \n`);

            const finalizedBlock = await api.rpc.chain.getBlock(finalizedHeadHash);
            const finalizedExtrinsics = finalizedBlock.block.extrinsics;

            finalizedExtrinsics.forEach((extrinsic) => {
                finalizedExtrinsicHashes.add(extrinsic.hash.toHex());
            });

            const notFinalizedExtrinsics = new Map(
                Array.from(seenExtrinsicHashes.entries()).filter(([hash]) => !finalizedExtrinsicHashes.has(hash))
            );

           // console.log('Extrinsics not finalized:', notFinalizedExtrinsics);
            notFinalizedExtrinsics.forEach((v,k) => {
                //print all the object values in the array
                console.log(`notFinalizedExtrinsics of hash ${k} are ${JSON.stringify(v)} \n\n`)
            });
        } catch (error) {
            console.error('Error fetching extrinsics:', error);
        }
    });
}

main().catch(console.error);
