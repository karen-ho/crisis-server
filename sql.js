
	const mysql = require('promise-mysql');

	mysql.createConnection({
	    host: 'localhost',
	    user: 'root',
	    password: '',
	    database: 'crisis'
	}).then(function(conn){
		let res = conn.query(insertQuery);
		conn.end();
		return res;
	});