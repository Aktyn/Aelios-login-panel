import * as React from 'react';
import * as ReactDom from 'react-dom';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
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
	current_id?: string;

	error_msg?: string;
	loading: boolean;

	request_data?: RequestDetailSchema,
	other_user_requests: RequestDetailSchema[]
}

class RequestDetails extends React.Component<any, RequestDetailsState> {
	private acceptBtn: HTMLButtonElement | null = null;
	private acceptTimeout: NodeJS.Timeout | null = null;

	private rejectBtn: HTMLButtonElement | null = null;
	private rejectTimeout: NodeJS.Timeout | null = null;

	state: RequestDetailsState = {
		loading: false,
		request_data: undefined,
		other_user_requests: []
	}

	constructor(props: any) {
		super(props);
	}

	private get request_id() {
		return this.props.match.params.id;
	}

	componentWillUnmount() {
		if(this.acceptTimeout !== null)
			clearTimeout(this.acceptTimeout);
		if(this.rejectTimeout !== null)
			clearTimeout(this.rejectTimeout);
	}

	componentDidMount() {
		if(!this.request_id)
			return this.setState({error_msg: 'Niepoprawny identyfikator'});
		this.loadData(this.request_id);
	}

	componentDidUpdate(prevProps: any) {		
		this.loadData(this.request_id);
	}

	async loadData(_id: string) {
		if(this.state.current_id === _id)
			return;
		(ReactDom.findDOMNode(this) as Element).scrollIntoView();
		this.setState({current_id: _id, loading: true});

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

	async changeRequestStatus(_id: string, next_status: string, _user_id: number) {
		console.log('changing', _id, 'to', next_status);

		this.setState({loading: true});

		try {
			let res = await Utils.postRequest(Config.server_url + '/change_wl_request_status', {
				id: _id,
				status: next_status,
				user_id: _user_id,
				token: Cookies.getCookie('token')
			});

			if(res.result === 'PERMISSION_DENIED')
				return this.props.history.push('/login');

			if(res.result !== 'SUCCESS')
				return this.setState({error_msg: 'Nie udało się zmienić statusu podania', loading: false});

			this.setState({loading: false, error_msg: undefined});

			//go to list of requests of given status
			this.props.history.push(`/wl_requests/${next_status}`);
		}
		catch(e) {
			console.error(e);
			this.setState({error_msg: 'Nie udało się zmienić statusu podania', loading: false})
		}
	}

	tryAccept(_id: string, user_id: number) {
		if(!this.acceptBtn)
			return;
		if(this.acceptTimeout === null) {
			this.acceptBtn.innerText = 'NA PEWNO?';
			this.acceptTimeout = setTimeout(() => {
				if(this.acceptBtn)
					this.acceptBtn.innerText = 'AKCEPTUJ';
				this.acceptTimeout = null;
			}, 5000) as never;
		}
		else {
			this.changeRequestStatus(_id, 'accepted', user_id);
		}
	}

	tryReject(_id: string, user_id: number) {
		if(!this.rejectBtn)
			return;
		if(this.rejectTimeout === null) {
			this.rejectBtn.innerText = 'NA PEWNO?';
			this.rejectTimeout = setTimeout(() => {
				if(this.rejectBtn)
					this.rejectBtn.innerText = 'ODRZUĆ';
				this.rejectTimeout = null;
			}, 5000) as never;
		}
		else {
			this.changeRequestStatus(_id, 'rejected', user_id);
		}
	}

	renderUserRequest(data: RequestDetailSchema, index: number, render_btns = false) {
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

			{render_btns === true ?
				<div className='buttons'>
					{ (data.status === 'pending' || data.status === 'rejected') && 
						<button className='accept-btn' ref={el=>this.acceptBtn=el} onClick={() => {
							this.tryAccept(data._id, data.user_id);
						}}>AKCEPTUJ</button> }
					{ (data.status === 'pending' || data.status === 'accepted') && 
						<button className='reject-btn' ref={el=>this.rejectBtn=el} onClick={() => {
							this.tryReject(data._id, data.user_id);
						}}>ODRZUĆ</button> }
				</div>
				:
				<div className='buttons'>
					<Link to={`/request_details/${data._id}`}>Zarządzaj podaniem</Link>
				</div>
			}
		</div>;
	}

	render() {
		return <div className='container request-details-main'>
			<div style={{textAlign: 'right'}}>
				<Link to='/wl_requests'>Zamknij</Link>
				<hr/>
			</div>
			{this.state.error_msg && <span className='error-msg'>{this.state.error_msg}</span>}
			<span>{this.state.loading && 'Ładowanie'}</span>
			{this.state.request_data && 
				this.renderUserRequest(this.state.request_data, 7331, true)}
			{this.state.other_user_requests.length > 0 && <>
				<div className='others_separator'><hr/><span>Inne podania tego gracza</span><hr/></div>
				{this.state.other_user_requests.map((data, i) => this.renderUserRequest(data, i))}
			</>}
		</div>;
	}
}

export default withRouter(RequestDetails);