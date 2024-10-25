const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
  
  const email = profile.emails[0].value;
  const username = profile.displayName.replace(/\s+/g, '').toLowerCase(); // Ajuste do nome de usuário
  const profilePicture = profile.photos[0]?.value || null;

  console.log('Searching for user by email:', email); // Log da busca do usuário
  User.findByEmail(email, (err, user) => {
    if (err) {
      console.error('Error finding user by email:', err);
      return done(err);
    }

    if (user) {
      console.log('User found in the database:', user);
      return done(null, user);
    } else {
      console.log('User not found, creating a new one');
      // Usuário não encontrado, criar um novo
      User.create({
        email,
        username,
        password: 'dummyhashedpassword', // Placeholder, já que a senha não é relevante para login com Google
        profilePicture,
      }, (err, newUser) => {
        if (err) {
          console.error('Error creating new user:', err);
          return done(err);
        }
        console.log('New user created:', newUser);
        return done(null, newUser);
      });
    }
  });
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user with ID:', user.id); // Log para serialização
  done(null, user.id); // Serializa apenas o ID do usuário
});

passport.deserializeUser((id, done) => {
  console.log('Deserializing user with ID:', id); // Log para deserialização
  User.findById(id, (err, user) => {
    if (err) {
      console.error('Error deserializing user:', err);
    }
    done(err, user); // Recupera o usuário do banco de dados
  });
});

module.exports = passport;
