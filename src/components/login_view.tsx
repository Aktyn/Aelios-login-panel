import React from 'react';
import Utils from './../utils';

import './../styles/login_view.scss';

declare var alt: any;

interface ApiResultSchema {
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

interface LoginState {
	error_msg?: string;
}

export default class LoginView extends React.Component<any, LoginState> {
	private nick_input: HTMLInputElement | null = null;
	private pass_input: HTMLInputElement | null = null;

	state: LoginState = {
		//error_msg: 'example error'
	};

	constructor(props: any) {
		super(props);
	}

	login() {
		if(!this.nick_input || !this.pass_input)
			return;
		let nick = this.nick_input.value;
		let password = this.pass_input.value;

		if(!nick.length)
			return this.setState({error_msg: 'Nie podano nazwy użykownika'});
		if(!password.length)
			return this.setState({error_msg: 'Nie podano hasła'});

		this.setState({error_msg: undefined});

		Utils.getRequest(`http://forum.aelios.pl/api.php`, {
			'username': nick,
			'password': password
		}).then((res: ApiResultSchema) => {
			//console.log(res);
			if(res.status !== true)
				return this.setState({error_msg: 'Logowanie nieudane'});
			if(res.banned)
				return this.setState({error_msg: 'Twoje konto zostało zbanowane'});
			if(Math.max(...res.groups) < 5)
				return this.setState({error_msg: 'Nie masz uprawnień do wejścia na serwer.'});

			//success
			alt.emit('skipped');//TODO - pass account nickname to different listener
		}).catch(console.error);

		//console.log(nick, password);
	}

	render() {
		return <div className='login-view container'>
			<h1></h1>
			<div className='input-fields'>
				<input type='text' maxLength={256} placeholder='Nazwa użytkownika' onKeyDown={e => {
					if(e.keyCode === 13 && this.pass_input)
						this.pass_input.focus();
				}} ref={el=>this.nick_input=el} />
				<input type='password' maxLength={256} placeholder='Hasło' onKeyDown={e => {
					if(e.keyCode === 13)
						this.login();
				}} ref={el=>this.pass_input=el} />
			</div>
			<div className={this.state.error_msg && 'error-msg'}>{this.state.error_msg}</div>
			<div>
				<button onClick={this.login.bind(this)}>ZALOGUJ</button>
			</div>
			<div className='info'>
				Dane logowania dotyczą konta na forum.<br/>
				Nie masz konta? Zarejestruj się <a href='https://forum.aelios.pl/'>na tej stronie</a>.
			</div>
		</div>;
	}
}