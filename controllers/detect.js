const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.CLARIFAI_API_KEY);

// const clarifai = require("clarifai");

// const clarifaiApp = new Clarifai.App({
//   apiKey: process.env.CLARIFAI_API_KEY
// });



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

        stub.PostModelOutputs(
          {
              // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
              model_id: "face-detection",
              inputs: [{data: {image: {url: imageUrl}}}]
          },
          metadata,
          (err, response) => {
              if (err) {
                  console.log("Error: " + err);
                  res.status(400).json("error with Clarifai API");
                  return;
              }
        
              if (response.status.code !== 10000) {
                  console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                  return;
              }
        
              if (Object.keys(response.outputs[0].data).length !== 0) {
                res.json(response.outputs[0].data.regions);
              } else {
                res.json("no face found");
              }
          }
        );
      } else {
        res.status(400).json("unable to identify user");
      }
    })
    .catch((err) => res.status(400).json("invalid request"));
};

module.exports = {
  handleDetect,
};
