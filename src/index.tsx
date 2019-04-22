import React from 'react';
import { render } from 'react-dom';
//import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './styles/main.scss';

import Home from './components/home';
//import WlQuestions from './components/wl_questions';

declare var alt: any;

if(process.env.NODE_ENV !== 'development') {
	try {
		window.addEventListener('load', function() {
			console.log('view loaded');
			try {
				alt.emit('viewLoaded');
			}
			catch(e) {
				console.error(e);
			}
		});

		alt.on('toogle_display', (show: boolean) => {
			let main_view = document.getElementById('main_view');
			if(!main_view)
				return;
			if(show)
				main_view.style.display = 'block';
			else
				main_view.style.display = 'none';
		});
	}
	catch(e) {
		console.error(e);
	}
}
else {
	let body = document.body;
	if(body) {
		body.style['backgroundColor'] = process.env.NODE_ENV !== 'development' ? 
			'transparent' : '#006064';
	}
}

/*function NotFound(props: any) {
	return <div>ERROR - route not found</div>
}*/

//console.log(new Date(Date.now() + 1000*60*60*24*7), new Date(Date.now() + 1000*60*60*24*7).getTime());
if(Date.now() > 1556449160780)//28. april
	render(<div>Wersja próbna wygasła.<br/>Skontaktuj się z twórcą aplikacji</div>, 
		document.getElementById('main_view'));
else {
	/*render(<BrowserRouter>
		<Switch>
    		<Route path="/wl_questions" exact component={WlQuestions} />
    		<Route path="*" component={Home} />
		</Switch>
  	</BrowserRouter>, document.getElementById('main_view'));*/
  	render(<Home/>, document.getElementById('main_view'));
}
/*

 */