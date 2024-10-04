const mysql2 = require('mysql2'); // Adicione esta linha para importar o mysql2

const db = mysql2.createConnection({
  host: 'localhost',
  user: 'root',        // Substitua pelo seu nome de usuário do MySQL
  password: 'root',      // Substitua pela sua senha do MySQL
  database: 'blog_db'       // Substitua pelo nome do seu banco de dados
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

module.exports = db;
