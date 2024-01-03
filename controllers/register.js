const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
      return res.status(400).json('incorrect form submission')
  }
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => {
          console.log(err);
          res.status(400).json("unable to register");
      });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err)=>{
    if (err.code == '23505') {
      res.status(409).json("Email already exists");
    } else {
      console.log(err);
      res.status(500).json("Unexpected server error has happened.")
    }    
  });
};

module.exports = {
  handleRegister
};
