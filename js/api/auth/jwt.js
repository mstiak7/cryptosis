const data = require('folktale/core/adt/data');
const jwt = require('jsonwebtoken');

const JWT_LIFE_SPAN = process.env.JWT_LIFE_SPAN;
const JWT_SECRET = process.env.JWT_SECRET;

const JwtError = data('JwtError', {
  Expired: value => ({value}),
  Decode: value => ({value})
});

const generateToken = account => {
  const tokenValue = {
    userId: account.get('id'),
    name: account.get('name')
  };

  return jwt.sign(tokenValue, JWT_SECRET, {expiresIn: JWT_LIFE_SPAN});
};

const decodeToken = token => new Promise((resolve, reject) => {
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if(err) {
      return err.name === 'TokenExpiredError'
        ? reject(JwtError.Expired(token))
        : reject(JwtError.Decode());
    }
    else {
      resolve(decoded);
    }

  });
});


module.exports = {JwtError, generateToken, decodeToken};
