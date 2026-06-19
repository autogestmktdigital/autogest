'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileageKm: number;
  fuel: string;
  transmission: string;
  color: string;
  description: string;
  features: string[];
  images: string[];
  status: string;
}

export default function EditVeiculoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileageKm: '',
    fuel: 'flex',
    transmission: 'manual',
    color: '',
    description: '',
    features: '',
    status: 'available',
  });

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await apiClient.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`);
        const v = res.data;
        setForm({
          brand: v.brand,
          model: v.model,
          year: String(v.year),
          price: String(v.price),
          mileageKm: String(v.mileageKm),
          fuel: v.fuel,
          transmission: v.transmission,
          color: v.color || '',
          description: v.description || '',
          features: v.features?.join(', ') || '',
          status: v.status,
        });
        setExistingImages(v.images || []);
      } catch {
        router.push('/veiculos');
      } finally {
        setFetching(false);
      }
    }
    fetchVehicle();
  }, [id, router]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setNewPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeNewImage(index: number) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.brand.trim()) newErrors.brand = 'Marca é obrigatória';
    if (!form.model.trim()) newErrors.model = 'Modelo é obrigatório';
    if (!form.year || isNaN(Number(form.year))) newErrors.year = 'Ano inválido';
    if (!form.price || isNaN(Number(form.price))) newErrors.price = 'Preço inválido';
    if (!form.mileageKm || isNaN(Number(form.mileageKm))) newErrors.mileageKm = 'Quilometragem inválida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('brand', form.brand);
      formData.append('model', form.model);
      formData.append('year', form.year);
      formData.append('price', form.price);
      formData.append('mileageKm', form.mileageKm);
      formData.append('fuel', form.fuel);
      formData.append('transmission', form.transmission);
      formData.append('color', form.color);
      formData.append('description', form.description);
      formData.append('status', form.status);

      if (form.features.trim()) {
        const featuresArray = form.features.split(',').map((f) => f.trim()).filter(Boolean);
        formData.append('features', JSON.stringify(featuresArray));
      }

      newImages.forEach((file) => {
        formData.append('images', file);
      });

      await apiClient.put(`/vehicles/${id}`, formData);
      router.push('/veiculos');
    } catch {
      // Error handled by api client
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div>
        <Header title="Editar Veículo" breadcrumb="Veículos" onMenuToggle={() => {}} />
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Editar Veículo" breadcrumb="Veículos" onMenuToggle={() => {}} />
      <div className="p-4 sm:p-6">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Marca" name="brand" value={form.brand} onChange={handleChange} error={errors.brand} />
                  <Input label="Modelo" name="model" value={form.model} onChange={handleChange} error={errors.model} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Ano" name="year" type="number" value={form.year} onChange={handleChange} error={errors.year} />
                  <Input label="Preço (R$)" name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} />
                  <Input label="KM" name="mileageKm" type="number" value={form.mileageKm} onChange={handleChange} error={errors.mileageKm} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Select label="Combustível" name="fuel" value={form.fuel} onChange={handleChange}>
                    <option value="flex">Flex</option>
                    <option value="gasoline">Gasolina</option>
                    <option value="ethanol">Etanol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Elétrico</option>
                    <option value="hybrid">Híbrido</option>
                  </Select>
                  <Select label="Câmbio" name="transmission" value={form.transmission} onChange={handleChange}>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automático</option>
                    <option value="cvt">CVT</option>
                    <option value="automated">Automatizado</option>
                  </Select>
                  <Input label="Cor" name="color" value={form.color} onChange={handleChange} />
                </div>
                <Select label="Status" name="status" value={form.status} onChange={handleChange}>
                  <option value="available">Disponível</option>
                  <option value="reserved">Reservado</option>
                  <option value="sold">Vendido</option>
                </Select>
                <Textarea label="Descrição" name="description" value={form.description} onChange={handleChange} rows={3} />
                <Input label="Opcionais (separados por vírgula)" name="features" value={form.features} onChange={handleChange} />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Imagens atuais</p>
                    <div className="grid grid-cols-3 gap-3">
                      {existingImages.map((img, index) => (
                        <div key={index} className="group relative aspect-video overflow-hidden rounded-lg">
                          <img
                            src={`http://localhost:3001/uploads/${img}`}
                            alt={`Imagem ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload area */}
                <div
                  className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">Adicionar novas imagens</p>
                  <p className="text-xs text-gray-400">PNG, JPG até 5MB</p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {newPreviews.map((preview, index) => (
                      <div key={index} className="group relative aspect-video overflow-hidden rounded-lg">
                        <img src={preview} alt={`Nova ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
