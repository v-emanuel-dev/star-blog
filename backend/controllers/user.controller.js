const bcrypt = require('bcrypt');
const db = require('../config/db'); // Ajuste para o caminho correto do seu arquivo de configuração do banco

exports.updateUser = (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.userId; // O ID do usuário é obtido do token JWT
    const profilePicture = req.file ? req.file.path : null;

    console.log('Update User Request Received');
    console.log('User ID:', userId);
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Profile Picture Provided:', profilePicture ? 'Yes' : 'No');

    let updateQuery = 'UPDATE users SET username = ?, email = ?';
    const queryParams = [username, email];

    if (profilePicture) {
        updateQuery += ', profilePicture = ?';
        queryParams.push(profilePicture);
    }

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        updateQuery += ', password = ?';
        queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);

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
    const userId = req.params.id;

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const query = 'SELECT id, username, email, profilePicture FROM users WHERE id = ?';
    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error executing query', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = results[0];
        if (user.profilePicture) {
            user.profilePicture = `http://localhost:3000/${user.profilePicture}`;
        }
        res.status(200).json(user);
    });
};
