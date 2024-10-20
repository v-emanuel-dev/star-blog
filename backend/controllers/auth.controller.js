const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Registro de usuário
exports.register = (req, res) => {
  const { email, password, username, role = 'user' } = req.body; // Captura o role com valor padrão 'user'

  // Verifica se o usuário já existe
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Cria um novo usuário
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (email, password, username, role) VALUES (?, ?, ?, ?)', [email, hashedPassword, username, role], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating user', error: err });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  });
};

// Login do usuário
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Verifica a senha
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ accessToken: null, message: 'Invalid password' });
    }

    // Gera um token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });

    // Log do usuário que está fazendo login
    console.log('User logged in:', { id: user.id, username: user.username }); // Log do usuário que logou

    // Envia o nome do usuário, email, id e profilePicture na resposta
    res.status(200).json({
      accessToken: token,
      username: user.username || 'Usuário',
      email: user.email,
      userId: user.id,
      profilePicture: user.profilePicture || null, // Inclua a profilePicture
      userRole: user.role // Adicione esta linha para incluir o role do usuário
    });    
  });
};



