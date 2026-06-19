'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';

export default function NovoVeiculoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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
  });

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
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

      if (form.features.trim()) {
        const featuresArray = form.features.split(',').map((f) => f.trim()).filter(Boolean);
        formData.append('features', JSON.stringify(featuresArray));
      }

      images.forEach((file) => {
        formData.append('images', file);
      });

      await apiClient.post('/vehicles', formData);
      router.push('/veiculos');
    } catch {
      // Error handled by api client
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header title="Novo Veículo" breadcrumb="Veículos" onMenuToggle={() => {}} />
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
                  <Input
                    label="Marca"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    error={errors.brand}
                    placeholder="Ex: Toyota"
                  />
                  <Input
                    label="Modelo"
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    error={errors.model}
                    placeholder="Ex: Corolla"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Ano"
                    name="year"
                    type="number"
                    value={form.year}
                    onChange={handleChange}
                    error={errors.year}
                    placeholder="2024"
                  />
                  <Input
                    label="Preço (R$)"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    error={errors.price}
                    placeholder="85000"
                  />
                  <Input
                    label="KM"
                    name="mileageKm"
                    type="number"
                    value={form.mileageKm}
                    onChange={handleChange}
                    error={errors.mileageKm}
                    placeholder="30000"
                  />
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
                  <Input
                    label="Cor"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Prata"
                  />
                </div>
                <Textarea
                  label="Descrição"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descreva o veículo..."
                  rows={3}
                />
                <Input
                  label="Opcionais (separados por vírgula)"
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  placeholder="Ar condicionado, Direção elétrica, Airbag"
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">
                    Clique para adicionar imagens
                  </p>
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

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previews.map((preview, index) => (
                      <div key={index} className="group relative aspect-video overflow-hidden rounded-lg">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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
              {loading ? 'Salvando...' : 'Salvar Veículo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
