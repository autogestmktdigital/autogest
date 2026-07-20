'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import apiClient from '@/lib/api';
import {
  formatCurrency,
  vehicleStatusLabels,
  vehicleStatusColors,
} from '@/lib/utils';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  version?: string;
  plate?: string;
  year: number;
  modelYear?: number;
  price: number;
  mileageKm: number;
  fuel: string;
  status: string;
  images: string[];
}

interface VehiclesResponse {
  data: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [plateFilter, setPlateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (plateFilter) params.set('plate', plateFilter);
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '50');

      const res = await apiClient.get<VehiclesResponse>(`/vehicles?${params.toString()}`);
      setVehicles(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, plateFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchVehicles();
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleSearch() {
    setPage(1);
    fetchVehicles();
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/vehicles/${deleteId}`);
      setDeleteId(null);
      fetchVehicles();
    } catch {
      // Error handled by api client
    }
  }

  return (
    <div>
      <Header title="Veículos" onMenuToggle={() => {}} />
      <div className="p-4 sm:p-6">
        {/* Actions bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Placa..."
              value={plateFilter}
              onChange={(e) => { setPlateFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-32"
            />
            <div className="relative w-full sm:w-[28rem]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Marca ou modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-36"
            >
              <option value="">Todos Status</option>
              <option value="available">Disponível</option>
              <option value="reserved">Reservado</option>
              <option value="sold">Vendido</option>
            </Select>
          </div>
          <Link href="/veiculos/novo">
            <Button>
              <Plus className="h-4 w-4" />
              Novo Veículo
            </Button>
          </Link>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Status</TableHead>
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
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhum veículo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="h-12 w-16 overflow-hidden rounded-lg bg-gray-100">
                        {vehicle.images?.[0] ? (
                          <img
                            src={vehicle.images[0].startsWith('http') ? vehicle.images[0] : `https://autogest-production-404d.up.railway.app/uploads/${vehicle.images[0]}`}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                            Sem foto
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {vehicle.brand} {vehicle.model} {vehicle.version && `(${vehicle.version})`}
                    </TableCell>
                    <TableCell>{vehicle.plate || '-'}</TableCell>
                    <TableCell>{vehicle.modelYear ? `${vehicle.year}/${vehicle.modelYear}` : vehicle.year}</TableCell>
                    <TableCell>{formatCurrency(vehicle.price)}</TableCell>
                    <TableCell>{vehicle.mileageKm?.toLocaleString('pt-BR')} km</TableCell>
                    <TableCell>
                      <Badge variant={vehicleStatusColors[vehicle.status] as 'success' | 'warning' | 'danger'}>
                        {vehicleStatusLabels[vehicle.status] || vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/veiculos/${vehicle.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          title="Confirmar exclusão"
        >
          <p className="text-sm text-gray-600 mb-4">
            Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
