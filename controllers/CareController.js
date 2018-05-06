module.exports = function (mysql, connectProperties) {
	return {
		createCare(care) {
			const insertQuery = `INSERT INTO care (patient_id, destination_lat, destination_long) VALUES ('${care.patient_id}', '${care.destination_lat}', '${care.destination_long}')`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		getCare(id) {
			if (isNaN(+id)) {
				return;
			}

			const get = `SELECT * FROM care WHERE id=${+id}`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		filter(filter) {
			const familyMemberId = filter.familyMemberId;
			const isFamilyMember = familyMemberId !== '' && familyMemberId !== undefined;
			const maxDistanceInMiles = 50
			const query = `SELECT * FROM ( SELECT c.*, p.radius, p.distance_unit * DEGREES(ACOS(COS(RADIANS(p.latpoint)) `
					+ `* COS(RADIANS(c.destination_lat)) * COS(RADIANS(p.longpoint - c.destination_long)) `
					+ `+ SIN(RADIANS(p.latpoint)) * SIN(RADIANS(c.destination_lat)))) AS distance `
					+ `FROM care AS c `
					+ (isFamilyMember ? `JOIN family_relations ON c.patient_id = family_relations.patient_id` : '')
					+ ` JOIN (SELECT ${filter.lat} AS latpoint, ${filter.long} AS longpoint, ${maxDistanceInMiles} AS radius, 69.0 AS distance_unit) AS p ON 1=1 `
					+ `WHERE c.destination_lat BETWEEN p.latpoint - (p.radius / p.distance_unit) `
					+ `AND p.latpoint + (p.radius / p.distance_unit) AND c.destination_long `
					+ `BETWEEN p.longpoint - (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint)))) `
					+ `AND p.longpoint + (p.radius / (p.distance_unit * COS(RADIANS(p.latpoint))))) AS d `
					+ `WHERE distance <= radius `
					+ (isFamilyMember ? `AND family_member_id = ${familyMemberId} ` : ' AND patient_id is not null ')
					+ `AND driver_id is null `
					+ `ORDER BY distance `
					+ `LIMIT 15`;

			// would also add the geofencing here

			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(query);
				conn.end();
				return res;
			});
		},

		setFamilyMemberId(careId, familyMemberId) {
			const insertQuery = `UPDATE care SET family_member_id = ${familyMemberId} WHERE id = ${careId}`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		setDriverId(careId, driverId) {
			const insertQuery = `UPDATE care SET driver_id = ${driverId} WHERE id = ${careId}`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		setFamilyDone(careId) {
			const insertQuery = `UPDATE care SET family_done = 1 WHERE id = ${care.id}`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		setDriverDone(ownerId) {
			const insertQuery = `UPDATE care SET driver_done = 1 WHERE id = ${care.id}`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		}
	};
};