export interface PaymentStrategy {
  pay(amount: number): void;
}

export class PayPalStrategy implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`PayPal paying ${amount}`);
  }
}

export class StripeStrategy implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`Stripe paying ${amount}`);
  }
}

export class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  checkout(amount: number): void {
    this.strategy.pay(amount);
  }
}
