import React from 'react';

import './../styles/news_container.scss';

interface NewsSchema {
	title: string;
	date: string;
	content: string;
}

interface NewsState {
	news: NewsSchema[];
}

export default class NewsContainer extends React.Component<any, NewsState> {
	state: NewsState = {
		news: []
	};

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		//if(process.env.NODE_ENV === 'development') {
			//generate sample data
			let sample_news: NewsSchema[] = [];
			for(let i=0; i<6; i++) {
				sample_news.push({
					title: `Ogłoszenie ${i+1}`,
					date: new Date().toLocaleString(),
					content: LOREM_IPSUM
				});
			}
			this.setState({news: sample_news});
			return;
		//}
	}

	render() {
		return <div className='news-container container'>
			{this.state.news.map((data, i) => {
				return <article key={i}>
					<label className='title'>{data.title}</label>
					<span className='date'>{data.date}</span>
					<div className='content'>{data.content}</div>
				</article>;
			})}
		</div>;
	}
}

var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';