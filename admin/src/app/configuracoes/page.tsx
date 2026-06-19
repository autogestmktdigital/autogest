'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Shield, Users, Plug, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import apiClient from '@/lib/api';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ConfiguracoesPage() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string }>({ name: '', email: '', role: '' });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // New user dialog
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'seller' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserError, setNewUserError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await apiClient.get<{ success: boolean; data: UserItem[] }>('/auth/users');
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    setChangingPassword(true);

    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordMsg('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setNewUserError('');
    setCreatingUser(true);

    try {
      await apiClient.post('/auth/users', newUserForm);
      setShowNewUser(false);
      setNewUserForm({ name: '', email: '', password: '', role: 'seller' });
      fetchUsers();
    } catch (err) {
      setNewUserError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    } finally {
      setCreatingUser(false);
    }
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div>
      <Header title="Configurações" onMenuToggle={() => {}} />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Profile section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Suas informações pessoais e segurança</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="text-sm font-medium">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Função</p>
                <Badge variant={currentUser.role === 'admin' ? 'info' : 'default'}>
                  {currentUser.role === 'admin' ? 'Administrador' : 'Vendedor'}
                </Badge>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <h4 className="text-sm font-medium text-gray-900 mb-4">Alterar Senha</h4>
            <form onSubmit={handleChangePassword} className="max-w-sm space-y-3">
              {passwordMsg && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{passwordMsg}</div>
              )}
              {passwordError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{passwordError}</div>
              )}
              <Input
                label="Senha Atual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="Nova Senha"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
              />
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Team section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Equipe</CardTitle>
                  <CardDescription>Gerencie os membros da equipe</CardDescription>
                </div>
              </div>
              {isAdmin && (
                <Button size="sm" onClick={() => setShowNewUser(true)}>
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                      {user.role === 'admin' ? 'Admin' : 'Vendedor'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrations section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Plug className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>Status das conexões externas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Meta API (WhatsApp/Instagram)</p>
                  <p className="text-xs text-gray-500">Integração com WhatsApp Business e Instagram</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Configurado</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">OpenAI</p>
                  <p className="text-xs text-gray-500">GPT para geração de respostas e follow-ups</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Configurado</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Typebot</p>
                  <p className="text-xs text-gray-500">Fluxo de conversação automatizado</p>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Não configurado</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New user dialog */}
      <Dialog open={showNewUser} onClose={() => setShowNewUser(false)} title="Novo Usuário">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {newUserError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{newUserError}</div>
          )}
          <Input
            label="Nome"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            placeholder="Mínimo 6 caracteres"
          />
          <Select
            label="Função"
            value={newUserForm.role}
            onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="seller">Vendedor</option>
            <option value="admin">Administrador</option>
          </Select>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowNewUser(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creatingUser}>
              {creatingUser ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
