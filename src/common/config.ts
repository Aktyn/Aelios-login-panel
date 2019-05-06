export default {
	server_url: process.env.NODE_ENV === 'development' ? 
		'http://localhost:2357' : 
		'http://51.75.251.124:2357',

	//those forum groups can play
	//WHITELISTED_GROUPS: [12, 18, 10, /*13,*/ 7, 6, 14, 16, 11],

	MAXIMUM_REQUESTS: 2,
	REQUESTS_TIME_BREAK: 1000 * 60 * 60 * 24//24 hours between requests
}