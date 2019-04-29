import React from 'react';
import LoginView from './login_view';
import NewsContainer from './news_container';

import WlQuestions from './wl_questions';
import AccountData, {ForumAccountInfo, WhitelistStatus} from './../common/account_data';
import Config from './../common/config';
import Utils from './../common/utils';

declare var alt: any;

export const enum Pages {
	HOME,
	WL_QUESTIONS
}

interface HomeState {
	page: Pages;
	login_error?: string;
	nick?: string;
	wl_status?: WhitelistStatus;
}

export default class Home extends React.Component<any, HomeState> {
	private change_timestamp = 0;

	state: HomeState = {
		page: Pages.HOME//WL_QUESTIONS //HOME
	}

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		try {
			alt.on('login_failed', this.onLoginFailed.bind(this));
		}
		catch(e) {}

		/*if(process.env.NODE_ENV === 'development') {
			setTimeout(() => {
				this.onLoginFailed({
					access: true,
					avatar: 'undefined',
					banned: false,
					email: 'dfgdfgd',
					group_main: 13,
					groups: [6, 9],
					id: 4,
					name: 'Aktyn',
					status: true,
				});
			}, 1000);
		}*/
	}

	onLoginFailed(res: ForumAccountInfo) {
		if(res.status !== true)
			return this.setState({login_error: 'Logowanie nieudane'});
		if(res.banned)
			return this.setState({login_error: 'Twoje konto zostało zbanowane'});
		AccountData.setData(res);
		this.setState({nick: res.name});
		/*if( Config.WHITELISTED_GROUPS.includes(res['group_main']) ) {
			try {
				alt.emit('skipped');
			}
			catch(e) {
				return this.setState({login_error: 'Błąd komunikacji z silnikiem gry'});
				console.error(e);
			}
			return;
		}*/

		this.checkWlStatus(res);
	}

	async checkWlStatus(account_data: ForumAccountInfo) {
		//console.log(account_data);
		try {
			let wl_res: {result: string, status: WhitelistStatus} = 
				await Utils.postRequest(Config.server_url+'/wl_status', account_data);
			if(wl_res.result !== 'SUCCESS')
				return this.setState({login_error: 'Nie udało się pobrać statusu whitelisty'});

			console.log(wl_res);
			AccountData.setWlStatus(wl_res.status);
			
			switch(wl_res.status.status) {
				case 'not_found':
					//if(!preventLoop)
					this.changePage(Pages.WL_QUESTIONS);
					//this.props.switchPage(Pages.WL_QUESTIONS);
					return;
				default:
					this.setState({wl_status: wl_res.status});
					return;
			}
		}
		catch(e) {
			console.error(e);
			this.setState({login_error: 'Błędna odpowiedź serwera'});
		}
	}

	changePage(target: Pages) {
		let now = Date.now();
		if(now - this.change_timestamp > 100) {
			this.change_timestamp = now;
			if(target === Pages.WL_QUESTIONS && AccountData.getData() === null)
				return;
			this.setState({
				login_error: undefined,
				nick: undefined,
				wl_status: undefined,
				page: target
			});
		}
	}

	/*componentDidUpdate() {
		console.log( document.activeElement);
	}*/

	renderHomePage() {
		return <>
			<div className='home-main'>
				<LoginView error_msg={this.state.login_error} nick={this.state.nick}
					wl_status={this.state.wl_status}
					switchPage={_page => this.changePage(_page)}/>
				<NewsContainer/>
			</div>
		</>;
		/*
		<div>{process.env.NODE_ENV !== 'development' &&
			<button style={{
				color: '#000', padding: '5px', marginTop: '10px', width: '100px'
			}} onClick={() => {
				alt.emit('skipped');
			}}>SKIP</button>
		}
		</div>
		*/
	}

	renderWlQuestions() {
		return <WlQuestions switchPage={_page => this.changePage(_page)}/>
	}

	render() {
		switch(this.state.page) {
			default:
			case Pages.HOME:
				return this.renderHomePage();
			case Pages.WL_QUESTIONS:
				return this.renderWlQuestions();
		}
	}
}