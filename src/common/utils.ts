export default {
	postRequest: function(to: string, data: string | {[index: string]: any}) {
		if(typeof data !== 'string')
			data = JSON.stringify(data);

		return fetch(to, {
			method: "POST",
			mode: 'cors',//process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
			headers: {"Content-Type": "application/json; charset=utf-8"},
			body: data
		}).then(res => res.json());
	},

	getRequest: function(to: string, params: string | {[index: string]: any}, force_json = false) {
		if(typeof params !== 'string') {
			params = Object.keys(params).map(key => //'key=params[key]'
				`${key}=${(<{[index: string]: any}>params)[key]}`).join('&');
		}
		let options = {
			method: "GET",
			mode: 'cors'//process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
		};
		if(force_json)
			//@ts-ignore
			options.headers = {"Content-Type": "application/json; charset=utf-8"};
		//@ts-ignore
		return fetch(`${to}?${params}`, options).then(res => res.json());
	}
}