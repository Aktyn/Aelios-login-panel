import React from 'react';
//import { withRouter } from 'react-router-dom';
import Utils from './../common/utils';
import Config from './../common/config';
import AccountData, {ForumAccountInfo, WhitelistStatus} from './../common/account_data';

import {Pages} from './home';

import './../styles/login_view.scss';

declare var alt: any;

interface LoginViewProps {
	switchPage: (page: Pages) => void;
}

interface LoginState {
	error_msg?: string;
	wl_status?: WhitelistStatus;
	nick?: string;
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
		let wl_res: {result: string, status: WhitelistStatus} = 
			await Utils.postRequest(Config.server_url+'/wl_status', account_data);
		if(wl_res.result !== 'SUCCESS')
			return this.setState({error_msg: 'Nie udało się pobrać statusu whitelisty'});

		console.log(wl_res);
		AccountData.setWlStatus(wl_res.status);
		
		switch(wl_res.status.status) {
			case 'not_found':
				if(!preventLoop)
					this.props.switchPage(Pages.WL_QUESTIONS);
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
			//console.log(res['group_main']);
			if(res.status !== true)
				return this.setState({error_msg: 'Logowanie nieudane'});
			if(res.banned)
				return this.setState({error_msg: 'Twoje konto zostało zbanowane'});
			AccountData.setData(res);
			this.setState({nick: res.name});
			if(Config.WHITELISTED_GROUPS.includes(res['group_main']) 
				&& process.env.NODE_ENV !== 'development') 
			{
				try {
					alt.emit('skipped');
				}
				catch(e) {
					return this.setState({error_msg: 'Błąd komunikacji z silnikiem gry'});
					console.error(e);
				}
				return;
			}
			//	return this.setState({error_msg: 'Nie masz uprawnień do wejścia na serwer'});

			this.checkWlStatus(res);
		}
		catch(e) {
			this.setState({error_msg: 'Błędna odpowiedź serwera'});
			console.error(e);
		}
	}

	renderWlStatus(wl_status: WhitelistStatus) {
		return <div className='login-view container'>
			<h1></h1>
			<div className='request-status'>{(() => {
				switch(wl_status.status) {
					default:
					case 'pending':
						return <span>
							{this.state.nick && <div>Witaj {this.state.nick}</div>}
							Twoje podanie oczekuje na rozpatrzenie.
						</span>;
					case 'accepted':
						try {
							alt.emit('skipped');//TODO - pass account nickname to different listener
						}
						catch(e) {
							console.error(e);
							return <>
								<span>Twoje podanie zostało zaakceptowane.</span><br/>
								<span className='error-msg'>Błąd komunikacji z silnikiem gry</span>
							</>;
						}
						return <span>Twoje podanie zostało zaakceptowane.</span>;
						//return <span>Twoje podanie zostało zaakceptowane<br/>
						//	</span>;
					case 'rejected':
						if(wl_status.count >= Config.MAXIMUM_REQUESTS)
							return <>
								<span>Twoje podanie zostało odrzucone.</span><br/>
								<span>Nie możesz już złożyć kolejnego podania.</span>
							</>;
						let ms_ago = Date.now() - wl_status.timestamp;
						if(ms_ago > Config.REQUESTS_TIME_BREAK) {
							//user can send another whitelist request
							setTimeout(() => this.props.switchPage(Pages.WL_QUESTIONS), 1);
						}
						let next_date = new Date(wl_status.timestamp + Config.REQUESTS_TIME_BREAK);

						let ms_to_next_request = Config.REQUESTS_TIME_BREAK - ms_ago;
						let minutes = ms_to_next_request / 1000 / 60;
						let hours = (minutes / 60)|0;
						minutes = (minutes - hours*60)|0;
						return <>
							<span>Twoje podanie zostało odrzucone.</span><br/>
							<span>Kolejna próba będzie możliwa za:<br/>{hours} godzin i {minutes} minut</span><br/><br/>
							<span>( {next_date.toLocaleString('pl-PL')} )</span>
						</>;
				}
			})()}</div>
		</div>;
	}

	render() {
		if(this.state.wl_status)
			return this.renderWlStatus(this.state.wl_status);

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
			<div className={'error-msg'}>{this.state.error_msg}</div>
			<div>
				<button onClick={this.login.bind(this)}>ZALOGUJ</button>
			</div>
			<div className='info'>
				Dane logowania dotyczą konta na forum.<br/>
				Nie masz konta? Zarejestruj się <a href='https://forum.aelios.pl/' 
					target='_blank' rel='noopener noreferrer'>na tej stronie</a>.
			</div>
		</div>;
	}
}

//export default withRouter(LoginView);