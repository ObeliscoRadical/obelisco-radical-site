import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Clock, AlertCircle, CheckCircle, Loader2, LogOut, Plus, ChevronRight,
  Calendar, FileText, User, Users, Settings, BarChart3, CreditCard, X,
  ClipboardList, History, RefreshCw, Edit2, Trash2, Search, Filter,
  TrendingUp, DollarSign, UserPlus, Clock3, PieChart
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Chart colors
const COLORS = ['#FFD700', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B'];

const ConnectAdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  
  // Modals
  const [showNewTech, setShowNewTech] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showAdjust, setShowAdjust] = useState(null);
  
  // Forms
  const [techForm, setTechForm] = useState({ name: '', email: '', password: '' });
  const [adjustForm, setAdjustForm] = useState({ hours: 0, reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('connect_token');

  useEffect(() => {
    if (!token) {
      navigate('/connect');
      return;
    }
    fetchAll();
  }, [token, navigate]);

  useEffect(() => {
    if (token && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [token, activeTab, analyticsPeriod]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/connect/admin/analytics?period=${analyticsPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchAll = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [meRes, statsRes, techsRes, subsRes, reqsRes, adjRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/connect/me`, { headers }),
        fetch(`${BACKEND_URL}/api/connect/admin/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/connect/admin/technicians`, { headers }),
        fetch(`${BACKEND_URL}/api/connect/admin/subscriptions`, { headers }),
        fetch(`${BACKEND_URL}/api/connect/service-requests`, { headers }),
        fetch(`${BACKEND_URL}/api/connect/admin/hours-adjustments`, { headers })
      ]);
      
      if (!meRes.ok) {
        if (meRes.status === 401) {
          localStorage.removeItem('connect_token');
          localStorage.removeItem('connect_user');
          navigate('/connect');
          return;
        }
        throw new Error('Erro ao carregar dados');
      }
      
      const [userData, statsData, techsData, subsData, reqsData, adjData] = await Promise.all([
        meRes.json(),
        statsRes.json(),
        techsRes.json(),
        subsRes.json(),
        reqsRes.json(),
        adjRes.json()
      ]);
      
      setUser(userData);
      setStats(statsData.stats);
      setTechnicians(techsData.technicians || []);
      setSubscriptions(subsData.subscriptions || []);
      setRequests(reqsData.service_requests || []);
      setAdjustments(adjData.adjustments || []);
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
      console.warn('Logout request failed, clearing local session anyway:', e.message);
    }
    localStorage.removeItem('connect_token');
    localStorage.removeItem('connect_user');
    navigate('/connect');
  };

  const handleCreateTech = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/connect/admin/technicians`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(techForm)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erro ao criar tecnico');
      }

      setShowNewTech(false);
      setTechForm({ name: '', email: '', password: '' });
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTech = async (requestId, techId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/connect/service-requests/${requestId}/assign?technician_id=${techId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Erro ao atribuir tecnico');

      setShowAssign(null);
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdjustHours = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/connect/admin/hours-adjustment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_id: showAdjust.id,
          hours_adjusted: parseFloat(adjustForm.hours),
          reason: adjustForm.reason
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erro ao ajustar horas');
      }

      setShowAdjust(null);
      setAdjustForm({ hours: 0, reason: '' });
      fetchAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await fetch(`${BACKEND_URL}/api/connect/service-requests/${requestId}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAll();
    } catch (err) {
      setError(err.message);
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
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelado' },
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Ativo' },
      inactive: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Inativo' }
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

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white">Obelisco Connect</h1>
              <p className="text-xs text-zinc-500">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xs text-green-400 uppercase">Subscricoes Ativas</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.active_subscriptions || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-xs text-yellow-400 uppercase">Pedidos Pendentes</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.pending_requests || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-blue-400 uppercase">Tecnicos</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.total_technicians || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs text-purple-400 uppercase">Trabalhos Concluidos</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.completed_work_logs || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Visao Geral', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: PieChart },
            { id: 'requests', label: 'Pedidos', icon: ClipboardList },
            { id: 'technicians', label: 'Tecnicos', icon: Users },
            { id: 'subscriptions', label: 'Subscricoes', icon: CreditCard },
            { id: 'adjustments', label: 'Ajustes', icon: Clock3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              data-testid={`admin-tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <div className="bg-zinc-900 border border-zinc-800">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-white">Pedidos Recentes</h3>
                <button onClick={() => setActiveTab('requests')} className="text-[#FFD700] text-sm">Ver todos</button>
              </div>
              {requests.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhum pedido</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {requests.slice(0, 5).map(req => (
                    <div key={req.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-medium text-sm line-clamp-1">{req.description}</p>
                          <p className="text-xs text-zinc-500">{req.customer_email}</p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Subscriptions */}
            <div className="bg-zinc-900 border border-zinc-800">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-white">Subscricoes Ativas</h3>
                <button onClick={() => setActiveTab('subscriptions')} className="text-[#FFD700] text-sm">Ver todas</button>
              </div>
              {subscriptions.filter(s => s.status === 'active').length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhuma subscricao ativa</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {subscriptions.filter(s => s.status === 'active').slice(0, 5).map(sub => (
                    <div key={sub.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-medium text-sm">{sub.customer_name || sub.customer_email}</p>
                          <p className="text-xs text-[#FFD700]">{sub.plan_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">{sub.hours_available?.toFixed(1)}h</p>
                          <p className="text-xs text-zinc-500">disponiveis</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Technicians */}
            <div className="bg-zinc-900 border border-zinc-800">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-white">Tecnicos</h3>
                <button onClick={() => setShowNewTech(true)} className="text-[#FFD700] text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
              {technicians.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhum tecnico registado</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {technicians.map(tech => (
                    <div key={tech.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFD700]/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#FFD700]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{tech.name}</p>
                          <p className="text-xs text-zinc-500">{tech.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Adjustments */}
            <div className="bg-zinc-900 border border-zinc-800">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-white">Ajustes de Horas Recentes</h3>
                <button onClick={() => setActiveTab('adjustments')} className="text-[#FFD700] text-sm">Ver todos</button>
              </div>
              {adjustments.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhum ajuste registado</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {adjustments.slice(0, 5).map(adj => (
                    <div key={adj.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-zinc-500">{adj.customer_email}</p>
                          <p className="text-sm text-zinc-400">{adj.reason}</p>
                        </div>
                        <span className={`font-bold ${adj.hours_adjusted >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {adj.hours_adjusted >= 0 ? '+' : ''}{adj.hours_adjusted}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex gap-2">
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setAnalyticsPeriod(period)}
                  className={`px-4 py-2 text-sm font-medium ${
                    analyticsPeriod === period
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                  }`}
                >
                  {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Ano'}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Horas Consumidas</p>
                  <p className="text-2xl font-bold text-[#FFD700]">{analytics.summary.total_hours}h</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Pedidos</p>
                  <p className="text-2xl font-bold text-white">{analytics.summary.total_requests}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Taxa Conclusao</p>
                  <p className="text-2xl font-bold text-green-400">{analytics.summary.completion_rate}%</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Receita</p>
                  <p className="text-2xl font-bold text-blue-400">{analytics.summary.total_revenue}€</p>
                </div>
              </div>
            )}

            {/* Charts */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hours by Day */}
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Consumo de Horas</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={analytics.charts.hours_by_day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                      <XAxis dataKey="date" stroke="#71717A" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#71717A" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="horas" stroke="#FFD700" fill="#FFD700" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Requests by Status */}
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Pedidos por Estado</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={analytics.charts.requests_by_status}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, count }) => count > 0 ? `${status}: ${count}` : ''}
                      >
                        {analytics.charts.requests_by_status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Hours by Plan */}
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Horas por Plano</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.charts.hours_by_plan}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                      <XAxis dataKey="plan" stroke="#71717A" />
                      <YAxis stroke="#71717A" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46' }}
                      />
                      <Bar dataKey="horas" fill="#FFD700" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue by Plan */}
                <div className="bg-zinc-900 border border-zinc-800 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Receita por Plano</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.charts.revenue_by_plan}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                      <XAxis dataKey="plan" stroke="#71717A" />
                      <YAxis stroke="#71717A" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181B', border: '1px solid #3F3F46' }}
                        formatter={(value) => [`${value}€`, 'Receita']}
                      />
                      <Bar dataKey="valor" fill="#22C55E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {!analytics && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Todos os Pedidos ({requests.length})</h3>
              <button onClick={fetchAll} className="text-zinc-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {requests.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhum pedido registado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Cliente</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Descricao</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Tipo</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Tecnico</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Estado</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-3 px-4">
                          <p className="text-white text-sm">{req.customer_name || '-'}</p>
                          <p className="text-xs text-zinc-500">{req.customer_email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-white text-sm line-clamp-2 max-w-xs">{req.description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-zinc-400 uppercase">{req.request_type}</span>
                        </td>
                        <td className="py-3 px-4">
                          {req.assigned_technician_name ? (
                            <span className="text-sm text-white">{req.assigned_technician_name}</span>
                          ) : (
                            <button
                              onClick={() => setShowAssign(req)}
                              className="text-xs text-[#FFD700] hover:underline"
                              data-testid={`assign-btn-${req.id}`}
                            >
                              Atribuir
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={req.status}
                            onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-white text-xs px-2 py-1"
                            data-testid={`status-select-${req.id}`}
                          >
                            <option value="pending">Pendente</option>
                            <option value="assigned">Atribuido</option>
                            <option value="scheduled">Agendado</option>
                            <option value="in_progress">Em Progresso</option>
                            <option value="completed">Concluido</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Technicians Tab */}
        {activeTab === 'technicians' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Gestao de Tecnicos ({technicians.length})</h3>
              <button
                onClick={() => setShowNewTech(true)}
                className="bg-[#FFD700] text-black px-4 py-2 text-sm font-bold flex items-center gap-2"
                data-testid="add-tech-btn"
              >
                <Plus className="w-4 h-4" />
                Novo Tecnico
              </button>
            </div>
            {technicians.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhum tecnico registado</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {technicians.map(tech => (
                  <div key={tech.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center">
                        <User className="w-6 h-6 text-[#FFD700]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{tech.name}</p>
                        <p className="text-sm text-zinc-500">{tech.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Criado em</p>
                      <p className="text-sm text-white">{formatDate(tech.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Todas as Subscricoes ({subscriptions.length})</h3>
              <button onClick={fetchAll} className="text-zinc-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {subscriptions.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhuma subscricao registada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Cliente</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Plano</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Horas Incl.</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Usadas</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Disponiveis</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Estado</th>
                      <th className="text-left py-3 px-4 text-zinc-500 text-xs uppercase">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(sub => (
                      <tr key={sub.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-3 px-4">
                          <p className="text-white text-sm">{sub.customer_name || '-'}</p>
                          <p className="text-xs text-zinc-500">{sub.customer_email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#FFD700] font-bold">{sub.plan_name}</span>
                        </td>
                        <td className="py-3 px-4 text-white">{sub.hours_included}h</td>
                        <td className="py-3 px-4 text-zinc-400">{sub.hours_used?.toFixed(1) || 0}h</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${sub.hours_available <= 2 ? 'text-red-400' : 'text-green-400'}`}>
                            {sub.hours_available?.toFixed(1) || 0}h
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setShowAdjust(sub)}
                            className="text-[#FFD700] text-sm hover:underline"
                            data-testid={`adjust-btn-${sub.id}`}
                          >
                            Ajustar Horas
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Adjustments Tab */}
        {activeTab === 'adjustments' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white">Historico de Ajustes de Horas ({adjustments.length})</h3>
            </div>
            {adjustments.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhum ajuste registado</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {adjustments.map(adj => (
                  <div key={adj.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{adj.customer_name || adj.customer_email}</p>
                        <p className="text-sm text-zinc-400">{adj.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${adj.hours_adjusted >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {adj.hours_adjusted >= 0 ? '+' : ''}{adj.hours_adjusted}h
                        </span>
                        <p className="text-xs text-zinc-500">Novo saldo: {adj.new_balance?.toFixed(1)}h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{formatDate(adj.created_at)}</span>
                      <span>Por: {adj.admin_email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* New Technician Modal */}
      {showNewTech && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowNewTech(false)}>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Novo Tecnico</h3>
              <button onClick={() => setShowNewTech(false)} className="text-zinc-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTech} className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Nome *</label>
                <input
                  type="text"
                  value={techForm.name}
                  onChange={e => setTechForm({...techForm, name: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                  required
                  data-testid="tech-name"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Email *</label>
                <input
                  type="email"
                  value={techForm.email}
                  onChange={e => setTechForm({...techForm, email: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                  required
                  data-testid="tech-email"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Password *</label>
                <input
                  type="password"
                  value={techForm.password}
                  onChange={e => setTechForm({...techForm, password: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                  required
                  minLength={6}
                  data-testid="tech-password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FFD700] text-black font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="submit-tech"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Criar Tecnico
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAssign(null)}>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Atribuir Tecnico</h3>
              <button onClick={() => setShowAssign(null)} className="text-zinc-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <p className="text-zinc-400 mb-4">Selecione um tecnico para o pedido:</p>
              <p className="text-sm text-white mb-4 line-clamp-2">{showAssign.description}</p>
              <div className="space-y-2">
                {technicians.map(tech => (
                  <button
                    key={tech.id}
                    onClick={() => handleAssignTech(showAssign.id, tech.id)}
                    className="w-full bg-zinc-800 border border-zinc-700 p-3 flex items-center gap-3 hover:border-[#FFD700] transition-colors"
                    data-testid={`select-tech-${tech.id}`}
                  >
                    <div className="w-10 h-10 bg-[#FFD700]/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{tech.name}</p>
                      <p className="text-xs text-zinc-500">{tech.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Hours Modal */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowAdjust(null)}>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Ajustar Horas</h3>
              <button onClick={() => setShowAdjust(null)} className="text-zinc-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdjustHours} className="p-4 space-y-4">
              <div className="bg-zinc-800 p-3">
                <p className="text-xs text-zinc-500">Cliente</p>
                <p className="text-white">{showAdjust.customer_name || showAdjust.customer_email}</p>
                <p className="text-sm text-[#FFD700] mt-1">{showAdjust.plan_name}</p>
              </div>
              
              <div className="bg-zinc-800 p-3">
                <p className="text-xs text-zinc-500">Saldo Atual</p>
                <p className="text-2xl font-bold text-white">{showAdjust.hours_available?.toFixed(1)}h</p>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Horas a Ajustar *</label>
                <input
                  type="number"
                  step="0.5"
                  value={adjustForm.hours}
                  onChange={e => setAdjustForm({...adjustForm, hours: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3"
                  placeholder="Use valores negativos para deduzir"
                  required
                  data-testid="adjust-hours"
                />
                <p className="text-xs text-zinc-500 mt-1">Ex: 2 para adicionar, -1 para deduzir</p>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-2">Motivo *</label>
                <textarea
                  value={adjustForm.reason}
                  onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 min-h-[80px]"
                  placeholder="Descreva o motivo do ajuste..."
                  required
                  data-testid="adjust-reason"
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting || !adjustForm.hours || !adjustForm.reason}
                className="w-full bg-[#FFD700] text-black font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="submit-adjust"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock3 className="w-5 h-5" />}
                Aplicar Ajuste
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectAdminDashboard;
