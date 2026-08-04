import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Clock, AlertCircle, CheckCircle, Loader2, LogOut, Plus, ChevronRight,
  Calendar, FileText, Phone, MessageSquare, Settings, User, CreditCard,
  ClipboardList, History, Bell, RefreshCw, MapPin, Camera, X, Download
} from 'lucide-react';
import { subscribeToPush, isPushSubscribed } from '../utils/pushNotifications';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ConnectClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [pushEnabled, setPushEnabled] = useState(false);
  
  // New request form
  const [requestForm, setRequestForm] = useState({
    request_type: 'avaria',
    urgency: 'normal',
    description: '',
    preferred_date: '',
    preferred_time: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('connect_token');

  useEffect(() => {
    if (!token) {
      navigate('/connect');
      return;
    }
    fetchDashboard();
    checkPushStatus();
  }, [token, navigate]);

  const checkPushStatus = async () => {
    const enabled = await isPushSubscribed();
    setPushEnabled(enabled);
  };

  const handleEnablePush = async () => {
    const stored = localStorage.getItem('connect_user');
    if (!stored) return;
    const userData = JSON.parse(stored);
    const result = await subscribeToPush(userData.subscription_id || userData.email, 'CUSTOMER');
    if (result.success) {
      setPushEnabled(true);
    }
  };

  const downloadMonthlyReport = () => {
    const subscriptionId = dashboard?.subscription?.id;
    if (!subscriptionId) return;
    const now = new Date();
    const url = `${BACKEND_URL}/api/reports/monthly/${subscriptionId}?month=${now.getMonth() + 1}&year=${now.getFullYear()}`;
    window.open(url, '_blank');
  };

  const fetchDashboard = async () => {
    try {
      const [meRes, dashRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/connect/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}/api/connect/customer/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (!meRes.ok || !dashRes.ok) {
        if (meRes.status === 401 || dashRes.status === 401) {
          localStorage.removeItem('connect_token');
          localStorage.removeItem('connect_user');
          navigate('/connect');
          return;
        }
        throw new Error('Erro ao carregar dados');
      }
      
      const userData = await meRes.json();
      const dashData = await dashRes.json();
      
      setUser(userData);
      setDashboard(dashData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/connect/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      // Ignore logout errors - clear local storage anyway
    }
    localStorage.removeItem('connect_token');
    localStorage.removeItem('connect_user');
    navigate('/connect');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/connect/service-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_id: dashboard?.subscription?.id,
          customer_email: user?.email,
          ...requestForm
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erro ao criar pedido');
      }

      setShowNewRequest(false);
      setRequestForm({
        request_type: 'avaria',
        urgency: 'normal',
        description: '',
        preferred_date: '',
        preferred_time: '',
        address: ''
      });
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT');
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pendente' },
      assigned: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Atribuido' },
      scheduled: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Agendado' },
      in_progress: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Em Progresso' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Concluido' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelado' }
    };
    const c = config[status] || config.pending;
    return <span className={`px-2 py-1 text-xs font-bold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  const hoursPercent = dashboard?.hours?.percentage_used || 0;

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white">Obelisco Connect</h1>
              <p className="text-xs text-zinc-500">Area do Cliente</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Ola, {user?.name || 'Cliente'}!</h2>
              <p className="text-zinc-400">Plano: <span className="text-[#FFD700] font-bold">{dashboard?.subscription?.plan_name || 'N/A'}</span></p>
            </div>
            <button
              onClick={() => setShowNewRequest(true)}
              className="bg-[#FFD700] text-black font-bold py-3 px-6 flex items-center gap-2 hover:bg-[#FFD700]/90 transition-colors"
              data-testid="new-request-btn"
            >
              <Plus className="w-5 h-5" />
              Novo Pedido
            </button>
          </div>
        </div>

        {/* Hours Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FFD700]" />
              Saldo de Horas
            </h3>
            <button onClick={fetchDashboard} className="text-zinc-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{dashboard?.hours?.included || 0}h</p>
              <p className="text-xs text-zinc-500">Incluidas/mes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FFD700]">{dashboard?.hours?.available?.toFixed(1) || 0}h</p>
              <p className="text-xs text-zinc-500">Disponiveis</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-zinc-400">{dashboard?.hours?.used?.toFixed(1) || 0}h</p>
              <p className="text-xs text-zinc-500">Utilizadas</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${hoursPercent > 80 ? 'bg-red-500' : hoursPercent > 50 ? 'bg-yellow-500' : 'bg-[#FFD700]'}`}
              style={{ width: `${Math.min(hoursPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2 text-center">{hoursPercent.toFixed(0)}% utilizado</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Resumo', icon: ClipboardList },
            { id: 'requests', label: 'Pedidos', icon: FileText },
            { id: 'history', label: 'Historico', icon: History },
            { id: 'settings', label: 'Conta', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FFD700]" />
                Pedidos Recentes
              </h3>
              {dashboard?.service_requests?.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhum pedido registado</p>
              ) : (
                <div className="space-y-3">
                  {dashboard?.service_requests?.slice(0, 3).map(req => (
                    <div key={req.id} className="bg-zinc-800/50 p-3 border border-zinc-700">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white font-medium line-clamp-1">{req.description}</p>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-zinc-500">{formatDate(req.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Work Logs */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-[#FFD700]" />
                Ultimas Intervencoes
              </h3>
              {dashboard?.work_logs?.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhuma intervencao registada</p>
              ) : (
                <div className="space-y-3">
                  {dashboard?.work_logs?.slice(0, 3).map(log => (
                    <div key={log.id} className="bg-zinc-800/50 p-3 border border-zinc-700">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white font-medium line-clamp-1">{log.work_description}</p>
                        <span className="text-[#FFD700] font-bold text-sm">-{log.hours_spent}h</span>
                      </div>
                      <p className="text-xs text-zinc-500">Tecnico: {log.technician_name || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscription Info */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 md:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FFD700]" />
                Detalhes da Subscricao
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Plano</p>
                  <p className="text-white font-bold">{dashboard?.subscription?.plan_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Valor</p>
                  <p className="text-white font-bold">{dashboard?.subscription?.amount || 0} EUR/{dashboard?.subscription?.billing_cycle === 'annual' ? 'ano' : 'mes'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Estado</p>
                  <p className={`font-bold ${dashboard?.subscription?.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                    {dashboard?.subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Desde</p>
                  <p className="text-white font-bold">{formatDate(dashboard?.subscription?.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Todos os Pedidos</h3>
              <button
                onClick={() => setShowNewRequest(true)}
                className="text-[#FFD700] text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Novo
              </button>
            </div>
            {dashboard?.service_requests?.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhum pedido registado</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {dashboard?.service_requests?.map(req => (
                  <div key={req.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{req.description}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Tipo: {req.request_type} | Urgencia: {req.urgency}
                        </p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(req.created_at)}
                      </span>
                      {req.scheduled_date && (
                        <span className="flex items-center gap-1 text-[#FFD700]">
                          <Clock className="w-3 h-3" />
                          Agendado: {req.scheduled_date} {req.scheduled_time}
                        </span>
                      )}
                      {req.assigned_technician_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {req.assigned_technician_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white">Historico de Intervencoes</h3>
            </div>
            {dashboard?.work_logs?.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhuma intervencao registada</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {dashboard?.work_logs?.map(log => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{log.work_description}</p>
                        <p className="text-xs text-zinc-400 mt-1">{log.notes || 'Sem notas adicionais'}</p>
                      </div>
                      <span className="text-[#FFD700] font-bold">-{log.hours_spent}h</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.technician_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Dados da Conta</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Nome</p>
                  <p className="text-white">{user?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Email</p>
                  <p className="text-white">{user?.email || '-'}</p>
                </div>
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FFD700]" />
                Relatorios
              </h3>
              <button
                onClick={downloadMonthlyReport}
                className="w-full bg-zinc-800 border border-zinc-700 p-4 flex items-center justify-between hover:border-[#FFD700] transition-colors"
                data-testid="download-report"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#FFD700]" />
                  <div className="text-left">
                    <p className="text-white font-medium">Relatorio Mensal</p>
                    <p className="text-xs text-zinc-500">Download PDF com consumo de horas</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* Notifications Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#FFD700]" />
                Notificacoes
              </h3>
              {pushEnabled ? (
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Notificacoes ativadas</span>
                </div>
              ) : (
                <button
                  onClick={handleEnablePush}
                  className="w-full bg-[#FFD700] text-black font-bold py-3 flex items-center justify-center gap-2"
                  data-testid="enable-push"
                >
                  <Bell className="w-5 h-5" />
                  Ativar Notificacoes
                </button>
              )}
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Contacto</h3>
              <div className="space-y-3">
                <a href="tel:+351911132401" className="flex items-center gap-3 text-zinc-300 hover:text-[#FFD700] transition-colors">
                  <Phone className="w-5 h-5" />
                  +351 911 132 401
                </a>
                <a href="mailto:obeliscoradical@gmail.com" className="flex items-center gap-3 text-zinc-300 hover:text-[#FFD700] transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  obeliscoradical@gmail.com
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowNewRequest(false)}>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900">
              <h3 className="text-lg font-bold text-white">Novo Pedido de Servico</h3>
              <button onClick={() => setShowNewRequest(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Tipo de Servico</label>
                <select
                  value={requestForm.request_type}
                  onChange={e => setRequestForm({...requestForm, request_type: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                  data-testid="request-type"
                >
                  <option value="avaria">Avaria / Reparacao</option>
                  <option value="manutencao">Manutencao</option>
                  <option value="instalacao">Instalacao</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Urgencia</label>
                <select
                  value={requestForm.urgency}
                  onChange={e => setRequestForm({...requestForm, urgency: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                  data-testid="request-urgency"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgente</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Descricao do Problema *</label>
                <textarea
                  value={requestForm.description}
                  onChange={e => setRequestForm({...requestForm, description: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 min-h-[100px]"
                  placeholder="Descreva o problema ou servico necessario..."
                  required
                  data-testid="request-description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-2">Data Preferida</label>
                  <input
                    type="date"
                    value={requestForm.preferred_date}
                    onChange={e => setRequestForm({...requestForm, preferred_date: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="request-date"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-2">Hora Preferida</label>
                  <input
                    type="time"
                    value={requestForm.preferred_time}
                    onChange={e => setRequestForm({...requestForm, preferred_time: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                    data-testid="request-time"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Morada (opcional)</label>
                <input
                  type="text"
                  value={requestForm.address}
                  onChange={e => setRequestForm({...requestForm, address: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                  placeholder="Deixe vazio para usar morada da subscricao"
                  data-testid="request-address"
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting || !requestForm.description}
                className="w-full bg-[#FFD700] text-black font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="submit-request"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Criar Pedido
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 md:hidden">
        <div className="flex items-center justify-around py-3">
          <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs">Resumo</span>
          </button>
          <button onClick={() => setActiveTab('requests')} className={`flex flex-col items-center gap-1 ${activeTab === 'requests' ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
            <FileText className="w-5 h-5" />
            <span className="text-xs">Pedidos</span>
          </button>
          <button onClick={() => setShowNewRequest(true)} className="flex flex-col items-center gap-1 text-[#FFD700]">
            <Plus className="w-6 h-6" />
            <span className="text-xs">Novo</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
            <History className="w-5 h-5" />
            <span className="text-xs">Historico</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
            <Settings className="w-5 h-5" />
            <span className="text-xs">Conta</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ConnectClientDashboard;
