const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const passport = require('./config/passport');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { initSocket } = require('./socket'); // Importando a função de inicialização do Socket.io

const app = express();
const server = http.createServer(app);

// Inicializa o Socket.io
initSocket(server);

// Configurar evento de conexão do Socket.IO
const io = require('./socket').getSocket();
io.on('connection', (socket) => {
  console.log('Novo cliente conectado', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });
});

// Outras configurações de CORS
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do middleware de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;

// Suas rotas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/categories", categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

// Iniciar o servidor
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
