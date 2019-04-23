import * as React from 'react';
import {withRouter} from 'react-router';
import Utils from './../common/utils';
import Config from './../common/config';
import Cookies from './../common/cookies';

interface LoginState {
	error_msg?: string;
}

class Login extends React.Component<any, LoginState> {
	private loginInput: HTMLInputElement | null = null;
	private passInput: HTMLInputElement | null = null;

	state: LoginState = {
		
	}

	constructor(props: any) {
		super(props);
	}

	async login() {
		if(!this.loginInput || !this.passInput || 
			this.loginInput.value.length === 0 || this.passInput.value.length === 0)
		{
			return;
		}

		try {
			let res = await Utils.postRequest(Config.server_url + '/admin_panel_login', {
				login: this.loginInput.value,
				password: this.passInput.value
			});

			if(res.result !== 'SUCCESS')
				return this.setState({error_msg: 'Logowanie nieudane'});

			//console.log( res );

			Cookies.setCookie('token', res.token);
			this.props.history.push('/wl_requests');
			//location.reload();
		}
		catch(e) {
			console.error(e);
			this.setState({error_msg: 'Niewłaściwa odpowiedź serwera'});
		}
	}

	render() {
		return <div className='container'>
			<div className='error-msg'>{this.state.error_msg}</div>
			<p><input type='text' placeholder='Nazwa użytkownika' ref={el=>this.loginInput=el}
				defaultValue={process.env.NODE_ENV === 'development' ? 'Aktyn' : ''} /></p>
			<p><input type='password' placeholder='Hasło' ref={el=>this.passInput=el} 
				defaultValue={process.env.NODE_ENV === 'development' ? 'byloaledobre' : ''} /></p>
			<button onClick={this.login.bind(this)}>ZALOGUJ</button>
		</div>;
	}
}

export default withRouter(Login);