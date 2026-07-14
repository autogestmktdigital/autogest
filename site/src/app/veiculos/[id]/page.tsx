'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, CheckCircle, ChevronLeft, ChevronRight, Fuel, Gauge, Palette, Phone, Settings } from 'lucide-react';
import { formatVehicleYear, getImageUrl, getVehicle } from '@/lib/api';
import type { Vehicle } from '@/types';

export default function VehicleDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getVehicle(id)
      .then((res) => setVehicle(res.data))
      .catch((err) => {
        console.error(err);
        setError('Veículo não encontrado ou indisponível.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brothers-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-brothers-green" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-brothers-dark px-4 text-center">
        <p className="text-lg text-white/70">{error || 'Veículo não encontrado.'}</p>
        <Link href="/veiculos" className="mt-4 inline-flex items-center gap-2 rounded-full bg-brothers-green px-6 py-2 font-semibold text-brothers-dark transition hover:brightness-110">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o estoque
        </Link>
      </div>
    );
  }

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images.split(',').map((img) => getImageUrl(img)) : ['/logo.png'];
  const fuelLabel: Record<string, string> = {
    flex: 'Flex',
    gasoline: 'Gasolina',
    diesel: 'Diesel',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
  };
  const transmissionLabel: Record<string, string> = {
    manual: 'Manual',
    automatic: 'Automático',
  };
  const features = typeof vehicle.features === 'string' ? vehicle.features.split(',').map((feature) => feature.trim()).filter(Boolean) : [];
  const whatsappMessage = encodeURIComponent(`Olá! Vi no site o ${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ''} ${formatVehicleYear(vehicle)} e gostaria de mais informações.`);

  return (
    <div className="min-h-screen bg-brothers-dark py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <Link href="/veiculos" className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-brothers-green">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o estoque
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-brothers-gray">
              <img src={images[currentImage]} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-contain" />
              {images.length > 1 ? (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-brothers-green hover:text-brothers-dark"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-brothers-green hover:text-brothers-dark"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-brothers-green">{formatVehicleYear(vehicle)}</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="mt-2 text-white/70">{vehicle.description || 'Veículo disponível para você.'}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Calendar, label: 'Ano Fabricação', value: vehicle.year },
                { icon: Calendar, label: 'Ano Modelo', value: vehicle.modelYear || 'Não informado' },
                { icon: Gauge, label: 'Quilometragem', value: `${vehicle.mileageKm.toLocaleString('pt-BR')} km` },
                { icon: Fuel, label: 'Combustível', value: fuelLabel[vehicle.fuel] || vehicle.fuel },
                { icon: Settings, label: 'Câmbio', value: transmissionLabel[vehicle.transmission] || vehicle.transmission },
                { icon: Palette, label: 'Cor', value: vehicle.color },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-brothers-gray p-4">
                  <item.icon className="h-5 w-5 text-brothers-green" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-white/50">{item.label}</p>
                  <p className="mt-1 font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            {features.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-brothers-gray p-5">
                <h2 className="mb-4 text-lg font-semibold text-brothers-green">Opcionais</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature: string) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle className="h-4 w-4 text-brothers-green" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <a
              href={`https://wa.me/5511985614257?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brothers-green px-6 py-3 font-semibold text-brothers-dark transition hover:brightness-110"
            >
              <Phone className="h-4 w-4" />
              Quero falar sobre este veículo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}