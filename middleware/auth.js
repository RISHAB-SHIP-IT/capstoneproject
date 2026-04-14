const API_KEY = "my-secret-key";

module.exports = function (req, res, next) {
  const key = req.headers["x-api-key"];

  if (!key || key !== API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
};