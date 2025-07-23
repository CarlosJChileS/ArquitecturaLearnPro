module.exports = function (req, res, next) {
  const role = req.header('x-user-role');
  if (role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
};
