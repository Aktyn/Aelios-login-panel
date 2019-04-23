import * as React from 'react';
import {withRouter} from 'react-router';
import Utils from './../common/utils';
import Config from './../common/config';
import Cookies from './../common/cookies';

import './../styles/request_details.scss';

function getStatusName(status: string) {
	switch (status) {
		default:
		case 'pending': return 'Oczekujące';
		case 'accepted': return 'Zaakceptowane';
		case 'rejected': return 'Odrzucone';
	}
}

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

	tryAccept() {
		//TODO
	}

	tryReject() {
		//TODO
	}

	renderUserRequest(data: RequestDetailSchema, index: number) {
		if(data.forum_user.length < 1)
			return <div key={index}>Niepoprawne dane użytkownika</div>;
		return <div key={index} className='request-details'>
			<header>
				<span className='forum_acc'>
					<img src={data.forum_user[0].avatar} />
					<span>{data.forum_user[0].name}</span>
				</span>
				<span>{getStatusName(data.status)}</span>
				<span className='date'>{new Date(data.timestamp).toLocaleString('pl-PL')}</span>
			</header>
			
			<div className='answers'>
				<div className='single-row'>
					<label>Nick Discord:</label>
					<div>{data.answers.nick_input}</div>
				</div>
				<div className='single-row'>
					<label>Data urodzenia:</label>
					<div>{data.answers.data_ur}</div>
				</div>
				<div>
					<label>Streamujesz, nagrywasz lub masz jakiś przykład twojej akcji RolePlay? Podaj nam link do niej!</label>
					<div>{data.answers.stream_link}</div>
				</div>
				<div>
					<label>Co to twoim zdaniem jest RolePlay?</label>
					<div>{data.answers.roleplay_desc}</div>
				</div>
				<div>
					<label>Jakie jest twoje doświadczenie w RolePlay oraz czy grałes na innych serwerach?</label>
					<div>{data.answers.roleplay_exp}</div>
				</div>
				<div>
					<label>Jakie postacie odgrywałeś?</label>
					<div>{data.answers.prev_characters}</div>
				</div>
				<div>
					<label>Jakie postacie chciałbyś odegrać na naszym serwerze?</label>
					<div>{data.answers.next_characters}</div>
				</div>
				<div>
					<label>Historia Postaci, którą chcesz odgrywać</label>
					<div>{data.answers.character_history}</div>
				</div>
				<div>
					<label>Uderzasz z dużą prędkością w inne auto podczas ucieczki przed policją. Jak byś się zachował?</label>
					<div>{data.answers.situation1}</div>
				</div>
				<div>
					<label>Rozmawiasz na ulicy ze znajomym. Nagle podjeżdża czarne auto z zamaskowanymi osobami i każą ci podnieść ręce ale nie posiadają żadnej broni. Jak byś się zachował?</label>
					<div>{data.answers.situation2}</div>
				</div>
				<div>
					<label>Porwano Ci kolegę 1 osoba celuje do niego, a ty celujesz do napastnika. Jak byś się zachował?</label>
					<div>{data.answers.situation3}</div>
				</div>
				<div>
					<label>Inni gracze Cię śledzą i nagle zagapiłeś się i wjechałeś w budynek. Co byś zrobił?</label>
					<div>{data.answers.select1}</div>
				</div>
				<div>
					<label>3 napastników celuje do Ciebie. Co byś zrobił?</label>
					<div>{data.answers.select2}</div>
				</div>
			</div>

			<div className='buttons'>
				{ (data.status === 'pending' || data.status === 'rejected') && 
					<button className='accept-btn' onClick={this.tryAccept.bind(this)}>AKCEPTUJ</button> }
				{ (data.status === 'pending' || data.status === 'accepted') && 
					<button className='reject-btn' onClick={this.tryReject.bind(this)}>ODRZUĆ</button> }
			</div>
		</div>;
	}

	render() {
		return <div className='container request-details-main'>
			{this.state.error_msg && <span className='error-msg'>{this.state.error_msg}</span>}
			<span>{this.state.loading && 'Ładowanie'}</span>
			{this.state.request_data && 
				this.renderUserRequest(this.state.request_data, 7331)}
			{this.state.other_user_requests.length > 0 && <>
				<div className='others_separator'><hr/><span>Inne podania tego gracza</span><hr/></div>
				{this.state.other_user_requests.map(this.renderUserRequest.bind(this))}
			</>}
		</div>;
	}
}

export default withRouter(RequestDetails);