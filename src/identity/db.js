const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function getCol() {
	try {
		await client.connect();
		const db = client.db('kusama');
		const col = db.collection('identityTest1');
		return col;
	} catch (err) {
		console.error(err);
	}
}

module.exports = {
	client,
	getCol
};
