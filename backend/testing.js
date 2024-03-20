const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '@slAmalef12',
    database: 'registration'
}).promise();

async function fetchData() {
    try {
        const [rows, fields] = await pool.query("SELECT * FROM registration;");
        console.log(rows);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        // Remember to release the connection when done
        pool.end();
    }
}

fetchData();
