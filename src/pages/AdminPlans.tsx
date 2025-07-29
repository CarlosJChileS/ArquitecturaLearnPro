import { useState } from 'react';
import { useSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminPlans: React.FC = () => {
  const { plans, updatePlanPrice } = useSubscriptionPlans();
  const [prices, setPrices] = useState<Record<string, number>>({});

  const handleChange = (id: string, value: string) => {
    setPrices((prev) => ({ ...prev, [id]: parseFloat(value) }));
  };

  const handleSave = async (plan: SubscriptionPlan) => {
    const price = prices[plan.id] ?? plan.price;
    const { error } = await updatePlanPrice(plan.id, price);
    if (!error) {
      setPrices((prev) => ({ ...prev, [plan.id]: price }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">Gestionar Precios de Planes</h1>
        {plans.map((plan) => (
          <Card key={plan.id} className="max-w-md">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={prices[plan.id] ?? plan.price}
                onChange={(e) => handleChange(plan.id, e.target.value)}
                className="w-32"
              />
              <Button onClick={() => handleSave(plan)}>Guardar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPlans;
