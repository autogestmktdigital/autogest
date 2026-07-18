'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Phone, Mail, Calendar, User, MessageSquare } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import apiClient from '@/lib/api';
import {
  formatPhone,
  formatDate,
  formatDateTime,
  leadStatusLabels,
  leadStatusColors,
  channelLabels,
  channelColors,
  followUpTypeLabels,
  followUpStatusLabels,
  followUpStatusColors,
} from '@/lib/utils';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  interestNotes: string;
  assignedTo?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
  lastInteractionAt?: string;
  conversations?: Conversation[];
  followUps?: FollowUp[];
  financingSimulations?: FinancingSimulation[];
}

interface Conversation {
  id: number;
  channel: string;
  status: string;
  messages: Message[];
}

interface Message {
  id: number;
  role: string;
  content: string;
  sentAt: string;
}

interface FollowUp {
  id: number;
  type: string;
  status: string;
  scheduledFor: string;
  sentAt: string;
  messageContent: string;
}

interface FinancingSimulation {
  id: number;
  vehiclePrice: number;
  downPayment: number;
  installments: number;
  monthlyPayment: number;
  createdAt: string;
}

interface UserItem {
  id: number;
  name: string;
  role: string;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [sellers, setSellers] = useState<UserItem[]>([]);
  const [selectedSeller, setSelectedSeller] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadRes, convsRes] = await Promise.all([
          apiClient.get<{ success: boolean; data: Lead }>(`/leads/${id}`),
          apiClient.get<{ success: boolean; data: Conversation[] }>(`/conversations/lead/${id}`),
        ]);
        setLead(leadRes.data);
        setNewStatus(leadRes.data.status);
        setConversations(convsRes.data || []);
      } catch {
        router.push('/leads');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  async function handleStatusChange() {
    try {
      await apiClient.patch(`/leads/${id}/status`, { status: newStatus });
      setLead((prev) => prev ? { ...prev, status: newStatus } : prev);
      setShowStatusDialog(false);
    } catch {
      // Error handled by api client
    }
  }

  async function handleAssignSeller() {
    if (!selectedSeller) return;
    try {
      await apiClient.patch(`/leads/${id}/assign`, { sellerId: Number(selectedSeller) });
      const seller = sellers.find((s) => s.id === Number(selectedSeller));
      setLead((prev) => prev ? { ...prev, assignedTo: seller ? { id: seller.id, name: seller.name } : undefined } : prev);
      setShowAssignDialog(false);
    } catch {
      // Error handled by api client
    }
  }

  async function openAssignDialog() {
    try {
      const res = await apiClient.get<{ success: boolean; data: UserItem[] }>('/auth/users');
      setSellers(res.data || []);
    } catch {
      setSellers([]);
    }
    setShowAssignDialog(true);
  }

  if (loading) {
    return (
      <div>
        <Header title="Detalhes do Lead" breadcrumb="Leads" onMenuToggle={() => {}} />
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!lead) return null;

  // Get messages from the most recent conversation
  const latestConversation = conversations[0];

  return (
    <div>
      <Header title={lead.name || 'Lead'} breadcrumb="Leads" onMenuToggle={() => {}} />
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
              Alterar Status
            </Button>
            <Button variant="outline" onClick={openAssignDialog}>
              Atribuir Vendedor
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lead info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações do Lead</CardTitle>
                <Badge variant={leadStatusColors[lead.status] as 'success' | 'warning' | 'danger' | 'info'}>
                  {leadStatusLabels[lead.status] || lead.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Nome</p>
                  <p className="text-sm font-medium">{lead.name || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Telefone</p>
                  <p className="text-sm font-medium">{formatPhone(lead.phone)}</p>
                </div>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{lead.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Canal</p>
                  <Badge variant={channelColors[lead.channel] as 'success' | 'danger' | 'info' | 'default'}>
                    {channelLabels[lead.channel] || lead.channel}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Vendedor Atribuído</p>
                  <p className="text-sm font-medium">{lead.assignedTo?.name || 'Nenhum'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Data de Criação</p>
                  <p className="text-sm font-medium">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Última Interação</p>
                  <p className="text-sm font-medium">{lead.lastInteractionAt ? formatDate(lead.lastInteractionAt) : '—'}</p>
                </div>
              </div>
              {lead.interestNotes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notas de Interesse</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{lead.interestNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-6">
            {/* Financing simulations */}
            {lead.financingSimulations && lead.financingSimulations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Simulações de Financiamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lead.financingSimulations.map((sim) => (
                      <div key={sim.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Valor:</span>{' '}
                            <span className="font-medium">R$ {sim.vehiclePrice?.toLocaleString('pt-BR')}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Entrada:</span>{' '}
                            <span className="font-medium">R$ {sim.downPayment?.toLocaleString('pt-BR')}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Parcelas:</span>{' '}
                            <span className="font-medium">{sim.installments}x</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Mensal:</span>{' '}
                            <span className="font-medium">R$ {sim.monthlyPayment?.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Follow-ups */}
            {lead.followUps && lead.followUps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lead.followUps.map((fu) => (
                      <div key={fu.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="info">
                            {followUpTypeLabels[fu.type] || fu.type}
                          </Badge>
                          <Badge variant={followUpStatusColors[fu.status] as 'success' | 'warning' | 'danger' | 'default'}>
                            {followUpStatusLabels[fu.status] || fu.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Agendado: {formatDateTime(fu.scheduledFor)}
                          {fu.sentAt && ` | Enviado: ${formatDateTime(fu.sentAt)}`}
                        </p>
                        {fu.messageContent && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{fu.messageContent}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Conversation history */}
        {latestConversation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Histórico de Conversa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {latestConversation.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.role === 'customer'
                          ? 'bg-gray-100 text-gray-800'
                          : msg.role === 'assistant'
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`mt-1 text-xs ${msg.role === 'customer' ? 'text-gray-500' : 'text-white/70'}`}>
                        {formatDateTime(msg.sentAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status change dialog */}
        <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)} title="Alterar Status">
          <div className="space-y-4">
            <Select label="Novo Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="in_conversation">Em Conversa</option>
              <option value="negotiating">Negociando</option>
              <option value="converted">Convertido</option>
              <option value="gave_up">Desistiu</option>
              <option value="invalid">Indevido</option>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancelar</Button>
              <Button onClick={handleStatusChange}>Salvar</Button>
            </div>
          </div>
        </Dialog>

        {/* Assign seller dialog */}
        <Dialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)} title="Atribuir Vendedor">
          <div className="space-y-4">
            <Select label="Vendedor" value={selectedSeller} onChange={(e) => setSelectedSeller(e.target.value)}>
              <option value="">Selecione...</option>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.name} ({seller.role})
                </option>
              ))}
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancelar</Button>
              <Button onClick={handleAssignSeller}>Atribuir</Button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
