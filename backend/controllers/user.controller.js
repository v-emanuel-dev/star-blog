const bcrypt = require('bcrypt');
const db = require('../config/db'); // Substitua com o caminho correto para o seu arquivo de conexão com o banco de dados.

exports.updateUser = (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.userId; // O ID do usuário é obtido do token JWT
    const profilePicture = req.file ? req.file.path : null; // Pega o caminho da imagem

    console.log('Update User Request Received');
    console.log('User ID:', userId);
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password Provided:', password ? 'Yes' : 'No');
    console.log('Profile Picture Provided:', profilePicture ? 'Yes' : 'No');

    // Começa a construir a query SQL
    let updateQuery = 'UPDATE users SET username = ?, email = ?';
    const queryParams = [username, email];

    // Se houver uma nova imagem de perfil, adiciona à query
    if (profilePicture) {
        updateQuery += ', profilePicture = ?';
        queryParams.push(profilePicture);
        console.log('Profile picture path added to query:', profilePicture);
    }

    // Se houver uma nova senha, adiciona à query
    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10); // Gera a senha hash
        updateQuery += ', password = ?';
        queryParams.push(hashedPassword);
        console.log('Password hash generated and added to query');
    }

    // Adiciona a condição para o WHERE
    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);

    console.log('Executing query:', updateQuery);
    console.log('Query parameters:', queryParams);

    // Executa a query no banco de dados
    db.query(updateQuery, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            console.warn('No user found with ID:', userId);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User information updated successfully for ID:', userId);
        res.status(200).json({ message: 'User information updated successfully' });
    });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id; // Obtém o ID do usuário da URL

  // Verifica se o userId é um número
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  // Executa a consulta para obter o usuário
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Retorna os dados do usuário
    res.status(200).json(results[0]);
  });
};