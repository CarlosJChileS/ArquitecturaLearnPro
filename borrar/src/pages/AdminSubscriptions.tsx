import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  profiles?: { full_name: string | null; email: string | null };
  subscription_plans?: { name: string | null };
}

const AdminSubscriptions: React.FC = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    const loadSubs = async () => {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('id, user_id, plan_id, starts_at, ends_at, status, profiles(full_name,email), subscription_plans(name)')
        .order('starts_at', { ascending: false });
      if (data) setSubs(data as Subscription[]);
    };
    loadSubs();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">Gestión de Suscripciones</h1>
        <Card>
          <CardHeader>
            <CardTitle>Suscripciones de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expira</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{s.profiles?.full_name || s.user_id}</span>
                        <span className="text-sm text-muted-foreground">{s.profiles?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{s.subscription_plans?.name || s.plan_id}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(s.ends_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {subs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No hay suscripciones registradas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
