'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Fuel, Gauge, Search, SlidersHorizontal } from 'lucide-react';
import { formatVehicleYear, getVehicles } from '@/lib/api';
import type { Vehicle } from '@/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    yearMin: '',
    yearMax: '',
    priceMin: '',
    priceMax: '',
    fuel: '',
    search: '',
  });

  useEffect(() => {
    getVehicles({ status: 'available' })
      .then((res) => {
        setVehicles(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(() => Array.from(new Set(vehicles.map((v) => v.brand))).sort((a, b) => a.localeCompare(b)), [vehicles]);
  const models = useMemo(
    () => Array.from(new Set(vehicles.filter((v) => !filters.brand || v.brand === filters.brand).map((v) => v.model))).sort((a, b) => a.localeCompare(b)),
    [vehicles, filters.brand]
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.brand && v.brand !== filters.brand) return false;
      if (filters.model && v.model !== filters.model) return false;
      if (filters.fuel && v.fuel !== filters.fuel) return false;
      if (filters.yearMin && v.year < Number(filters.yearMin)) return false;
      if (filters.yearMax && v.year > Number(filters.yearMax)) return false;
      if (filters.priceMin && v.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && v.price > Number(filters.priceMax)) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const text = `${v.brand} ${v.model} ${v.version || ''} ${formatVehicleYear(v)} ${v.fuel} ${v.transmission}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      return true;
    });
  }, [vehicles, filters]);

  function handleFilterChange(name: string, value: string) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      brand: '',
      model: '',
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      fuel: '',
      search: '',
    });
  }

  return (
    <div className="min-h-screen bg-brothers-dark py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">Estoque de Veículos</h1>
          <p className="mt-2 text-white/70">Encontre o seminovo ideal para você.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="rounded-2xl border border-white/10 bg-brothers-gray p-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="mb-4 flex items-center gap-2 text-brothers-green">
              <SlidersHorizontal className="h-5 w-5" />
              <h2 className="font-semibold">Filtros</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Marca, modelo, ano..."
                    className="w-full rounded-lg border border-white/10 bg-brothers-dark py-2 pl-9 pr-3 text-sm text-white placeholder-white/40 focus:border-brothers-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">Marca</label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-brothers-dark px-3 py-2 text-sm text-white focus:border-brothers-green focus:outline-none"
                >
                  <option value="">Todas</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/70">Modelo</label>
                <select
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-brothers-dark px-3 py-2 text-sm text-white focus:border-brothers-green focus:outline-none"
                >
                  <option value="">Todos</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Ano mín."
                  value={filters.yearMin}
                  onChange={(e) => handleFilterChange('yearMin', e.target.value)}
                  className="rounded-lg border border-white/10 bg-brothers-dark px-3 py-2 text-sm text-white placeholder-white/40 focus:border-brothers-green focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Ano máx."
                  value={filters.yearMax}
                  onChange={(e) => handleFilterChange('yearMax', e.target.value)}
                  className="rounded-lg border border-white/10 bg-brothers-dark px-3 py-2 text-sm text-white placeholder-white/40 focus:border-brothers-green focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Preço mín."
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="rounded-lg border border-white/10 bg-brothers-dark px-3 py-2 text-sm text-white placeholder-white/40 focus:border-brothers-green focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Preço máx."
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="rounded-lg border border-white/10 bg-brothers-dark px-3 py-2 text-sm text-white placeholder-white/40 focus:border-brothers-green focus:outline-none"
                />
              </div>

              <button onClick={clearFilters} className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-brothers-green hover:text-brothers-green">
                Limpar filtros
              </button>
            </div>
          </aside>

          <section className="lg:col-span-3">
            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-brothers-green" />
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-white/70">{filteredVehicles.length} veículo(s) encontrado(s)</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredVehicles.map((vehicle) => (
                    <Link key={vehicle.id} href={`/veiculos/${vehicle.id}`} className="overflow-hidden rounded-2xl border border-white/10 bg-brothers-gray transition hover:-translate-y-1 hover:border-brothers-green/40">
                      <div className="aspect-[4/3] bg-black">
                        <img
                          src={vehicle.images?.split(',')[0] ? `https://autogest-production-404d.up.railway.app/uploads/${vehicle.images.split(',')[0]}` : '/placeholder-car.svg'}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-sm text-brothers-green">{formatVehicleYear(vehicle)}</p>
                        <h3 className="mt-1 text-xl font-semibold">{vehicle.brand} {vehicle.model}</h3>
                        <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                          <span className="flex items-center gap-1">
                            <Gauge className="h-4 w-4" />
                            {vehicle.mileageKm.toLocaleString('pt-BR')} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Fuel className="h-4 w-4" />
                            {vehicle.fuel}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {filteredVehicles.length === 0 ? <p className="mt-10 text-center text-white/60">Nenhum veículo encontrado com os filtros atuais.</p> : null}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}