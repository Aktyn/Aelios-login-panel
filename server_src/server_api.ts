import * as express from 'express';
import * as bodyParser from 'body-parser';
import Database from './database';

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