import React from 'react';
import LoginView from './login_view';
import NewsContainer from './news_container';
import AccountData from './../common/account_data';

import WlQuestions from './wl_questions';

declare var alt: any;

export const enum Pages {
	HOME,
	WL_QUESTIONS
}

interface HomeState {
	page: Pages;
}

export default class Home extends React.Component<any, HomeState> {
	private change_timestamp = 0;

	state: HomeState = {
		page: Pages.HOME//WL_QUESTIONS //HOME
	}

	constructor(props: any) {
		super(props);
	}

	changePage(target: Pages) {
		let now = Date.now();
		if(now - this.change_timestamp > 100) {
			this.change_timestamp = now;
			if(target === Pages.WL_QUESTIONS && AccountData.getData() === null)
				return;
			this.setState({page: target});
		}
	}

	/*componentDidUpdate() {
		console.log( document.activeElement);
	}*/

	renderHomePage() {
		return <>
			<div className='home-main'>
				<LoginView switchPage={_page => this.changePage(_page)}/>
				<NewsContainer/>
			</div>
			<div>{process.env.NODE_ENV !== 'development' &&
				<button style={{
					color: '#000', padding: '5px', marginTop: '10px', width: '100px'
				}} onClick={() => {
					alt.emit('skipped');
				}}>SKIP</button>
			}
			</div>
		</>;
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