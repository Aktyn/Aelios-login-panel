import * as React from 'react';

interface MainLayoutState {
	show_github: boolean;
}

export default class MainLayout extends React.Component<any, MainLayoutState> {
	state: MainLayoutState = {
		show_github: false
	}

	constructor(props: any) {
		super(props);
	}

	switchFooter() {
		this.setState({show_github: !this.state.show_github});
	}

	render() {
		return <div className='main-layout'>
			<main>{this.props.children}</main>
			<footer><span onClick={this.switchFooter.bind(this)}>{
				this.state.show_github ? 
				<a href='https://github.com/Aktyn' target='_blank' style={{
					color: '#4DB6AC',
					fontWeight: 'bold'
				}}>Github</a> :
				<span>Created by Aktyn</span>
			}</span></footer>
		</div>;
	}
}