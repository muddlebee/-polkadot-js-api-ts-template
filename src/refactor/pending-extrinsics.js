const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider ,noInitWarn: true});

    const seenExtrinsicHashes = new Map();
    const finalizedExtrinsicHashes = new Set();

    api.rpc.chain.subscribeNewHeads(async (header) => {
        console.log(`\n\n ################################\n New block #${header.number}: ${header.hash} `);
        
        try {
            const blockHash = header.hash;
            const block = await api.rpc.chain.getBlock(blockHash);
            const extrinsics = block.block.extrinsics;
            const blockEvents = await api.query.system.events.at(blockHash);

            extrinsics.forEach((extrinsic,index) => {
                const { method, section } = extrinsic.method;
                const extrinsicHash = extrinsic.hash.toHex();

                if (!seenExtrinsicHashes.has(extrinsicHash)) {
                    let details = { method: `${section}.${method}` };

                    
                    //TODO: store all info required for UI
                    
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

                    if (section === 'balances') {
                        if (method === 'transfer' || method === 'transferKeepAlive') {
                          const [dest, value] = extrinsic.args;
                          details.sender = extrinsic.signer.toString();
                          details.receiver = dest.toString();
                          details.value = value.toString();
                        }
                      }
            
                      // Crowdloans extrinsics
                      if (section === 'crowdloan') {
                        if (method === 'contribute') {
                          const [index, value] = extrinsic.args;
                          details.contributor = extrinsic.signer.toString();
                          details.fundIndex = index.toString();
                          details.value = value.toString();
                        }
                      }
                      if (section === 'treasury') {
                        if (method === 'proposeSpend' || method === 'tipNew') {
                          const [value, beneficiary] = extrinsic.args;
                          details.proposer = extrinsic.signer.toString();
                          details.beneficiary = beneficiary.toString();
                          details.value = value.toString();
                        }
                      }
                        // index of our extrinsic in the block
                details.events = blockEvents
                  .filter(
                    ({ phase }) =>
                      phase.isApplyExtrinsic &&
                      phase.asApplyExtrinsic.eq(index)
                  )
                  .map(({ event }) => {
                    if (api.events.system.ExtrinsicSuccess.is(event)) {
                      details.success = true;
                      details.finalized = true;
                    } else if (api.events.system.ExtrinsicFailed.is(event)) {
                        details.success = false;
                        details.finalized = true;
                    }
                    return {
                      method: event.section.toString(),
                      section: event.method.toString(),
                      data: event.data,
                    };
                  });
                      
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
