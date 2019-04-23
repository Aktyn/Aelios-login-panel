import * as express from 'express';
import * as bodyParser from 'body-parser';
import Database from './database';
import AdminPanelAuthentication from './admin_panel_authentication';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//console.log(redirect_url);//TODO - info about whitelisting this url in google apis

var allowCrossDomain = function(req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

//if(process.env.NODE_ENV === 'dev')
	app.use(allowCrossDomain);

app.get('/test', async (req, res) => {
	res.json({result: 'SUCCESS'});
});


app.post('/wl_status', async (req, res) => {
	try {
		if(req.body.id === undefined) {
			res.json({result: 'ERROR'});
			return;
		}
		await Database.updateForumAccountData(req.body);

		res.json({
			result: 'SUCCESS', 
			status: await Database.checkWhitelistStatus(req.body.id)
		});
	}
	catch(e) {
		console.error(e);
		res.json({result: 'ERROR'});
	}
});

app.post('/apply_wl_request', async (req, res) => {
	try {
		let apply_result = await Database.applyWhitelistRequest(req.body.user_id, req.body.answers);

		res.json({
			result: apply_result ? 'SUCCESS' : 'CANNOT_APPLY_WL_REQUEST'
		});
	}
	catch(e) {
		console.error(e);
		res.json({result: 'ERROR'});
	}
});


//admin panel requests

app.post('/admin_panel_login', async (req, res) => {
	try {
		let token = await AdminPanelAuthentication.login(req.body.login, req.body.password);
		//console.log(token);

		if(token)
			res.json({result: 'SUCCESS', token: token});
		else 
			res.json({result: 'ERROR'});
		
	}
	catch(e) {
		console.error(e);
		res.json({result: 'ERROR'});
	}
});

/*app.post('/login_with_token', async (req, res) => {
	try {
		//console.log(req.body);
		let token = AdminPanelAuthentication.authnenticate(req.body.token);
		//console.log(token);
		if(token)
			res.json({result: 'SUCCESS'});
		else
			res.json({result: 'ERROR'});
	}
	catch(e) {
		console.error(e);
		res.json({result: 'ERROR'});
	}
});*/

app.post('/get_wl_requests', async (req, res) => {
	try {
		//let apply_result = await Database.applyWhitelistRequest(req.body.user_id, req.body.answers);
		if(!AdminPanelAuthentication.authnenticate(req.body.token))
			return res.json({result: 'PERMISSION_DENIED'});

		let wl_requests = await Database.getRequestsByStatus(req.body.status);

		res.json({
			result: 'SUCCESS',
			data: wl_requests
		});
	}
	catch(e) {
		console.error(e);
		res.json({result: 'ERROR'});
	}
	return;
});

app.post('/get_wl_request_details', async (req, res) => {
	try {
		//let apply_result = await Database.applyWhitelistRequest(req.body.user_id, req.body.answers);
		if(!AdminPanelAuthentication.authnenticate(req.body.token))
			return res.json({result: 'PERMISSION_DENIED'});

		let request_details = await Database.getRequestDetails(req.body.id);

		res.json({
			result: 'SUCCESS',
			data: request_details
		});
	}
	catch(e) {
		console.error(e);
		res.json({result: 'ERROR'});
	}
	return;
});

let running = false;

export default {
	//redirectUrl: Config.get_redirect_url(),
	run(port: number) {
		if(running) {
			console.log('express server already running');
			return;
		}
		running = true;
		app.listen(port, () => console.log(`Server listens on port: ${port}`));
	}
}