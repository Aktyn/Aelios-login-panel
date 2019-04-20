export default {
	postRequest: function(to: string, data: string | {[index: string]: any}) {
		if(typeof data !== 'string')
			data = JSON.stringify(data);

		return fetch(to, {
			method: "POST",
			mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
			headers: {"Content-Type": "application/json; charset=utf-8"},
			body: data
		}).then(res => res.json());
	},

	getRequest: function(to: string, params: string | {[index: string]: any}) {
		if(typeof params !== 'string') {
			params = Object.keys(params).map(key => //'key=params[key]'
				`${key}=${(<{[index: string]: any}>params)[key]}`).join('&');
		}
		return fetch(`${to}?${params}`, {
			method: "GET",
			mode: 'cors'//process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
			//headers: {"Content-Type": "application/json; charset=utf-8"},
		}).then(res => res.json());
	}
}