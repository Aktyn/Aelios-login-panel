import {MongoClient, Db} from 'mongodb';
import Utils from './utils';

import * as ip from 'ip';
let ip_address = ip.address();

const uri = 'mongodb://localhost:27017';
const DB_NAME = 'aelios';

const enum COLLECTIONS {
	server_connections = 'server_connections',
	forum_accounts = 'forum_accounts'
};

let client: MongoClient;
let db: Db;
function assert_connection() {
	if(!client) throw new Error('Database connection not ready');
}

function getCollection(name: string) {
	assert_connection();
	return (db || (db = client.db(DB_NAME))).collection(name);
}

const mongodb_user = Utils.getArgument('MONGO_USER');
const mongodb_pass = Utils.getArgument('MONGO_PASS');

MongoClient.connect(uri, {
	useNewUrlParser: true, 
	auth: {
		user: mongodb_user, 
		password: mongodb_pass
	}
}).then(async (_client) => {
	client = _client;
	console.log('Database connection established');

	db = client.db(DB_NAME);
	
	await db.collection(COLLECTIONS.server_connections).insertOne({
		ip: ip_address,
		timestamp: Date.now()
	});
	
	/*db.collection('server_connections').find({//last 24h connections
		timestamp: {$gte: Date.now() - 1000*60*60*24}
	}).limit(16).forEach( entry => console.log(entry.ip, new Date(entry.timestamp).toTimeString()) );*/

	//client.close();
}).catch(console.error);

interface ForumAccountInfo {//same in login_view.tsx
	access: boolean;
	avatar: string;//link
	banned: boolean;
	email: string;
	group_main: number;
	groups: number[];
	id: number;
	name: string;//user nickname
	status: boolean;
}

interface MongoForumAccountInfo extends ForumAccountInfo {
	visit_counter: number;
}

export default {
	disconnect() {
		assert_connection();
		client.close();
	},

	async updateForumAccountData(data: ForumAccountInfo) {
		let forum_accs = getCollection(COLLECTIONS.forum_accounts);
		let account: MongoForumAccountInfo | null = await forum_accs.findOne({id: data.id});
		if(!account) {
			console.log('inserting new forum-account-data document for user:', data.name);
			forum_accs.insertOne( Object.assign(data, {visit_counter: 0}) );
		}
		else {
			//console.log(account);
			delete data.id;
			forum_accs.updateOne(
				{id: account.id}, 
				{
					'$set': Object.assign(data, {visit_counter: account.visit_counter+1})
				}
			);
		}
	}
}