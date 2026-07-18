'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import apiClient from '@/lib/api';
import {
  formatPhone,
  formatDate,
  leadStatusLabels,
  leadStatusColors,
  channelLabels,
  channelColors,
} from '@/lib/utils';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  channel: string;
  status: string;
  assignedTo?: { name: string };
  createdAt: string;
  updatedAt: string;
  lastInteractionAt?: string;
}

interface LeadsResponse {
  success: boolean;
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [sellers, setSellers] = useState<Array<{ id: number; name: string }>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchLeads() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter) params.set('channel', channelFilter);
      if (sellerFilter) params.set('assignedToId', sellerFilter);
      if (phoneFilter) params.set('phone', phoneFilter);
      params.set('page', String(page));
      params.set('limit', '10');

      const res = await apiClient.get<LeadsResponse>(`/leads?${params.toString()}`);
      setLeads(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchSellers() {
      try {
        const res = await apiClient.get<{ success: boolean; data: Array<{ id: number; name: string }> }>('/auth/users');
        setSellers(res.data || []);
      } catch {
        setSellers([]);
      }
    }
    fetchSellers();
  }, []);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, channelFilter, sellerFilter, phoneFilter]);

  function handleSearch() {
    setPage(1);
    fetchLeads();
  }

  return (
    <div>
      <Header title="Leads" onMenuToggle={() => {}} />
      <div className="p-4 sm:p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Input
            placeholder="Telefone..."
            value={phoneFilter}
            onChange={(e) => { setPhoneFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-40"
          />
          <Select
            value={sellerFilter}
            onChange={(e) => { setSellerFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-44"
          >
            <option value="">Todos Vendedores</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-44"
          >
            <option value="">Todos Status</option>
            <option value="bot">Bot</option>
            <option value="new">Novo</option>
            <option value="in_conversation">Em Conversa</option>
            <option value="negotiating">Negociando</option>
            <option value="converted">Convertido</option>
            <option value="gave_up">Desistiu</option>
            <option value="invalid">Indevido</option>
          </Select>
          <Select
            value={channelFilter}
            onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-40"
          >
            <option value="">Todos Canais</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="website">Website</option>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Última Interação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/leads/${lead.id}`} className="hover:text-blue-600">
                        {lead.name || 'Sem nome'}
                      </Link>
                    </TableCell>
                    <TableCell>{formatPhone(lead.phone)}</TableCell>
                    <TableCell>
                      <Badge variant={channelColors[lead.channel] as 'success' | 'danger' | 'info' | 'default'}>
                        {channelLabels[lead.channel] || lead.channel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={leadStatusColors[lead.status] as 'success' | 'warning' | 'danger' | 'info'}>
                        {leadStatusLabels[lead.status] || lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.assignedTo?.name || '—'}</TableCell>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    <TableCell>{lead.lastInteractionAt ? formatDate(lead.lastInteractionAt) : '—'}</TableCell>
                    <TableCell>
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
