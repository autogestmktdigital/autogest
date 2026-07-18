'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import apiClient from '@/lib/api';
import { BRANDS, MODELS_BY_BRAND, VERSIONS_BY_MODEL } from '@/lib/vehicle-data';

const FEATURES_OPTIONS = [
  'Airbag lateral', 'Airbag motorista', 'Airbag passageiro', 'Ajuste elétrico de bancos',
  'Alarme', 'Ar-condicionado', 'Ar-quente', 'Bancos de couro', 'Blindado', 'Calotas',
  'Capota marítima', 'Cd player', 'Cd player com MP3', 'Computador de bordo',
  'Controle de tração', 'Desemb. traseiro', 'Direção elétrica', 'Direção hidráulica',
  'Distribuição eletrônica de frenagem', 'Entrada USB', 'Farol de neblina', 'Freios ABS',
  'Kit gás', 'Kit Multimídia', 'Limp. traseiro', 'Piloto automático',
  'Protetor de caçamba', 'Rádio FM/AM', 'Retrovisores elétricos', 'Rodas de liga leve',
  'Sensor de chuva', 'Sensor de estacionamento', 'Sensor de farol', 'Teto solar',
  'Tração 4x4', 'Travas elétricas', 'Trio eletrico', 'Vidros elétricos dianteiros',
  'Vidros elétricos traseiros', 'Volante com regulagem de altura'
];

export default function NovoVeiculoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    brand: '',
    model: '',
    version: '',
    plate: '',
    chassis: '',
    renavam: '',
    year: '',
    modelYear: '',
    price: '',
    mileageKm: '',
    fuel: 'flex',
    transmission: 'manual',
    color: '',
    description: '',
    features: [] as string[],
    registrationDate: new Date().toISOString().split('T')[0],
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState(0);
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);

  const availableModels = form.brand ? (MODELS_BY_BRAND[form.brand] || ['Outro modelo']) : [];
  const availableVersions = form.model ? (VERSIONS_BY_MODEL[form.model] || ['Outra versão']) : [];

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const finalValue = name === 'plate' ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleBrandChange(e: ChangeEvent<HTMLSelectElement>) {
    const brand = e.target.value;
    setForm((prev) => ({ ...prev, brand, model: '', version: '' }));
    if (errors.brand) {
      setErrors((prev) => ({ ...prev, brand: '' }));
    }
  }

  function handlePriceChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    const numeric = raw ? Number(raw) / 100 : '';
    setForm((prev) => ({ ...prev, price: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '' }));
    if (errors.price) {
      setErrors((prev) => ({ ...prev, price: '' }));
    }
  }

  function formatCurrencyDisplay(value: string) {
    if (!value) return '';
    const numeric = Number(value.replace(',', '.'));
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function handleModelChange(e: ChangeEvent<HTMLSelectElement>) {
    const model = e.target.value;
    setForm((prev) => ({ ...prev, model, version: '' }));
    if (errors.model) {
      setErrors((prev) => ({ ...prev, model: '' }));
    }
  }

  function toggleFeature(feature: string) {
    setForm((prev) => {
      const features = prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features };
    });
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 12) {
      alert('Limite máximo de 12 imagens atingido');
      return;
    }
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
    if (!form.price || isNaN(Number(form.price.replace(',', '.')))) newErrors.price = 'Preço inválido';
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
      if (form.version.trim()) formData.append('version', form.version);
      if (form.plate.trim()) formData.append('plate', form.plate);
      if (form.chassis.trim()) formData.append('chassis', form.chassis);
      if (form.renavam.trim()) formData.append('renavam', form.renavam);
      formData.append('year', form.year);
      if (form.modelYear) formData.append('modelYear', form.modelYear);
      if (form.price) {
        const numericPrice = Number(form.price.replace(',', '.'));
        formData.append('price', String(numericPrice));
      }
      formData.append('mileageKm', form.mileageKm);
      formData.append('fuel', form.fuel);
      formData.append('transmission', form.transmission);
      formData.append('color', form.color);
      formData.append('description', form.description);
      if (form.registrationDate) formData.append('registrationDate', form.registrationDate);

      if (form.features.length > 0) {
        formData.append('features', JSON.stringify(form.features));
      }

      if (reportFile) formData.append('reportFile', reportFile);
      if (documentFile) formData.append('documentFile', documentFile);

      // Reorganizar imagens para que a capa seja a primeira
      const orderedImages = [...images];
      if (coverImage > 0 && coverImage < orderedImages.length) {
        const [cover] = orderedImages.splice(coverImage, 1);
        orderedImages.unshift(cover);
      }

      orderedImages.forEach((file) => {
        formData.append('images', file);
      });

      await apiClient.post('/vehicles', formData);
      router.push('/veiculos');
    } catch (err: any) {
      console.error('Erro ao cadastrar veículo:', err);
      alert(err?.response?.data?.message || err?.message || 'Erro ao cadastrar veículo');
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
                  <Select label="Marca *" name="brand" value={form.brand} onChange={handleBrandChange} error={errors.brand}>
                    <option value="">Selecione...</option>
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>
                  <Select label="Modelo *" name="model" value={form.model} onChange={handleModelChange} error={errors.model} disabled={!form.brand}>
                    <option value="">Selecione...</option>
                    {availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Versão" name="version" value={form.version} onChange={handleChange} disabled={!form.model}>
                    <option value="">Selecione...</option>
                    {availableVersions.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                  <Input
                    label="Placa"
                    name="plate"
                    value={form.plate}
                    onChange={handleChange}
                    placeholder="Ex: ABC1D23"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Chassi"
                    name="chassis"
                    value={form.chassis}
                    onChange={handleChange}
                    placeholder="9BWZZZ377VT004251"
                  />
                  <Input
                    label="Renavam"
                    name="renavam"
                    value={form.renavam}
                    onChange={handleChange}
                    placeholder="12345678901"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Ano Fabricação *"
                    name="year"
                    type="number"
                    value={form.year}
                    onChange={handleChange}
                    error={errors.year}
                    placeholder="2024"
                  />
                  <Input
                    label="Ano Modelo"
                    name="modelYear"
                    type="number"
                    value={form.modelYear}
                    onChange={handleChange}
                    placeholder="2024"
                  />
                  <Input
                    label="Data do Cadastro"
                    name="registrationDate"
                    type="date"
                    value={form.registrationDate}
                    onChange={handleChange}
                    readOnly
                  />
                  <Input
                    label="Preço (R$) *"
                    name="price"
                    value={formatCurrencyDisplay(form.price)}
                    onChange={handlePriceChange}
                    error={errors.price}
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="KM *"
                    name="mileageKm"
                    type="number"
                    value={form.mileageKm}
                    onChange={handleChange}
                    error={errors.mileageKm}
                    placeholder="30000"
                  />
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
                </div>
                <Input
                  label="Cor"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="Prata"
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Opcionais</label>
                  <button
                    type="button"
                    onClick={() => setShowFeaturesDialog(true)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span>
                      {form.features.length > 0
                        ? `${form.features.length} opcional(is) selecionado(s)`
                        : 'Clique para selecionar opcionais...'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {form.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {form.features.slice(0, 5).map((f) => (
                        <span key={f} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{f}</span>
                      ))}
                      {form.features.length > 5 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">+{form.features.length - 5} mais</span>
                      )}
                    </div>
                  )}
                </div>
                <Textarea
                  label="Descrição"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descreva o veículo..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Imagens e Documentos */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Laudo do Veículo</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
                    />
                    {reportFile && (
                      <p className="mt-1 text-xs text-gray-500">{reportFile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Documento do Veículo</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
                    />
                    {documentFile && (
                      <p className="mt-1 text-xs text-gray-500">{documentFile.name}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                        <div key={index} className={`group relative aspect-video overflow-hidden rounded-lg ${coverImage === index ? 'ring-2 ring-blue-500' : ''}`}>
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {coverImage === index && (
                            <div className="absolute top-1 left-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white font-medium">
                              Capa
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCoverImage(index)}
                            className="absolute bottom-1 left-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                          >
                            Definir capa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dialog de Opcionais */}
          <Dialog open={showFeaturesDialog} onClose={() => setShowFeaturesDialog(false)} title="Selecionar Opcionais">
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {FEATURES_OPTIONS.map((feature) => (
                <label key={feature} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.features.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowFeaturesDialog(false)}>Fechar</Button>
            </div>
          </Dialog>

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
