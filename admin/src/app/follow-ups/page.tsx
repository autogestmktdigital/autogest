'use client';

import { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import apiClient from '@/lib/api';
import {
  formatDateTime,
  followUpTypeLabels,
  followUpStatusLabels,
  followUpStatusColors,
} from '@/lib/utils';

interface FollowUp {
  id: number;
  type: string;
  status: string;
  scheduledFor: string;
  sentAt: string;
  messageContent: string;
  lead: {
    id: number;
    name: string;
    phone: string;
  };
}

type TabFilter = 'all' | 'scheduled' | 'sent' | 'failed';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [cancelId, setCancelId] = useState<number | null>(null);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  async function fetchFollowUps() {
    setLoading(true);
    try {
      // The backend doesn't have a dedicated follow-ups list endpoint,
      // so we fetch leads and aggregate follow-ups. For now, we'll use
      // a direct approach assuming the backend exposes follow-ups via leads.
      const res = await apiClient.get<{ success: boolean; data: FollowUp[] }>('/leads?limit=100');

      // If the API returns leads with follow-ups embedded, extract them
      // Otherwise, use the data as-is if it's a follow-ups endpoint
      if (Array.isArray(res.data)) {
        // Try to extract follow-ups from leads
        const allFollowUps: FollowUp[] = [];
        for (const item of res.data as unknown[]) {
          const lead = item as { id: number; name: string; phone: string; followUps?: FollowUp[] };
          if (lead.followUps) {
            for (const fu of lead.followUps) {
              allFollowUps.push({
                ...fu,
                lead: { id: lead.id, name: lead.name, phone: lead.phone },
              });
            }
          }
        }
        setFollowUps(allFollowUps);
      }
    } catch {
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancelId) return;
    try {
      // Cancel follow-up - this would need a backend endpoint
      // For now, we'll try PATCH approach
      await apiClient.patch(`/leads/${cancelId}/status`, { status: 'cancelled' });
      setCancelId(null);
      fetchFollowUps();
    } catch {
      setCancelId(null);
    }
  }

  const filteredFollowUps = followUps.filter((fu) => {
    if (activeTab === 'all') return true;
    return fu.status === activeTab;
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'sent', label: 'Enviados' },
    { key: 'failed', label: 'Falhou' },
  ];

  return (
    <div>
      <Header title="Follow-ups" onMenuToggle={() => {}} />
      <div className="p-4 sm:p-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Agendado para</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredFollowUps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum follow-up encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredFollowUps.map((fu) => (
                  <TableRow key={fu.id}>
                    <TableCell className="font-medium">
                      {fu.lead?.name || 'Sem nome'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {followUpTypeLabels[fu.type] || fu.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 max-w-xs text-sm text-gray-600">
                        {fu.messageContent || '—'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDateTime(fu.scheduledFor)}</TableCell>
                    <TableCell>
                      <Badge variant={followUpStatusColors[fu.status] as 'success' | 'warning' | 'danger' | 'default'}>
                        {followUpStatusLabels[fu.status] || fu.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {fu.status === 'scheduled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setCancelId(fu.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Cancel confirmation dialog */}
        <Dialog
          open={cancelId !== null}
          onClose={() => setCancelId(null)}
          title="Cancelar Follow-up"
        >
          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja cancelar este follow-up?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelId(null)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancelar Follow-up
            </Button>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
