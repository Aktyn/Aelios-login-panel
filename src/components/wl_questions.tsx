import React, {createRef} from 'react';
//import { withRouter } from 'react-router-dom';
import AccountData from './../common/account_data';
import Utils from './../common/utils';
import Config from './../common/config';
import {Pages} from './home';

// declare var alt: any;
import './../styles/wl_questions_view.scss';

const example_avatar = 'https://forum.aelios.pl/uploads/monthly_2019_04/avatar.thumb.png.0b0eb77ae08993ec25942eb723ccb55e.png';

interface WlQuestionsProps {
	switchPage: (page: Pages) => void;
}

interface WlQuestionsState {
	nick?: string;
	avatar?: string;//url
	error_msg?: string;
}

export default class WlQuestions extends React.Component<WlQuestionsProps, WlQuestionsState> {
	private sendTimeout: number | null = null;
	private sendBtn = createRef<HTMLButtonElement>();

	private logoutTimeout: number | null = null;
	private logoutBtn = createRef<HTMLButtonElement>();

	state: WlQuestionsState = {};

	//answers references
	
	private nick_input = createRef<HTMLInputElement>();
	private data_ur = createRef<HTMLInputElement>();
	private steam_id = createRef<HTMLInputElement>();
	private stream_link = createRef<HTMLInputElement>();
	private roleplay_desc = createRef<HTMLTextAreaElement>();
	private roleplay_exp = createRef<HTMLTextAreaElement>();
	private prev_characters = createRef<HTMLTextAreaElement>();
	private next_characters = createRef<HTMLTextAreaElement>();
	private character_history = createRef<HTMLTextAreaElement>();
	private situation1 = createRef<HTMLTextAreaElement>();
	private situation2 = createRef<HTMLTextAreaElement>();
	private situation3 = createRef<HTMLTextAreaElement>();
	private select1 = createRef<HTMLSelectElement>();
	private select2 = createRef<HTMLSelectElement>();

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		let accData = AccountData.getData();
		if(accData) {
			this.setState({
				nick: accData.name,
				avatar: accData.avatar
			});
		}
	}

	componentWillUnmount() {
		if(this.sendTimeout !== null)
			clearTimeout(this.sendTimeout);
		if(this.logoutTimeout)
			clearTimeout(this.logoutTimeout);
	}

	tryLogout() {
		if(!this.logoutBtn.current)
			return;
		if( this.logoutTimeout === null ) {

			this.logoutBtn.current.innerText = 'NA PEWNO?';
			this.logoutTimeout = setTimeout(() => {
				if(this.logoutBtn.current)
					this.logoutBtn.current.innerText = 'WYLOGUJ';
				this.logoutTimeout = null;
			}, 5000) as never;
		}
		else
			this.props.switchPage(Pages.HOME);
			//this.props.history.push(`/`);
	}

	trySend() {
		if(!this.sendBtn.current)
			return;
		if( this.sendTimeout === null ) {

			this.sendBtn.current.innerText = 'NA PEWNO?';
			this.sendTimeout = setTimeout(() => {
				if(this.sendBtn.current)
					this.sendBtn.current.innerText = 'WYŚLIJ';
				this.sendTimeout = null;
			}, 5000) as never;
		}
		else {
			this.sendBtn.current.innerText = 'WYSYŁANIE';
			this.send();
		}
	}

	async send() {
		let account = AccountData.getData();

		if(!this.nick_input.current || !this.data_ur.current || !this.steam_id.current ||
			!this.stream_link.current || !this.roleplay_desc.current || !this.roleplay_exp.current ||
			!this.prev_characters.current || !this.next_characters.current || 
			!this.character_history.current || !this.situation1.current || !this.situation2.current ||
			!this.situation3.current || !this.select1.current || !this.select2.current)
		{
			return;
		}

		let answers = {
			nick_input: this.nick_input.current.value,
			data_ur: this.data_ur.current.value,
			steam_id: this.steam_id.current.value,
			stream_link: this.stream_link.current.value,
			roleplay_desc: this.roleplay_desc.current.value,
			roleplay_exp: this.roleplay_exp.current.value,
			prev_characters: this.prev_characters.current.value,
			next_characters: this.next_characters.current.value,
			character_history: this.character_history.current.value,
			situation1: this.situation1.current.value,
			situation2: this.situation2.current.value,
			situation3: this.situation3.current.value,
			select1: this.select1.current.selectedOptions[0].innerText,
			select2: this.select2.current.selectedOptions[0].innerText
		}

		let res = await Utils.postRequest(Config.server_url+'/apply_wl_request', {
			user_id: account ? account.id : 4,//Aktyn id is 4
			answers: answers
		});

		// console.log(res);
		if(res.result !== 'SUCCESS')
			this.setState({error_msg: 'Nie można wysłać zapytania'});
		else
			this.props.switchPage(Pages.HOME);
			//this.props.history.push(`/`);

		//console.log( answers );
	}

	render() {
		return <div className='wl-questions-main container'>
			<h1>
				<img src={this.state.avatar || example_avatar} />
				Witaj {this.state.nick||'Unknown nickname'}<br/>
				Twoja konto nie figuruje na whiteliście.<br/>
				Wypełnij poniższy formularz w celu złożenia podania.
			</h1>
			<hr/>
			<div className='questions'>
				<div className='single-row'>
					<label>Nick Discord:</label>
					<input type="text" maxLength={256} ref={this.nick_input} />
				</div>
				<div className='single-row'>
					<label>Data urodzenia:</label>
					<input type="date" maxLength={32} ref={this.data_ur} />
				</div>
				<div className='single-row'>
					<label>SteamID:</label>
					<input type="text" maxLength={32} ref={this.steam_id} />
				</div>
				<div>
					<label>Streamujesz, nagrywasz lub masz jakiś przykład twojej akcji RolePlay? Podaj nam link do niej!</label>
					<input type="text" maxLength={64} ref={this.stream_link} />
				</div>
				<div>
					<label>Co to twoim zdaniem jest RolePlay?</label>
					<textarea maxLength={4096} ref={this.roleplay_desc}></textarea>
				</div>
				<div>
					<label>Jakie jest twoje doświadczenie w RolePlay oraz czy grałes na innych serwerach?</label>
					<textarea maxLength={4096} ref={this.roleplay_exp}></textarea>
				</div>
				<div>
					<label>Jakie postacie odgrywałeś?</label>
					<textarea maxLength={4096} ref={this.prev_characters}></textarea>
				</div>
				<div>
					<label>Jakie postacie chciałbyś odegrać na naszym serwerze?</label>
					<textarea maxLength={4096} ref={this.next_characters}></textarea>
				</div>
				<div>
					<label>Historia Postaci, którą chcesz odgrywać</label>
					<textarea maxLength={4096} ref={this.character_history}></textarea>
				</div>
				<div>
					<label>Uderzasz z dużą prędkością w inne auto podczas ucieczki przed policją. Jak byś się zachował?</label>
					<textarea maxLength={4096} ref={this.situation1}></textarea>
				</div>
				<div>
					<label>Rozmawiasz na ulicy ze znajomym. Nagle podjeżdża czarne auto z zamaskowanymi osobami i każą ci podnieść ręce ale nie posiadają żadnej broni. Jak byś się zachował?</label>
					<textarea maxLength={4096}ref={this.situation2} ></textarea>
				</div>
				<div>
					<label>Porwano Ci kolegę 1 osoba celuje do niego, a ty celujesz do napastnika. Jak byś się zachował?</label>
					<textarea maxLength={4096} ref={this.situation3}></textarea>
				</div>
				<div>
					<label>Inni gracze Cię śledzą i nagle zagapiłeś się i wjechałeś w budynek. Co byś zrobił?</label>
					<select ref={this.select1}>
						<option value="1">Jechałbym dalej</option>
						<option value="2">Wysiadłbym od razu i do nich celował</option>
						<option value="3">Odegrał rannego</option>
					</select>
				</div>
				<div>
					<label>3 napastników celuje do Ciebie. Co byś zrobił?</label>
					<select ref={this.select2}>
						<option value="1">Klikasz ALT + F4</option>
						<option value="2">Podnosisz ręce</option>
						<option value="3">Podchodzisz do jednego z napastników i zaczynasz go bić</option>
					</select>
				</div>
			</div>
			<div>
				<div className='error-msg'>{this.state.error_msg}</div>
				<button style={{marginBottom: '10px'}} ref={this.sendBtn} 
					onClick={this.trySend.bind(this)}>WYŚLIJ</button>
				<br/>
				<button style={{marginBottom: '10px'}} ref={this.logoutBtn} 
					onClick={this.tryLogout.bind(this)}>WYLOGUJ</button>
			</div>
		</div>;
	}
}

//export default withRouter(WlQuestions);