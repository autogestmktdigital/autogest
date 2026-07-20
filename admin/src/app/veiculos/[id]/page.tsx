'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, ChevronDown, FileText, Eye, Trash2, Download } from 'lucide-react';
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

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  version?: string;
  plate?: string;
  chassis?: string;
  renavam?: string;
  year: number;
  modelYear?: number;
  price: number;
  mileageKm: number;
  fuel: string;
  transmission: string;
  color: string;
  description: string;
  features: string[];
  images: string[];
  reportFile?: string;
  documentFile?: string;
  status: string;
  createdAt: string;
  expenses?: Array<{
    id: number;
    type: string;
    description: string;
    amount: number;
    date: string;
  }>;
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
  const [coverImage, setCoverImage] = useState(0);
  const [activeTab, setActiveTab] = useState('info');
  const [expenses, setExpenses] = useState<Array<{ id: number; type: string; description: string; amount: number; date: string }>>([]);
  const [newExpense, setNewExpense] = useState({ type: 'mecanica', description: '', amount: '', date: '' });
  const [saleData, setSaleData] = useState({
    // Seção 1 - Venda
    salePrice: '',
    saleDate: '',
    // Seção 2 - Dados do Cliente
    clientName: '',
    clientRg: '',
    clientCpfCnpj: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    clientDocuments: [] as string[],
    // Seção 3 - Condições da Compra
    paymentMethod: 'cash',
    downPayment: '',
    financeCompany: '',
    financeDate: '',
    financedAmount: '',
    installments: '',
    installmentValue: '',
    hasTradeIn: false,
    tradeInBrand: '',
    tradeInModel: '',
    tradeInVersion: '',
    tradeInPlate: '',
    tradeInYear: '',
    tradeInModelYear: '',
    tradeInFuel: 'flex',
    tradeInChassis: '',
    tradeInRenavam: '',
    tradeInPurchasePrice: '',
    tradeInDebts: '',
    tradeInDebtsNotes: '',
    tradeInNetValue: '',
    // Seção 4 - Documentação
    documentationNotes: '',
    // Seção 5 - Vendedor
    sellerId: '',
    sellerName: '',
  });
  const [sellers, setSellers] = useState<Array<{ id: number; name: string }>>([]);
  const [clientDocumentsFiles, setClientDocumentsFiles] = useState<File[]>([]);
  const [clientDocumentsPreviews, setClientDocumentsPreviews] = useState<string[]>([]);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [existingReportFile, setExistingReportFile] = useState<string | null>(null);
  const [existingDocumentFile, setExistingDocumentFile] = useState<string | null>(null);
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);

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
    status: 'available',
    createdAt: '',
  });

  const availableModels = form.brand ? (MODELS_BY_BRAND[form.brand] || ['Outro modelo']) : [];
  const availableVersions = form.model ? (VERSIONS_BY_MODEL[form.model] || ['Outra versão']) : [];

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await apiClient.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`);
        const v = res.data;
        setForm({
          brand: v.brand,
          model: v.model,
          version: v.version || '',
          plate: v.plate || '',
          chassis: v.chassis || '',
          renavam: v.renavam || '',
          year: String(v.year),
          modelYear: v.modelYear ? String(v.modelYear) : '',
          price: String(v.price),
          mileageKm: String(v.mileageKm),
          fuel: v.fuel,
          transmission: v.transmission,
          color: v.color || '',
          description: v.description || '',
          features: Array.isArray(v.features) ? v.features : [],
          status: v.status,
          createdAt: v.createdAt ? new Date(v.createdAt).toISOString().split('T')[0] : '',
        });
        setExistingImages(v.images || []);
        setExistingReportFile(v.reportFile || null);
        setExistingDocumentFile(v.documentFile || null);
        setExpenses(v.expenses || []);
      } catch {
        router.push('/veiculos');
      } finally {
        setFetching(false);
      }
    }
    fetchVehicle();
  }, [id, router]);

  useEffect(() => {
    async function fetchSellers() {
      try {
        const res = await apiClient.get<{ data: Array<{ id: number; name: string }> }>('/users');
        setSellers(res.data || []);
      } catch {
        // ignore
      }
    }
    fetchSellers();
  }, []);

  useEffect(() => {
    async function fetchSale() {
      if (activeTab !== 'sale') return;
      try {
        const res = await apiClient.get<{ data: any }>(`/vehicles/${id}/sale`);
        if (res.data) {
          const s = res.data;
          setSaleData({
            salePrice: s.salePrice ? String(s.salePrice) : '',
            saleDate: s.saleDate || '',
            clientName: s.clientName || '',
            clientRg: s.clientRg || '',
            clientCpfCnpj: s.clientCpfCnpj || '',
            clientPhone: s.clientPhone || '',
            clientEmail: s.clientEmail || '',
            clientAddress: s.clientAddress || '',
            clientDocuments: s.clientDocuments ? JSON.parse(s.clientDocuments) : [],
            paymentMethod: s.paymentMethod || 'cash',
            downPayment: s.downPayment ? String(s.downPayment) : '',
            financeCompany: s.financeCompany || '',
            financeDate: s.financeDate || '',
            financedAmount: s.financedAmount ? String(s.financedAmount) : '',
            installments: s.installments ? String(s.installments) : '',
            installmentValue: s.installmentValue ? String(s.installmentValue) : '',
            hasTradeIn: s.hasTradeIn || false,
            tradeInBrand: s.tradeInBrand || '',
            tradeInModel: s.tradeInModel || '',
            tradeInVersion: s.tradeInVersion || '',
            tradeInPlate: s.tradeInPlate || '',
            tradeInYear: s.tradeInYear ? String(s.tradeInYear) : '',
            tradeInModelYear: s.tradeInModelYear ? String(s.tradeInModelYear) : '',
            tradeInFuel: s.tradeInFuel || 'flex',
            tradeInChassis: s.tradeInChassis || '',
            tradeInRenavam: s.tradeInRenavam || '',
            tradeInPurchasePrice: s.tradeInPurchasePrice ? String(s.tradeInPurchasePrice) : '',
            tradeInDebts: s.tradeInDebts ? String(s.tradeInDebts) : '',
            tradeInDebtsNotes: s.tradeInDebtsNotes || '',
            tradeInNetValue: s.tradeInNetValue ? String(s.tradeInNetValue) : '',
            documentationNotes: s.documentationNotes || '',
            sellerId: s.sellerId ? String(s.sellerId) : '',
            sellerName: s.sellerName || '',
          });
        }
      } catch {
        // ignore
      }
    }
    fetchSale();
  }, [activeTab, id]);

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

  function handleModelChange(e: ChangeEvent<HTMLSelectElement>) {
    const model = e.target.value;
    setForm((prev) => ({ ...prev, model, version: '' }));
    if (errors.model) {
      setErrors((prev) => ({ ...prev, model: '' }));
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

  function formatCurrencyDisplay(value: string | number) {
    if (!value && value !== 0) return '';
    const numeric = typeof value === 'number' ? value : Number(value.replace(',', '.'));
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function addExpense() {
    if (!newExpense.description || !newExpense.amount || !newExpense.date) return;
    try {
      const res = await apiClient.post<{ success: boolean; data: any }>(`/vehicles/${id}/expenses`, {
        type: newExpense.type,
        description: newExpense.description,
        amount: Number(newExpense.amount.replace(',', '.')),
        date: newExpense.date,
      });
      setExpenses((prev) => [...prev, res.data]);
      setNewExpense({ type: 'mecanica', description: '', amount: '', date: '' });
    } catch {
      // Error handled by api client
    }
  }

  async function removeExpense(expenseId: number) {
    try {
      await apiClient.delete(`/vehicles/${id}/expenses/${expenseId}`);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch {
      // Error handled by api client
    }
  }

  function handleClientDocumentChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (clientDocumentsFiles.length + files.length > 6) {
      alert('Limite máximo de 6 documentos atingido');
      return;
    }
    setClientDocumentsFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setClientDocumentsPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeClientDocument(index: number) {
    setClientDocumentsFiles((prev) => prev.filter((_, i) => i !== index));
    setClientDocumentsPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function openClientDocument(index: number) {
    const file = clientDocumentsFiles[index];
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
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
    if (existingImages.length + newImages.length + files.length > 12) {
      alert('Limite máximo de 12 imagens atingido');
      return;
    }
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
    const priceRaw = String(form.price).replace(',', '.');
    if (!form.price || isNaN(Number(priceRaw))) newErrors.price = 'Preço inválido';
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
      formData.append('status', form.status);

      if (form.features.length > 0) {
        formData.append('features', JSON.stringify(form.features));
      }

      // Reorganizar imagens para que a capa seja a primeira
      const allImages = [...existingImages];
      const reorderedNewImages = [...newImages];
      
      if (coverImage >= 0 && coverImage < allImages.length) {
        // Capa é uma imagem existente
        const [cover] = allImages.splice(coverImage, 1);
        allImages.unshift(cover);
      } else if (coverImage >= allImages.length && coverImage < allImages.length + newImages.length) {
        // Capa é uma nova imagem
        const newIndex = coverImage - allImages.length;
        const [cover] = reorderedNewImages.splice(newIndex, 1);
        reorderedNewImages.unshift(cover);
      }

      if (allImages.length > 0) {
        formData.append('existingImages', JSON.stringify(allImages));
      }

      reorderedNewImages.forEach((file) => {
        formData.append('images', file);
      });

      await apiClient.put(`/vehicles/${id}`, formData);
      router.push('/veiculos');
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err);
      alert(err?.response?.data?.message || err?.message || 'Erro ao salvar veículo');
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
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Informações do Veículo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Gastos com Veículo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sale')}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'sale'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Venda Veículo
              </button>
            </nav>
          </div>

          {activeTab === 'info' && (
            <>
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
                    name="createdAt"
                    type="date"
                    value={form.createdAt || ''}
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
                <Select label="Status" name="status" value={form.status} onChange={handleChange}>
                  <option value="available">Disponível</option>
                  <option value="reserved">Reservado</option>
                  <option value="sold">Vendido</option>
                </Select>
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
                      {form.features.map((f) => (
                        <span key={f} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{f}</span>
                      ))}
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

            {/* Documentos e Imagens */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Laudo do Veículo</label>
                    {existingReportFile && (
                      <div className="mb-2 flex items-center gap-2">
                        <a
                          href={existingReportFile.startsWith('http') ? existingReportFile : `https://autogest-production-404d.up.railway.app/uploads/${existingReportFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Ver arquivo atual
                        </a>
                        <button
                          type="button"
                          onClick={() => setExistingReportFile(null)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remover
                        </button>
                      </div>
                    )}
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
                    {existingDocumentFile && (
                      <div className="mb-2 flex items-center gap-2">
                        <a
                          href={existingDocumentFile.startsWith('http') ? existingDocumentFile : `https://autogest-production-404d.up.railway.app/uploads/${existingDocumentFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Ver arquivo atual
                        </a>
                        <button
                          type="button"
                          onClick={() => setExistingDocumentFile(null)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remover
                        </button>
                      </div>
                    )}
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
                  {/* Existing images */}
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-gray-700">Imagens atuais</p>
                      <div className="grid grid-cols-3 gap-3">
                        {existingImages.map((img, index) => (
                          <div key={index} className={`group relative aspect-video overflow-hidden rounded-lg ${coverImage === index ? 'ring-2 ring-blue-500' : ''}`}>
                            <img
                              src={img.startsWith('http') ? img : `https://autogest-production-404d.up.railway.app/uploads/${img}`}
                              alt={`Imagem ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            {coverImage === index && (
                              <div className="absolute top-1 left-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white font-medium">
                                Capa
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
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
                        <div key={index} className={`group relative aspect-video overflow-hidden rounded-lg ${coverImage === existingImages.length + index ? 'ring-2 ring-blue-500' : ''}`}>
                          <img src={preview} alt={`Nova ${index + 1}`} className="h-full w-full object-cover" />
                          {coverImage === existingImages.length + index && (
                            <div className="absolute top-1 left-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white font-medium">
                              Capa
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCoverImage(existingImages.length + index)}
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

        </>
      )}

      {activeTab === 'expenses' && (
            <Card>
              <CardHeader>
                <CardTitle>Gastos com Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <Select
                    label="Tipo de Gasto"
                    value={newExpense.type}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="mecanica">Mecânica</option>
                    <option value="funilaria">Funilaria</option>
                    <option value="eletrica">Parte Elétrica</option>
                    <option value="documento">Documento</option>
                    <option value="outro">Outro</option>
                  </Select>
                  <Input
                    label="Valor (R$)"
                    placeholder="R$ 0,00"
                    value={newExpense.amount ? formatCurrencyDisplay(newExpense.amount) : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      const numeric = raw ? Number(raw) / 100 : '';
                      setNewExpense((prev) => ({ ...prev, amount: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '' }));
                    }}
                  />
                  <Input
                    label="Data"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, date: e.target.value }))}
                  />
                  <Input
                    label="Descrição"
                    placeholder="Ex: Troca de óleo"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button type="button" onClick={addExpense}>Adicionar Gasto</Button>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Histórico de Gastos</h3>
                  {expenses.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum gasto registrado</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {expenses.map((expense, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  {expense.type === 'mecanica' && 'Mecânica'}
                                  {expense.type === 'funilaria' && 'Funilaria'}
                                  {expense.type === 'eletrica' && 'Elétrica'}
                                  {expense.type === 'documento' && 'Documento'}
                                  {expense.type === 'outro' && 'Outro'}
                                </span>
                                <p className="font-medium">{expense.description}</p>
                              </div>
                              <p className="text-sm text-gray-500">{expense.date}</p>
                            </div>
                            <p className="font-medium text-red-600 mr-4">{formatCurrencyDisplay(expense.amount)}</p>
                            <button
                              type="button"
                              onClick={() => removeExpense(expense.id)}
                              className="rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">Total de Gastos:</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrencyDisplay(
                              String(
                                expenses.reduce((total, expense) => {
                                  const amount = typeof expense.amount === 'number' ? expense.amount : Number(expense.amount);
                                  return total + (isNaN(amount) ? 0 : amount);
                                }, 0)
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

      {activeTab === 'sale' && (
        <div className="space-y-6">
          {/* Seção 1 - Venda */}
          <Card>
            <CardHeader>
              <CardTitle>1. Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Valor da Venda (R$) *"
                  value={formatCurrencyDisplay(saleData.salePrice)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    const numeric = raw ? Number(raw) / 100 : '';
                    setSaleData((prev) => ({ ...prev, salePrice: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '' }));
                  }}
                  placeholder="R$ 0,00"
                />
                <Input
                  label="Data da Venda *"
                  type="date"
                  value={saleData.saleDate}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, saleDate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção 2 - Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>2. Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome do Cliente *"
                  value={saleData.clientName}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nome completo"
                />
                <Input
                  label="RG *"
                  value={saleData.clientRg}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, clientRg: e.target.value }))}
                  placeholder="00.000.000-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CPF/CNPJ *"
                  value={saleData.clientCpfCnpj}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, clientCpfCnpj: e.target.value }))}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
                <Input
                  label="Celular *"
                  value={saleData.clientPhone}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  value={saleData.clientEmail}
                  onChange={(e) => setSaleData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <Textarea
                label="Endereço Completo"
                value={saleData.clientAddress}
                onChange={(e) => setSaleData((prev) => ({ ...prev, clientAddress: e.target.value }))}
                placeholder="Rua/Av, Número, Bairro, Cidade, Estado, CEP"
                rows={2}
              />

              {/* Anexar Documentos */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Anexar Documentos (máx. 6)</p>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="client-documents"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleClientDocumentChange}
                    className="hidden"
                    disabled={clientDocumentsFiles.length >= 6}
                  />
                  <label
                    htmlFor="client-documents"
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${clientDocumentsFiles.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="h-4 w-4" />
                    Anexar Documento
                  </label>
                  <span className="text-xs text-gray-500">
                    {clientDocumentsFiles.length}/6 documentos
                  </span>
                </div>

                {clientDocumentsFiles.length > 0 && (
                  <div className="space-y-2">
                    {clientDocumentsFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openClientDocument(index)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Abrir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeClientDocument(index)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção 3 - Condições da Compra */}
          <Card>
            <CardHeader>
              <CardTitle>3. Condições da Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Forma de Pagamento"
                value={saleData.paymentMethod}
                onChange={(e) => setSaleData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="cash">À Vista</option>
                <option value="financed">Financiado</option>
              </Select>

              {saleData.paymentMethod === 'financed' && (
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Valor da Entrada (R$)"
                    value={formatCurrencyDisplay(saleData.downPayment)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      const numeric = raw ? Number(raw) / 100 : '';
                      setSaleData((prev) => ({ ...prev, downPayment: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '' }));
                    }}
                    placeholder="R$ 0,00"
                  />
                  <Input
                    label="Financeira"
                    value={saleData.financeCompany}
                    onChange={(e) => setSaleData((prev) => ({ ...prev, financeCompany: e.target.value }))}
                    placeholder="Nome da financeira"
                  />
                  <Input
                    label="Data do Financiamento"
                    type="date"
                    value={saleData.financeDate}
                    onChange={(e) => setSaleData((prev) => ({ ...prev, financeDate: e.target.value }))}
                  />
                  <Input
                    label="Valor Financiado (R$)"
                    value={formatCurrencyDisplay(saleData.financedAmount)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      const numeric = raw ? Number(raw) / 100 : '';
                      setSaleData((prev) => ({ ...prev, financedAmount: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '' }));
                    }}
                    placeholder="R$ 0,00"
                  />
                  <Input
                    label="Nº de Parcelas"
                    type="number"
                    value={saleData.installments}
                    onChange={(e) => setSaleData((prev) => ({ ...prev, installments: e.target.value }))}
                    placeholder="36"
                  />
                  <Input
                    label="Valor das Parcelas (R$)"
                    value={formatCurrencyDisplay(saleData.installmentValue)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      const numeric = raw ? Number(raw) / 100 : '';
                      setSaleData((prev) => ({ ...prev, installmentValue: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '' }));
                    }}
                    placeholder="R$ 0,00"
                  />
                </div>
              )}

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Veículo na Troca</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasTradeIn"
                      checked={!saleData.hasTradeIn}
                      onChange={() => setSaleData((prev) => ({ ...prev, hasTradeIn: false }))}
                    />
                    Não
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasTradeIn"
                      checked={saleData.hasTradeIn}
                      onChange={() => setSaleData((prev) => ({ ...prev, hasTradeIn: true }))}
                    />
                    Sim
                  </label>
                </div>
              </div>

              {saleData.hasTradeIn && (
                <div className="mt-4 space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Select
                      label="Marca"
                      value={saleData.tradeInBrand}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInBrand: e.target.value, tradeInModel: '', tradeInVersion: '' }))}
                    >
                      <option value="">Selecione</option>
                      {BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </Select>
                    <Select
                      label="Modelo"
                      value={saleData.tradeInModel}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInModel: e.target.value, tradeInVersion: '' }))}
                      disabled={!saleData.tradeInBrand}
                    >
                      <option value="">Selecione</option>
                      {(MODELS_BY_BRAND[saleData.tradeInBrand] || []).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                    <Select
                      label="Versão"
                      value={saleData.tradeInVersion}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInVersion: e.target.value }))}
                      disabled={!saleData.tradeInModel}
                    >
                      <option value="">Selecione</option>
                      {(VERSIONS_BY_MODEL[saleData.tradeInModel] || []).map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Placa"
                      value={saleData.tradeInPlate}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInPlate: e.target.value.toUpperCase() }))}
                      placeholder="ABC1D23"
                    />
                    <Input
                      label="Ano Fabricação"
                      type="number"
                      value={saleData.tradeInYear}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInYear: e.target.value }))}
                      placeholder="2020"
                    />
                    <Input
                      label="Ano Modelo"
                      type="number"
                      value={saleData.tradeInModelYear}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInModelYear: e.target.value }))}
                      placeholder="2021"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Select
                      label="Combustível"
                      value={saleData.tradeInFuel}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInFuel: e.target.value }))}
                    >
                      <option value="flex">Flex</option>
                      <option value="gasoline">Gasolina</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Elétrico</option>
                      <option value="hybrid">Híbrido</option>
                    </Select>
                    <Input
                      label="Chassi"
                      value={saleData.tradeInChassis}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInChassis: e.target.value }))}
                      placeholder="9BWZZZ377VT004251"
                    />
                    <Input
                      label="Renavam"
                      value={saleData.tradeInRenavam}
                      onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInRenavam: e.target.value }))}
                      placeholder="12345678901"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Valor da Compra (R$)"
                      value={formatCurrencyDisplay(saleData.tradeInPurchasePrice)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const numeric = raw ? Number(raw) / 100 : '';
                        setSaleData((prev) => ({ ...prev, tradeInPurchasePrice: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '' }));
                      }}
                      placeholder="R$ 0,00"
                    />
                    <Input
                      label="Débitos (R$)"
                      value={formatCurrencyDisplay(saleData.tradeInDebts)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const numeric = raw ? Number(raw) / 100 : '';
                        const debts = numeric !== '' ? Number(numeric.toFixed(2)) : 0;
                        const purchase = Number(saleData.tradeInPurchasePrice.replace(',', '.')) || 0;
                        setSaleData((prev) => ({
                          ...prev,
                          tradeInDebts: numeric !== '' ? numeric.toFixed(2).replace('.', ',') : '',
                          tradeInNetValue: String((purchase - debts).toFixed(2).replace('.', ',')),
                        }));
                      }}
                      placeholder="R$ 0,00"
                    />
                    <Input
                      label="Valor da Entrada (R$)"
                      value={formatCurrencyDisplay(saleData.tradeInNetValue)}
                      readOnly
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <Textarea
                    label="Observação sobre Débitos"
                    value={saleData.tradeInDebtsNotes}
                    onChange={(e) => setSaleData((prev) => ({ ...prev, tradeInDebtsNotes: e.target.value }))}
                    placeholder="Descreva os débitos do veículo..."
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção 4 - Documentação Veículo */}
          <Card>
            <CardHeader>
              <CardTitle>4. Documentação Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                label="Observações"
                value={saleData.documentationNotes}
                onChange={(e) => setSaleData((prev) => ({ ...prev, documentationNotes: e.target.value }))}
                placeholder="Insira as informações e valores sobre a transferência do veículo"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Seção 5 - Vendedor */}
          <Card>
            <CardHeader>
              <CardTitle>5. Vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="Vendedor"
                value={saleData.sellerId}
                onChange={(e) => {
                  const seller = sellers.find((s) => String(s.id) === e.target.value);
                  setSaleData((prev) => ({
                    ...prev,
                    sellerId: e.target.value,
                    sellerName: seller?.name || '',
                  }));
                }}
              >
                <option value="">Selecione</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Seção 6 - Emitir Documentação */}
          <Card>
            <CardHeader>
              <CardTitle>6. Emitir Documentação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await apiClient.get(`/vehicles/${id}/documents/contrato`, { responseType: 'blob' });
                      const blob = (res as any).data as Blob;
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Contrato_Venda_${form.plate || id}.docx`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch {
                      alert('Erro ao gerar contrato. Verifique se a venda está salva.');
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Contrato de Venda
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await apiClient.get(`/vehicles/${id}/documents/termo`, { responseType: 'blob' });
                      const blob = (res as any).data as Blob;
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Termo_Garantia_${form.plate || id}.docx`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch {
                      alert('Erro ao gerar termo. Verifique se a venda está salva.');
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Termo de Garantia
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await apiClient.get(`/vehicles/${id}/documents/recibo`, { responseType: 'blob' });
                      const blob = (res as any).data as Blob;
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Recibo_Venda_${form.plate || id}.docx`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch {
                      alert('Erro ao gerar recibo. Verifique se a venda está salva.');
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Recibo de Venda
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  const formData = new FormData();
                  formData.append('vehicleId', String(id));
                  formData.append('salePrice', saleData.salePrice.replace(',', '.'));
                  formData.append('saleDate', saleData.saleDate);
                  formData.append('clientName', saleData.clientName);
                  formData.append('clientRg', saleData.clientRg);
                  formData.append('clientCpfCnpj', saleData.clientCpfCnpj);
                  formData.append('clientPhone', saleData.clientPhone);
                  if (saleData.clientEmail) formData.append('clientEmail', saleData.clientEmail);
                  if (saleData.clientAddress) formData.append('clientAddress', saleData.clientAddress);
                  formData.append('paymentMethod', saleData.paymentMethod);
                  if (saleData.downPayment) formData.append('downPayment', saleData.downPayment.replace(',', '.'));
                  if (saleData.financeCompany) formData.append('financeCompany', saleData.financeCompany);
                  if (saleData.financeDate) formData.append('financeDate', saleData.financeDate);
                  if (saleData.financedAmount) formData.append('financedAmount', saleData.financedAmount.replace(',', '.'));
                  if (saleData.installments) formData.append('installments', saleData.installments);
                  if (saleData.installmentValue) formData.append('installmentValue', saleData.installmentValue.replace(',', '.'));
                  formData.append('hasTradeIn', String(saleData.hasTradeIn));
                  if (saleData.tradeInBrand) formData.append('tradeInBrand', saleData.tradeInBrand);
                  if (saleData.tradeInModel) formData.append('tradeInModel', saleData.tradeInModel);
                  if (saleData.tradeInVersion) formData.append('tradeInVersion', saleData.tradeInVersion);
                  if (saleData.tradeInPlate) formData.append('tradeInPlate', saleData.tradeInPlate);
                  if (saleData.tradeInYear) formData.append('tradeInYear', saleData.tradeInYear);
                  if (saleData.tradeInModelYear) formData.append('tradeInModelYear', saleData.tradeInModelYear);
                  if (saleData.tradeInFuel) formData.append('tradeInFuel', saleData.tradeInFuel);
                  if (saleData.tradeInChassis) formData.append('tradeInChassis', saleData.tradeInChassis);
                  if (saleData.tradeInRenavam) formData.append('tradeInRenavam', saleData.tradeInRenavam);
                  if (saleData.tradeInPurchasePrice) formData.append('tradeInPurchasePrice', saleData.tradeInPurchasePrice.replace(',', '.'));
                  if (saleData.tradeInDebts) formData.append('tradeInDebts', saleData.tradeInDebts.replace(',', '.'));
                  if (saleData.tradeInDebtsNotes) formData.append('tradeInDebtsNotes', saleData.tradeInDebtsNotes);
                  if (saleData.tradeInNetValue) formData.append('tradeInNetValue', saleData.tradeInNetValue.replace(',', '.'));
                  if (saleData.documentationNotes) formData.append('documentationNotes', saleData.documentationNotes);
                  if (saleData.sellerId) formData.append('sellerId', saleData.sellerId);
                  if (saleData.sellerName) formData.append('sellerName', saleData.sellerName);

                  clientDocumentsFiles.forEach((file) => {
                    formData.append('clientDocuments', file);
                  });

                  await apiClient.post(`/vehicles/${id}/sale`, formData);
                  alert('Venda registrada com sucesso!');
                } catch (err: any) {
                  alert(err?.response?.data?.message || 'Erro ao registrar venda');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Registrar Venda
            </Button>
          </div>
        </div>
      )}

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
