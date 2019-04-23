import * as React from 'react';
import {withRouter} from 'react-router';
import Utils from './../common/utils';
import Config from './../common/config';
import Cookies from './../common/cookies';

import './../styles/request_details.scss';

interface RequestDetailSchema {
	_id: string;
	user_id: number;
	timestamp: number;
	status: string;
	forum_user: {name: string, avatar: string}[],

	answers: {
		character_history: string;
		data_ur: string;
		next_characters: string;
		nick_input: string;
		prev_characters: string;
		roleplay_desc: string;
		roleplay_exp: string;
		select1: string;
		select2: string;
		situation1: string;
		situation2: string;
		situation3: string;
		stream_link: string;
	}
}

interface RequestDetailsState {
	error_msg?: string;
	loading: boolean;

	request_data?: RequestDetailSchema,
	other_user_requests: RequestDetailSchema[]
}

class RequestDetails extends React.Component<any, RequestDetailsState> {
	state: RequestDetailsState = {
		loading: false,
		request_data: undefined,
		other_user_requests: []
	}

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		if(!this.props.match.params.id)
			return this.setState({error_msg: 'Niepoprawny identyfikator'});
		this.loadData(this.props.match.params.id);
	}

	async loadData(_id: string) {
		this.setState({loading: true});

		try {
			let res = await Utils.postRequest(Config.server_url + '/get_wl_request_details', {
				id: _id,
				token: Cookies.getCookie('token')
			});

			if(res.result === 'PERMISSION_DENIED')
				return this.props.history.push('/login');

			//console.log( res );
			if(res.result !== 'SUCCESS')
				return this.setState({error_msg: 'Coś poszło nie tak', loading: false});

			this.setState({
				loading: false, 
				error_msg: undefined, 
				request_data: res.data.request,
				other_user_requests: res.data.other_user_requests
			});
		}
		catch(e) {
			console.error(e);
			this.setState({error_msg: 'Nie udało się załadować danych', loading: false})
		}
	}

	renderUserRequest(data: RequestDetailSchema) {
		return <div className='request-details'>
			TODO
		</div>;
	}

	render() {
		return <div className='container request-details-main'>
			{this.state.error_msg && <span className='error-msg'>{this.state.error_msg}</span>}
			<span>{this.state.loading && 'Ładowanie'}</span>
			{this.state.request_data && 
				this.renderUserRequest(this.state.request_data)}
			{this.state.other_user_requests.length > 0 && <>
				<div className='others_separator'><hr/><span>Inne podania tego gracza</span><hr/></div>
				{this.state.other_user_requests.map(this.renderUserRequest.bind(this))}
			</>}
		</div>;
	}
}

export default withRouter(RequestDetails);