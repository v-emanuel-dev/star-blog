const bcrypt = require('bcrypt');
const db = require('../config/db'); // Ajuste para o caminho correto do seu arquivo de configuração do banco

exports.getAllUsers = (req, res) => {
    const query = 'SELECT id, username, email, role, profilePicture FROM users'; // Inclua o que quiser retornar

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        res.status(200).json(results); // Retorna todos os usuários
    });
};

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

exports.updateUserAdmin = (req, res) => {
    const { username, email, password, role } = req.body;
    const { id } = req.params;
    const profilePicture = req.file ? req.file.path : null;

    console.log('Admin update request received');
    console.log('User ID:', id);
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Role:', role);
    console.log('Profile Picture Provided:', profilePicture ? 'Yes' : 'No');

    let updateQuery = 'UPDATE users SET username = ?, email = ?';
    const queryParams = [username, email];

    if (role) {
        updateQuery += ', role = ?';
        queryParams.push(role);
    }

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
    queryParams.push(id);

    db.query(updateQuery, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.affectedRows === 0) {
            console.warn('No user found with ID:', id);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User information updated successfully for ID:', id);
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
    
        // Verifica se a imagem de perfil existe e trata dependendo do formato
        if (user.profilePicture) {
            // Verifica se a imagem é uma URL completa
            if (user.profilePicture.startsWith('http://') || user.profilePicture.startsWith('https://')) {
                // É uma URL externa (como do Google), mantém a URL externa como está
                user.profilePicture = user.profilePicture;
            } else {
                // É um caminho local, troca barras invertidas por barras normais e adiciona o prefixo
                user.profilePicture = `http://localhost:3000/${user.profilePicture.replace(/\\/g, '/')}`;
            }
        }        
    
        res.status(200).json(user);
    });
};

// Função para deletar um usuário (apenas para admins)
exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    const requestingUserRole = req.userRole; // Supondo que você tenha configurado o middleware que adiciona o papel do usuário na requisição

    console.log('Received delete request for user ID:', userId); // Log do ID do usuário
    console.log('Requesting user role:', requestingUserRole); // Log do papel do usuário

    // Verifica se o ID do usuário é um número válido
    if (isNaN(userId)) {
        console.warn('Invalid user ID received:', userId);
        return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // Somente administradores podem deletar usuários
    if (requestingUserRole !== 'admin') {
        console.warn('Access denied for user role:', requestingUserRole);
        return res.status(403).json({ message: 'Access denied. Only administrators can delete users.' });
    }

    const deleteQuery = 'DELETE FROM users WHERE id = ?';

    db.query(deleteQuery, [userId], (error, results) => {
        if (error) {
            console.error('Error executing query', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.affectedRows === 0) {
            console.warn('No user found with ID:', userId); // Log quando nenhum usuário é encontrado
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log('User deleted successfully with ID:', userId);
        res.status(200).json({ message: 'User deleted successfully' });
    });
};

