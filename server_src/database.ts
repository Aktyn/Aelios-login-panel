import {MongoClient, Db, ObjectId} from 'mongodb';
import Utils from './utils';

import * as ip from 'ip';
let ip_address = ip.address();

const uri = 'mongodb://localhost:27017';
const DB_NAME = 'aelios';

const enum COLLECTIONS {
	server_connections = 'server_connections',
	forum_accounts = 'forum_accounts',
	wl_requests = 'whitelist_requests'
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

	//creating indexes
	await db.collection(COLLECTIONS.forum_accounts).createIndex({id: 1}, 
		{name: 'forum_user_id', unique: true});

	await db.collection(COLLECTIONS.wl_requests).createIndex({user_id: 1}, 
		{name: 'wl_user_id', unique: false});//one user can have multiple wl requests so unique is false
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
	_id: ObjectId;
	visit_counter: number;
}

interface WhitelistRequestAnswers {
	nick_input: string;
	data_ur: string;
	steam_id: string;
	stream_link: string;
	roleplay_desc: string;
	roleplay_exp: string;
	prev_characters: string;
	next_characters: string;
	character_history: string;
	situation1: string;
	situation2: string;
	situation3: string;
	select1: string;
	select2: string;
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
			await forum_accs.insertOne( Object.assign(data, {visit_counter: 1}) );
			//console.log(inserted.insertedId, typeof inserted.insertedId);
		}
		else {
			//console.log(account._id);
			let data_copy = JSON.parse(JSON.stringify(data));
			delete data_copy.id;//does not affect data object reference by working on copy
			await forum_accs.updateOne(
				{id: account.id}, 
				{
					'$set': Object.assign(data_copy, {visit_counter: account.visit_counter+1})
				}
			);
		}
	},

	async checkWhitelistStatus(_user_id: number) {
		let wl_requests = getCollection(COLLECTIONS.wl_requests);
		let latest_request_status: {status: string} | null = await wl_requests.find({user_id: _user_id})
			.sort({timestamp: -1}).project({status: 1}).next();
		//console.log(latest_request_status, _user_id);
		if(latest_request_status === null)
			return 'not_found';
		else
			return latest_request_status.status;
	},

	async applyWhitelistRequest(_user_id: number, _answers: WhitelistRequestAnswers) {
		let wl_requests = getCollection(COLLECTIONS.wl_requests);
		let latest_request = await wl_requests.find({user_id: _user_id}).sort({timestamp: -1}).next();
		if(latest_request !== null && latest_request.status !== 'rejected')
			return false;

		let account = await getCollection(COLLECTIONS.forum_accounts).findOne({id: _user_id});
		if(!account) {
			console.error('No account found for user_id:', _user_id);
			return false;
		}

		const MAX_INPUT_LENGTH = 4096;

		for(let key in _answers) {
			//@ts-ignore
			if(typeof _answers[key] === 'string' && _answers[key].length > MAX_INPUT_LENGTH)
				//@ts-ignore
				_answers[key] = _answers[key].substr(0, MAX_INPUT_LENGTH);
		}

		console.log('New whitelist request form user:', account.name);
		await wl_requests.insertOne({
			user_id: _user_id,
			timestamp: Date.now(),
			answers: _answers,
			status: 'pending'
		});

		return true;
	}
}