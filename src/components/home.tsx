import React from 'react';
import LoginView from './login_view';
import NewsContainer from './news_container';

declare var alt: any;

export default class Home extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
	}

	render() {
		return <>
			<div className='home-main'>
				<LoginView/>
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
}