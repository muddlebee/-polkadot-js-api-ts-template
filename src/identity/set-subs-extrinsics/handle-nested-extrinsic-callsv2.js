const { ApiPromise, WsProvider } = require("@polkadot/api");
const {
  consts: {
    Modules,
    ProxyMethods,
    MultisigMethods,
    UtilityMethods,
    SudoMethods,
  },
} = require("@osn/scan-common");

async function handleExtrinsic(api, call) {
  const { section, method, args } = call;
  console.log(`Extrinsic: ${section}.${method}`);

  if (method === "proposeCurator") {
    console.log("childBounties args", call.toHuman());
    return;
  }

  if (Modules.Proxy === section && ProxyMethods.proxy === method) {
    await handleExtrinsic(api, call.args[2]);
  } else if (Modules.Multisig === section && MultisigMethods.asMulti) {
    await handleExtrinsic(api, call.args[3]);
  } else if (
    Modules.Utility === section &&
    UtilityMethods.batchAll === method
  ) {
    for (const callData of call.args[0]) {
      /*      console.log(
        "batchAll:::::::::::::::::::::::::::::::::::",
        callData.toHuman(),
      );*/
      await handleExtrinsic(api, callData);
    }
  } else if (Modules.Sudo === section && SudoMethods.sudo === method) {
    await handleExtrinsic(api, call.args[0]);
  }
}

async function main() {
  const provider = new WsProvider("wss://kusama-rpc.polkadot.io");
  const api = await ApiPromise.create({ provider });

  const blockNumber = "18068116";
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  const signedBlock = await api.rpc.chain.getBlock(blockHash);

  for (const extrinsic of signedBlock.block.extrinsics) {
    const methodCall = extrinsic.method;
    await handleExtrinsic(api, methodCall);
  }

  await api.disconnect();
}

main().catch(console.error);

module.exports = {
  handleExtrinsic,
};
