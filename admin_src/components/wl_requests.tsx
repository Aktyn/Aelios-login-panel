import * as React from 'react';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import Utils from './../common/utils';
import Config from './../common/config';
import Cookies from './../common/cookies';

import './../styles/wl_requests.scss';

function calcAge(data_ur: string) {//YYYY-MM-DD
	let data_arr = data_ur.split('-').map(num => parseInt(num));

	let now = new Date();
	let years_between = now.getFullYear() - data_arr[0];
	if( now.getMonth()+1 < data_arr[1] || 
		(now.getMonth()+1 == data_arr[1] && now.getDate() < data_arr[2]) )
	{
		years_between--;
	}

	return years_between + ' lata';
}

interface RequestShortSchema {
	_id: string;
	answers: {nick_input: string, data_ur: string};
	status: string;
	timestamp: number;
	user_id: number;
	forum_user: {name: string, avatar: string}[]
}

interface RequestsState {
	category?: string;
	loading: boolean;
	error_msg?: string;

	requests_data: RequestShortSchema[];
}

class WlRequests extends React.Component<any, RequestsState> {
	state: RequestsState = {
		loading: false,
		requests_data: []
	}

	constructor(props: any) {
		super(props);
	}

	private get category() {
		return this.props.match.params.category || 'pending';
	}

	componentDidMount() {
		this.loadRequests();
	}

	componentDidUpdate() {
		this.loadRequests();
	}

	async loadRequests() {
		if(this.state.category === this.category)
			return;
		
		this.setState({category: this.category, loading: true});

		try {
			let res = await Utils.postRequest(Config.server_url + '/get_wl_requests', {
				status: this.category,
				token: Cookies.getCookie('token')
			});

			//console.log( res );
			if(res.result === 'PERMISSION_DENIED')
				return this.props.history.push('/login');
			if(res.result !== 'SUCCESS')
				return this.setState({error_msg: 'Coś poszło nie tak', loading: false});

			this.setState({
				loading: false, 
				error_msg: undefined, 
				requests_data: res.data
				//[...res.data, ...res.data, ...res.data, ...res.data, ...res.data]
			});
		}
		catch(e) {
			console.error(e);
			this.setState({error_msg: 'Nie udało się załadować danych', loading: false})
		}
	}

	render() {
		return <div className='container wl-requests-main'>
			<div className={`categories ${this.state.category}`}>
				<Link to='/wl_requests/pending'>OCZEKUJĄCE</Link>
				<Link to='/wl_requests/accepted'>ZAAKCEPTOWANE</Link>
				<Link to='/wl_requests/rejected'>ODRZUCONE</Link>
			</div>
			<div>
				<div className='error-msg'>{this.state.error_msg}</div>
				{this.state.loading && <div>Ładowanie danych</div>}
				<div className='requests-list'>{this.state.requests_data.map((request, index) => {
					if(request.forum_user.length === 0)
						return <div>Niepoprawne dane</div>;

					return <div key={index} className='entry'>
						<span className='forum-nick'>{request.forum_user[0].name}</span>
						<span className='age'>{calcAge(request.answers.data_ur)}</span>
						<img src={request.forum_user[0].avatar} className='avatar' />
						<hr/>
						<div className='dt'>{new Date(request.timestamp).toLocaleString('pl-PL')}</div>
						<Link to={`/request_details/${request._id}`}>Pokaż</Link>
					</div>;
				})}</div>
			</div>
		</div>;
	}
}

export default withRouter(WlRequests);