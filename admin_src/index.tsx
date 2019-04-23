import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './styles/main.scss';

import Login from './components/login';
import MainLayout from './components/main_layout';
import WlRequests from './components/wl_requests';
import RequestDetails from './components/request_details';

// if(process.env.NODE_ENV !== 'development')

function NotFound(props: any) {
	return <div>ERROR - route not found</div>
}

render(<BrowserRouter>
	<MainLayout>
		<Switch>
			<Route path="/" exact component={WlRequests} />
			<Route path="/wl_requests/:category" component={WlRequests} />
			<Route path="/wl_requests" component={WlRequests} />
			<Route path="/login" component={Login} />
			<Route path='/request_details/:id' component={RequestDetails} />
			<Route path='/request_details' component={RequestDetails} />
			<Route path="*" component={NotFound} />
		</Switch>
	</MainLayout>
</BrowserRouter>, document.getElementById('main_view'));