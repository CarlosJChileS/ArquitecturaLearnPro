const paymentsRouter = require('./payments');
const { verifyStripeSession } = require('./payments');
const { router: subscriptionsRouter, subscriptions } = require('./subscriptions');

module.exports = {
  paymentsRouter,
  subscriptionsRouter,
  subscriptions,
  verifyStripeSession
};
