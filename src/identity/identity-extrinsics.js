const { ApiPromise, WsProvider } = require('@polkadot/api');

async function fetchIdentityEvents(api, address) {


  const blockNumber = '17596536';
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  const block = await api.rpc.chain.getBlock(blockHash);
  const extrinsics = block.block.extrinsics;
  for (const extrinsic of extrinsics) {
    const { method, section } = extrinsic.method;
    // console.log(`extrinsic`,extrinsic.toString());
    console.log(`method`, method.toString());
    console.log(`section`, section.toString());
    if (section === 'identity') {
      console.log(`Found identity-related extrinsic at block #${blockNumber}:`);
      console.log(`  Section: ${section}`);
      console.log(`  Method: ${method}`);
      console.log(`  Extrinsic: ${extrinsic.toString()}`);

      const extrinsicData = JSON.parse(extrinsic);

      const identityInfo = extrinsicData.method.args.info;

      const display = parseIdentityData(identityInfo.display);
      const legal = parseIdentityData(identityInfo.legal);
      const web = parseIdentityData(identityInfo.web);
      const riot = parseIdentityData(identityInfo.riot);
      const email = parseIdentityData(identityInfo.email);
      const pgpFingerprint = identityInfo.pgpFingerprint;
      const image = parseIdentityData(identityInfo.image);
      const twitter = parseIdentityData(identityInfo.twitter);

      console.log('Display:', display);
      console.log('Legal:', legal);
      console.log('Web:', web);
      console.log('Riot:', riot);
      console.log('Email:', email);
      console.log('PgpFingerprint:', pgpFingerprint);
      console.log('Image:', image);
      console.log('Twitter:', twitter);

    }
  }
}


function parseIdentityData(rawData) {
  if (rawData.none !== undefined) {
    return null;
  } else if (rawData.raw) {
    return Buffer.from(rawData.raw.slice(2), 'hex').toString('utf-8');
  }
}


async function main() {
  const provider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider, noInitWarn: true });

  const address = 'D3F5XpKS18xgf8DUxeMuD29FBSM1qJPL6S55JnQWtHn7PdN';
  const numberOfBlocks = 1000; // Number of past blocks to scan

  await fetchIdentityEvents(api, address, numberOfBlocks);

  api.disconnect();
}

main();
