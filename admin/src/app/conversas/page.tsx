'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, PhoneForwarded, XCircle, Lock } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api';
import { cn, formatDateTime, channelLabels, channelColors, leadStatusLabels, leadStatusColors } from '@/lib/utils';

interface Conversation {
  id: number;
  channel: string;
  status: string;
  humanHandoff: boolean;
  lastMessageAt: string;
  unreadCount: number;
  assignedToId?: number;
  assignedToName?: string;
  lead: {
    id: number;
    name: string;
    phone: string;
    status?: string;
    assignedTo?: { id: number; name: string };
  };
  messages?: Message[];
}

interface Message {
  id: number;
  role: string;
  content: string;
  sentAt: string;
  mediaUrl?: string;
}

interface MessagesResponse {
  success: boolean;
  data: Message[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ConversasPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [sellers, setSellers] = useState<Array<{ id: number; name: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const canRespond =
    selectedConversation?.lead?.status === 'in_conversation' &&
    (currentUser?.role === 'admin' ||
      selectedConversation?.lead?.assignedTo?.id === currentUser?.id ||
      !selectedConversation?.lead?.assignedTo);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({ id: user.userId || user.id, name: user.name, role: user.role });
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

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
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    // Aplicar filtros
    let filtered = conversations;
    if (phoneFilter) {
      filtered = filtered.filter((c) => c.lead?.phone?.includes(phoneFilter));
    }
    if (sellerFilter) {
      filtered = filtered.filter((c) => String(c.lead?.assignedTo?.id) === sellerFilter);
    }
    setFilteredConversations(filtered);
  }, [conversations, phoneFilter, sellerFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await apiClient.get<{ success: boolean; data: Conversation[] }>('/conversations/active');
      setConversations(res.data || []);
      // Não selecionar automaticamente para não zerar contador de não lidas
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(convId: number) {
    setLoadingMessages(true);
    try {
      const res = await apiClient.get<MessagesResponse>(`/conversations/${convId}/messages?limit=100`);
      setMessages(res.data || []);
      // Atualizar lista de conversas para remover badge de não lidas
      fetchConversations();
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedId) return;
    setSending(true);
    try {
      await apiClient.post(`/conversations/${selectedId}/messages`, {
        role: 'agent',
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedId);
    } catch {
      // Error handled by api client
    } finally {
      setSending(false);
    }
  }

  async function handleAssign() {
    if (!selectedId || !selectedConversation || !currentUser) return;
    console.log('Assigning conversation', selectedId, 'to user', currentUser.id, currentUser.name);
    try {
      const res = await apiClient.patch(`/conversations/${selectedId}/assign`, {
        userId: currentUser.id,
        userName: currentUser.name,
      });
      console.log('Assign response:', res);
      fetchConversations();
    } catch (err: any) {
      console.error('Assign error:', err);
      alert(err?.message || 'Erro ao assumir conversa');
    }
  }

  async function handleClose() {
    if (!selectedId) return;
    try {
      await apiClient.patch(`/conversations/${selectedId}/close`);
      setSelectedId(null);
      setMessages([]);
      fetchConversations();
    } catch {
      // Error handled by api client
    }
  }

  return (
    <div>
      <Header title="Conversas" onMenuToggle={() => {}} />
      <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
        {/* Conversation list */}
        <div className="w-full border-r border-gray-200 bg-white sm:w-80 lg:w-96 flex flex-col">
          <div className="p-3 border-b border-gray-200 space-y-2">
            <Input
              placeholder="Filtrar por telefone..."
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="text-sm"
            />
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos Vendedores</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Nenhuma conversa ativa
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    'w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 cursor-pointer',
                    selectedId === conv.id && 'bg-blue-50 border-l-2 border-l-blue-600'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conv.lead?.name || 'Sem nome'}
                    </span>
                    <div className="flex items-center gap-1">
                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                      <Badge
                        variant={channelColors[conv.channel] as 'success' | 'danger' | 'info' | 'default'}
                        className="text-[10px] ml-1"
                      >
                        {channelLabels[conv.channel] || conv.channel}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lead?.phone}
                  </p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {conv.lead?.status && (
                      <Badge
                        variant={leadStatusColors[conv.lead.status] as 'success' | 'warning' | 'danger' | 'info'}
                        className="text-[10px]"
                      >
                        {leadStatusLabels[conv.lead.status] || conv.lead.status}
                      </Badge>
                    )}
                    {conv.lead?.assignedTo ? (
                      <Badge variant="default" className="text-[10px]">
                        {conv.lead.assignedTo.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Sem vendedor
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDateTime(conv.lastMessageAt)}
                  </p>
                  {conv.humanHandoff && (
                    <Badge variant="warning" className="mt-1 text-[10px]">
                      Atendimento humano
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="hidden flex-1 flex-col sm:flex">
          {selectedId ? (
            <>
              {/* Conversation header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedConversation?.lead?.name || 'Conversa'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedConversation?.lead?.phone}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedConversation?.lead?.status && (
                      <Badge
                        variant={leadStatusColors[selectedConversation.lead.status] as 'success' | 'warning' | 'danger' | 'info'}
                        className="text-[10px]"
                      >
                        {leadStatusLabels[selectedConversation.lead.status] || selectedConversation.lead.status}
                      </Badge>
                    )}
                    {selectedConversation?.lead?.assignedTo ? (
                      <Badge variant="default" className="text-[10px]">
                        {selectedConversation.lead.assignedTo.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Sem vendedor
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedConversation?.lead?.status === 'new' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAssign}
                    >
                      <PhoneForwarded className="h-4 w-4" />
                      Assumir
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    <XCircle className="h-4 w-4" />
                    Encerrar
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    Nenhuma mensagem
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex',
                          msg.role === 'customer' ? 'justify-start' : 'justify-end'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
                            msg.role === 'customer'
                              ? 'bg-white text-gray-800 rounded-bl-md'
                              : msg.role === 'assistant'
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-green-600 text-white rounded-br-md'
                          )}
                        >
                          {msg.role !== 'customer' && (
                            <p className={cn(
                              'text-[10px] font-medium mb-0.5',
                              msg.role === 'assistant' ? 'text-blue-200' : 'text-green-200'
                            )}>
                              {msg.role === 'assistant' ? 'Bot' : 'Agente'}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={cn(
                            'mt-1 text-[10px]',
                            msg.role === 'customer' ? 'text-gray-400' : 'text-white/60'
                          )}>
                            {formatDateTime(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="border-t border-gray-200 bg-white p-4">
                {!canRespond ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
                    <Lock className="h-4 w-4" />
                    Esta conversa está atribuída a outro vendedor
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={sending}
                    />
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              <p className="text-sm">Selecione uma conversa para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
