const clarifai = require("clarifai");

const clarifaiApp = new Clarifai.App({
  apiKey: 'API key provided by Clarifai'
});

const handleDetect = (req, res, db) => {
  const { id, name, email, imageUrl } = req.body;

  if ( !id || !email || !name || !imageUrl) {
    return res.status(400).json('incorrect form submission')
}
  db("users")
    .where({
      id,
      name,
      email,
    })
    .then((users) => {
      if (users.length == 1) {
        clarifaiApp.models
          .predict(Clarifai.FACE_DETECT_MODEL, imageUrl)
          .then((response) => {
            if (Object.keys(response.outputs[0].data).length !== 0) {
              res.json(response.outputs[0].data.regions);
            } else {
              res.json("no face found");
            }
          })
          .catch((err) => res.status(400).json("error with Clarifai API"));
      } else {
        res.status(400).json("unable to identify user");
      }
    })
    .catch((err) => res.status(400).json("invalid request"));
};

module.exports = {
  handleDetect,
};
