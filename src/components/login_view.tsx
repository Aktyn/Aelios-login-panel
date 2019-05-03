import React from 'react';
//import { withRouter } from 'react-router-dom';
//import Utils from './../common/utils';
import Config from './../common/config';
import Cookies from './../common/cookies';
import /*AccountData, {ForumAccountInfo,*/ {WhitelistStatus} from './../common/account_data';

import {Pages} from './home';

import './../styles/login_view.scss';

declare var alt: any;

interface LoginViewProps {
	switchPage: (page: Pages) => void;
	error_msg?: string;
	nick?: string;
	wl_status?: WhitelistStatus;
}

interface LoginState {
	error_msg?: string;
	login_from_cookie: string | null;
	password_from_cookie: string | null;
}

export default class LoginView extends React.Component<LoginViewProps, LoginState> {
	private nick_input: HTMLInputElement | null = null;
	private pass_input: HTMLInputElement | null = null;

	state: LoginState = {
		login_from_cookie: null,
		password_from_cookie: null,
	};

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		//let account_data = AccountData.getData();
		//if(account_data !== null)
		//	this.checkWlStatus(account_data, true);

		this.setState({
			login_from_cookie: Cookies.getCookie('username'),
			password_from_cookie: Cookies.getCookie('password')
		});
	}

	tryLogin() {
		if(!this.nick_input || !this.pass_input)
			return;
		let nick = this.nick_input.value;
		let password = this.pass_input.value;

		this.login(nick, password);
	}

	async login(nick: string, password: string) {
		if(!nick.length)
			return this.setState({error_msg: 'Nie podano nazwy użykownika'});
		if(!password.length)
			return this.setState({error_msg: 'Nie podano hasła'});

		this.setState({error_msg: undefined});

		try {
			Cookies.setCookie('username', nick);
			Cookies.setCookie('password', password);
			alt.emit('loginAsForumUser', nick, password);
			/*let res: ForumAccountInfo = await Utils.getRequest(`http://forum.aelios.pl/api.php`, {
				'username': nick,
				'password': password
			});*/
		}
		catch(e) {
			// this.setState({error_msg: 'Błędna odpowiedź serwera'});
			return this.setState({error_msg: 'Błąd komunikacji z silnikiem gry'});
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
							{this.props.nick && <div>Witaj {this.props.nick}</div>}
							Twoje podanie oczekuje na rozpatrzenie.
						</span>;
					case 'accepted':
						/*try {
							alt.emit('skipped');//TODO - pass account nickname to different listener
						}
						catch(e) {
							console.error(e);
							return <>
								<span>Twoje podanie zostało zaakceptowane.</span><br/>
								<span className='error-msg'>Błąd komunikacji z silnikiem gry</span>
							</>;
						}*/
						return <span>
							Twoje podanie zostało zaakceptowane.<br/>
							Skontaktuj się z administracją aby otrzymać stosowną rangę na forum.
						</span>;
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

	renderLoginPanel() {
		if(!this.state.login_from_cookie || !this.state.password_from_cookie) {
			return <>
				<div className='input-fields'>
					<input type='text' maxLength={256} placeholder='Nazwa użytkownika' onKeyDown={e => {
						if(e.keyCode === 13 && this.pass_input)
							this.pass_input.focus();
					}} ref={el=>this.nick_input=el} 
					defaultValue={process.env.NODE_ENV === 'development' ? 'Aktyn' : ''} />
					<input type='password' maxLength={256} placeholder='Hasło' onKeyDown={e => {
						if(e.keyCode === 13)
							this.tryLogin();
					}} ref={el=>this.pass_input=el} 
					defaultValue={process.env.NODE_ENV === 'development' ? 'byloaledobre' : ''}/>
				</div>
				<div className={'error-msg'}>{this.state.error_msg || this.props.error_msg}</div>
				<div>
					<button onClick={this.tryLogin.bind(this)}>ZALOGUJ</button>
				</div>
			</>;
		}
		else {
			const marginStyle = {margin: '5px 0px'};
			return <>
				{<div>Witaj ponownie <strong>{this.state.login_from_cookie}</strong></div>}
				<div className={'error-msg'}>{this.state.error_msg || this.props.error_msg}</div>
				<div>
					<button onClick={() => {
						if(this.state.login_from_cookie && this.state.password_from_cookie)
							this.login(this.state.login_from_cookie, this.state.password_from_cookie);
					}}>ZALOGUJ</button>
				</div>
				<div style={marginStyle}>lub</div>
				<div>
					<button onClick={() => {
						Cookies.removeCookie('username');
						Cookies.removeCookie('password');
						this.setState({
							error_msg: undefined,
							login_from_cookie: null,
							password_from_cookie: null
						});
					}}>PRZEŁĄCZ KONTO</button>
				</div>
			</>;
		}
	}

	render() {
		if(this.props.wl_status)
			return this.renderWlStatus(this.props.wl_status);
		return <div className='login-view container'>
			<h1></h1>
			{this.renderLoginPanel()}
			<div className='info'>
				Dane logowania dotyczą konta na forum.<br/>
				Nie masz konta? Zarejestruj się na <a href='https://forum.aelios.pl/' 
					target='_blank' rel='noopener noreferrer'>https://forum.aelios.pl</a>.
			</div>
		</div>;
	}
}

//export default withRouter(LoginView);