export default {
	server_url: process.env.NODE_ENV === 'development' ? 
		'http://localhost:2357' : 
		'http://51.75.251.124:2357',
}