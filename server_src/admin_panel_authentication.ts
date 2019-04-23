import fetch from 'node-fetch';
import * as crypto from 'crypto';
import {ForumAccountInfo} from './database';

const PERMITTED_GROUPS = [4, 7, 12, 13];

interface TokenSchema {//TODO - expiration
	login: string;
	password: string;
	token: string;
}

const tokens: TokenSchema[] = [];

export default {
	async login(username: string, password: string) {
		let res: ForumAccountInfo = await fetch(
			`http://forum.aelios.pl/api.php?username=${username}&password=${password}`)
				.then(res => res.json());
		//console.log(res);
		if( res.status !== true || !PERMITTED_GROUPS.includes(res.group_main) )
			return null;
	
		let current_token = tokens.find(tok => tok.login === username && tok.password === password);
		if(current_token)
			return current_token.token;

		const token = crypto.createHash('sha256')
			.update(Date.now().toString() + username + password).digest('base64');

		console.log('new token generated:', token);

		tokens.push({
			login: username,
			password: password,
			token: token
		});

		return token;	
	},

	authnenticate(_token: string) {
		return true;//tokens.find(tok => tok.token === _token);
	}
}