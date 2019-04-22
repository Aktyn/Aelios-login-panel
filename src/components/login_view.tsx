import React from 'react';
//import { withRouter } from 'react-router-dom';
import Utils from './../common/utils';
import Config from './../common/config';
import AccountData, {ForumAccountInfo} from './../common/account_data';

import {Pages} from './home';

import './../styles/login_view.scss';

declare var alt: any;

interface LoginViewProps {
	switchPage: (page: Pages) => void;
}

interface LoginState {
	error_msg?: string;
	wl_status?: string;
}

export default class LoginView extends React.Component<LoginViewProps, LoginState> {
	private nick_input: HTMLInputElement | null = null;
	private pass_input: HTMLInputElement | null = null;

	state: LoginState = {};

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		let account_data = AccountData.getData();
		if(account_data !== null)
			this.checkWlStatus(account_data, true);
	}

	async checkWlStatus(account_data: ForumAccountInfo, preventLoop = false) {
		//console.log(account_data);
		let wl_res = await Utils.postRequest(Config.server_url+'/wl_status', account_data);
		if(wl_res.result !== 'SUCCESS')
			return this.setState({error_msg: 'Nie udało się pobrać statusu whitelisty'});

		console.log(wl_res);
		
		switch(wl_res.status) {
			case 'not_found':
				if(!preventLoop)
					this.props.switchPage(Pages.WL_QUESTIONS);
					//this.props.history.push(`/wl_questions`);
				return;
			default:
				this.setState({wl_status: wl_res.status});
				return;
		}
	}

	async login() {
		if(!this.nick_input || !this.pass_input)
			return;
		let nick = this.nick_input.value;
		let password = this.pass_input.value;

		if(!nick.length)
			return this.setState({error_msg: 'Nie podano nazwy użykownika'});
		if(!password.length)
			return this.setState({error_msg: 'Nie podano hasła'});

		this.setState({error_msg: undefined});

		try {
			let res: ForumAccountInfo = await Utils.getRequest(`http://forum.aelios.pl/api.php`, {
				'username': nick,
				'password': password
			});
			//console.log(res);
			if(res.status !== true)
				return this.setState({error_msg: 'Logowanie nieudane'});
			if(res.banned)
				return this.setState({error_msg: 'Twoje konto zostało zbanowane'});
			AccountData.setData(res);
			//if(Math.max(...res.groups) < 5)
			//	return this.setState({error_msg: 'Nie masz uprawnień do wejścia na serwer'});

			this.checkWlStatus(res);
		}
		catch(e) {
			this.setState({error_msg: 'Błędna odpowiedź serwera'});
			console.error(e);
		}
	}

	renderWlStatus() {
		return <div className='login-view container'>
			<h1></h1>
			<div className='request-status'>{(() => {
				switch(this.state.wl_status) {
					default:
					case 'pending':
						return <span>Twoje podanie oczekuje na rozpatrzenie.</span>;
					case 'accepted':
						try {
							alt.emit('skipped');//TODO - pass account nickname to different listener
						}
						catch(e) {
							console.error(e);
						}
						return <span>Twoje podanie zostało zaakceptowane.</span>;
						//return <span>Twoje podanie zostało zaakceptowane<br/>
						//	</span>;
					case 'rejected':
						return <span>Twoje podanie zostało odrzucone</span>;
				}
			})()}</div>
		</div>;
	}

	render() {
		if(this.state.wl_status)
			return this.renderWlStatus();

		return <div className='login-view container'>
			<h1></h1>
			<div className='input-fields'>
				<input type='text' maxLength={256} placeholder='Nazwa użytkownika' onKeyDown={e => {
					if(e.keyCode === 13 && this.pass_input)
						this.pass_input.focus();
				}} ref={el=>this.nick_input=el} 
				defaultValue={process.env.NODE_ENV === 'development' ? 'Aktyn' : ''} />
				<input type='password' maxLength={256} placeholder='Hasło' onKeyDown={e => {
					if(e.keyCode === 13)
						this.login();
				}} ref={el=>this.pass_input=el} 
				defaultValue={process.env.NODE_ENV === 'development' ? 'byloaledobre' : ''}/>
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

//export default withRouter(LoginView);