import React from 'react';
import { render } from 'react-dom';

import './styles/main.scss';

import Layout from './components/layout';

declare var alt: any;

if(process.env.NODE_ENV !== 'development') {
	try {
		window.addEventListener('load', function() {
			console.log('view loaded');
			alt.emit('viewLoaded');
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

//console.log(new Date(Date.now() + 1000*60*60*24*7), new Date(Date.now() + 1000*60*60*24*7).getTime());
if(Date.now() > 1556449160780)//28. april
	render(<div>Wersja próbna wygasła.<br/>Skontaktuj się z twórcą aplikacji</div>, 
		document.getElementById('main_view'));
else
	render(<Layout/>, document.getElementById('main_view'));