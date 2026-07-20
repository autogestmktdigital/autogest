'use client';

import { useEffect, useState } from 'react';
import { XCircle, Calendar, Edit } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

type TabFilter = 'all' | 'scheduled' | 'pending' | 'completed' | 'cancelled';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    fetchFollowUps();
  }, []);

  async function fetchFollowUps() {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: FollowUp[] }>('/follow-ups');
      setFollowUps(res.data || []);
    } catch {
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancelId) return;
    try {
      await apiClient.patch(`/follow-ups/${cancelId}/cancel`);
      setCancelId(null);
      fetchFollowUps();
    } catch {
      setCancelId(null);
    }
  }

  async function handleEdit() {
    if (!editId || !editDate) return;
    try {
      await apiClient.patch(`/follow-ups/${editId}`, {
        scheduledFor: new Date(editDate).toISOString(),
      });
      setEditId(null);
      setEditDate('');
      fetchFollowUps();
    } catch {
      // Error handled by api client
    }
  }

  function openEdit(followUp: FollowUp) {
    setEditId(followUp.id);
    // Converter para formato datetime-local
    const date = new Date(followUp.scheduledFor);
    const formatted = date.toISOString().slice(0, 16);
    setEditDate(formatted);
  }

  const filteredFollowUps = followUps.filter((fu) => {
    if (activeTab === 'all') return true;
    return fu.status === activeTab;
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'completed', label: 'Concluídos' },
    { key: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <div>
      <Header title="Agendamento" onMenuToggle={() => {}} />
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
                <TableHead>Agendado para</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredFollowUps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhum agendamento encontrado
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
                    <TableCell>{formatDateTime(fu.scheduledFor)}</TableCell>
                    <TableCell>
                      <Badge variant={followUpStatusColors[fu.status] as 'success' | 'warning' | 'danger' | 'default'}>
                        {followUpStatusLabels[fu.status] || fu.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(fu.status === 'scheduled' || fu.status === 'pending') && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openEdit(fu)}
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setCancelId(fu.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar
                          </Button>
                        </div>
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
          title="Cancelar Agendamento"
        >
          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja cancelar este agendamento?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelId(null)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancelar Agendamento
            </Button>
          </div>
        </Dialog>

        {/* Edit dialog */}
        <Dialog
          open={editId !== null}
          onClose={() => { setEditId(null); setEditDate(''); }}
          title="Editar Agendamento"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova Data e Hora
              </label>
              <Input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setEditId(null); setEditDate(''); }}>
                Cancelar
              </Button>
              <Button onClick={handleEdit} disabled={!editDate}>
                <Calendar className="h-4 w-4 mr-2" />
                Salvar Alteração
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
