module.exports = function (req, res, next) {
  const role = req.header('x-user-role');
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};
