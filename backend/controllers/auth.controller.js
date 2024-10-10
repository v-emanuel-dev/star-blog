const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Registro de usuário
exports.register = (req, res) => {
  const { email, password, username } = req.body; // Captura o username

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
    db.query('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', [email, hashedPassword, username], (err, results) => {
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
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // expires in 24 hours
    });

    // Log do usuário que está fazendo login
    console.log('User logged in:', { id: user.id, username: user.username }); // Log do usuário que logou

    // Envia o nome do usuário, email e id na resposta
    res.status(200).json({ accessToken: token, username: user.username || 'Usuário', email: user.email, userId: user.id });
  });
};

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

exports.updateUser = (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.userId;
  const profilePicture = req.file ? req.file.path : null;

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
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User information updated successfully' });
  });
};


