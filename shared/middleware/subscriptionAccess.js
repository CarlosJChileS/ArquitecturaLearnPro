// Simple middleware to check subscription
const subscriptions = require('../../core/domain/subscriptions');
const supabase = require('../utils/supabaseClient');

module.exports = async function (req, res, next) {
  const userId = req.header('x-user-id');
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) return res.status(500).json({ error: error.message });
    if (!data.length) {
      return res.status(403).json({ error: 'Subscription required' });
    }
    return next();
  }
  const hasActive = subscriptions.find(s => s.userId === userId && s.active);
  if (!hasActive) {
    return res.status(403).json({ error: 'Subscription required' });
  }
  next();
};
