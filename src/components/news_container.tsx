import React from 'react';
import Utils from './../common/utils';

import './../styles/news_container.scss';

interface TopicSchema {
	topic_id: string;//numeric string
	topic_author: string;
	topic_title: string;
	topic_value: string;
}

interface NewsState {
	topics: TopicSchema[];
	error_msg?: string;
}

//http://forum.aelios.pl/ogloszenia.php?key=3e4966da53a0e52cf5be50732a624b26

export default class NewsContainer extends React.Component<any, NewsState> {
	state: NewsState = {
		topics: []
	};

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		//generate sample data
		/*	let sample_news: TopicSchema[] = [];
			for(let i=0; i<6; i++) {
				sample_news.push({
					title: `Ogłoszenie ${i+1}`,
					date: new Date().toLocaleString(),
					content: LOREM_IPSUM
				});
			}
			this.setState({topics: sample_news});
			return;
		*/
		this.loadTopics();
	}

	async loadTopics() {
		try {
			let topics_data: TopicSchema[] = 
				await Utils.getRequest(`http://forum.aelios.pl/ogloszenia.php`, 
					{'key': '3e4966da53a0e52cf5be50732a624b26'}, false);

			if(Array.isArray(topics_data)) {
				topics_data.reverse();
				for(let top of topics_data) {
					top.topic_value = top.topic_value//decodeURIComponent(top.topic_value)
						.replace(/<___base_url___>/gi, 'https://forum.aelios.pl')
							.replace(/<a([^>]*)>/g, " <a target='_blank' $1");
				}
			}
			this.setState({topics: topics_data});
			//console.log(topics_data);
		}
		catch(e) {
			this.setState({error_msg: 'Nie udało się pobrać tematów z forum: ' + e});
			console.error(e);
		}
	}

	render() {
		return <div className='topics-container container'>
			{this.state.error_msg && <div className='error-msg'>{this.state.error_msg}</div>}
			{this.state.topics.map((data, i) => {
				return <article key={i}>
					<label className='title'>{data.topic_title}</label>
					<div className='author'>{data.topic_author}</div>
					<div className='content' dangerouslySetInnerHTML={{__html: data.topic_value}}></div>
				</article>;
			})}
		</div>;
	}
}

//var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';