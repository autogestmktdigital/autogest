'use client';

import { useEffect, useState } from 'react';
import { Users, Car, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import apiClient from '@/lib/api';

interface StatsData {
  totalLeads: number;
  availableVehicles: number;
  activeConversations: number;
  conversionRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData>({
    totalLeads: 0,
    availableVehicles: 0,
    activeConversations: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [leadsRes, vehiclesRes, conversationsRes] = await Promise.allSettled([
          apiClient.get<{ success: boolean; data: { total: number; byStatus: Record<string, number> } }>('/leads/stats'),
          apiClient.get<{ success: boolean; data: unknown[]; total: number }>('/vehicles?status=available&limit=1'),
          apiClient.get<{ success: boolean; data: unknown[] }>('/conversations/active'),
        ]);

        const totalLeads = leadsRes.status === 'fulfilled' ? leadsRes.value.data.total : 0;
        const converted = leadsRes.status === 'fulfilled' ? (leadsRes.value.data.byStatus?.converted || 0) : 0;
        const availableVehicles = vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.pagination?.total : 0;
        const activeConversations = conversationsRes.status === 'fulfilled' ? conversationsRes.value.data.length : 0;
        const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

        setStats({
          totalLeads,
          availableVehicles,
          activeConversations,
          conversionRate,
        });
      } catch {
        // Keep default values
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Veículos Disponíveis',
      value: stats.availableVehicles,
      icon: Car,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Conversas Ativas',
      value: stats.activeConversations,
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <Header title="Dashboard" onMenuToggle={() => {}} />
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title} className="animate-slide-up">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {loading ? (
                        <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-200" />
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
