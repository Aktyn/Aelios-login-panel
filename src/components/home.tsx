import React from 'react';
import LoginView from './login_view';
import NewsContainer from './news_container';

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
	state: HomeState = {
		page: Pages.HOME//WL_QUESTIONS //HOME
	}

	constructor(props: any) {
		super(props);
	}

	renderHomePage() {
		return <>
			<div className='home-main'>
				<LoginView switchPage={_page => this.setState({page: _page})}/>
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
		return <WlQuestions switchPage={_page => this.setState({page: _page})}/>
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