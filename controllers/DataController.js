module.exports = function (mysql, connectProperties) {
	return {
		saveData(data) {
			const values = data.map(row => `(${row.personId}, ${row.heartRate}, '${row.lat}', '${row.long}', '${new Date(row.clientCreatedTime).toISOString()}')`)
				.join(', ');
			const insertQuery = `INSERT INTO data (person_id, heart_rate, lat, \`long\`, client_created_time) `
				+ `VALUES ${values}`;
			return mysql.createConnection(connectProperties).then(conn => {
				console.log(insertQuery);
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		filter(personId, since, to) {
			const query = `SELECT * FROM data WHERE person_id = ${personId} `
				+ `AND client_created_time BETWEEN FROM_UNIXTIME(${since}) AND FROM_UNIXTIME(${to})`;

			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(query);
				conn.end();
				return res;
			});
		}
	};
};