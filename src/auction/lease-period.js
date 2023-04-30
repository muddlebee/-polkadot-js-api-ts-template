const { ApiPromise, WsProvider } = require('@polkadot/api');

async function getAuctionDates(network) {
  const provider = new WsProvider(network);
  const api = await ApiPromise.create({ provider });

  const auctionInfo = await api.query.auctions.auctionInfo();
  const [leasePeriodIndex, endBlock] = auctionInfo.unwrapOrDefault();

  if (leasePeriodIndex.isZero()) {
    console.log('No auction is currently running.');
  } else {
    const currentBlock = await api.rpc.chain.getBlock();
    const auctionStartBlock = endBlock.sub(api.consts.auctions.endingPeriod);
    console.log(`Auction start block: ${auctionStartBlock}`);
    console.log(`Auction end block: ${endBlock}`);

    const blockTime = api.consts.babe.expectedBlockTime.toNumber();
    const auctionStartTime = new Date(Date.now() + blockTime * (auctionStartBlock.toNumber() - currentBlock.block.header.number.toNumber()));
    const auctionEndTime = new Date(Date.now() + blockTime * (endBlock.toNumber() - currentBlock.block.header.number.toNumber()));

    console.log(`Auction start time: ${auctionStartTime}`);
    console.log(`Auction end time: ${auctionEndTime}`);
  }

  api.disconnect();
}

// Replace 'wss://kusama-rpc.polkadot.io' with 'wss://rpc.polkadot.io' for Polkadot network
getAuctionDates('wss://kusama-rpc.polkadot.io');
