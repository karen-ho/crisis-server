module.exports = function (mysql, connectProperties) {
	return {
		savePerson(person) {
			const insertQuery = `INSERT INTO person (name, role, phone) VALUES ('${person.name}', '${person.role}', '${person.phone}')`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		saveFamilyRelations(ownerId, patientIds) {
			if (!ownerId || !patientIds || !patientIds.length) {
				return;
			}

			const valuesToInsert = patientIds.map(patientId =>
				`(${ownerId}, ${patientId})`).join(', ');
			const insertQuery = `INSERT INTO family_relations (family_member_id, patient_id) VALUES ${valuesToInsert}`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		},

		saveAddress(id, lat, long) {
			const updateQuery = `UPDATE person SET lat = '${lat}', \`long\` = '${long}' WHERE id = '${id}'`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(updateQuery);
				conn.end();
				return res;
			});
		},

		getPerson(id) {
			if (isNaN(+id)) {
				return;
			}

			const get = `SELECT * FROM person WHERE id=${+id}`;
			return mysql.createConnection(connectProperties).then(conn => {
				const res = conn.query(insertQuery);
				conn.end();
				return res;
			});
		}
	};
};