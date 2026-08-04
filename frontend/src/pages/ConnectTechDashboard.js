import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Clock, AlertCircle, CheckCircle, Loader2, LogOut, Play, Pause, Square,
  Calendar, FileText, User, Camera, MapPin, ChevronRight, X, Upload,
  ClipboardList, History, Settings, CheckSquare, Timer, Image, Video,
  Phone, Navigation, Edit2, Trash2, RefreshCw, Bell
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import { subscribeToPush, isPushSubscribed } from '../utils/pushNotifications';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ConnectTechDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  
  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);
  
  // Work log form
  const [workLogForm, setWorkLogForm] = useState({
    description: '',
    notes: '',
    checklist: []
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const token = localStorage.getItem('connect_token');

  // Checklist items
  const defaultChecklist = [
    { id: 1, text: 'Verificar quadro eletrico', checked: false },
    { id: 2, text: 'Testar tensao e corrente', checked: false },
    { id: 3, text: 'Verificar ligacoes', checked: false },
    { id: 4, text: 'Teste de funcionamento', checked: false },
    { id: 5, text: 'Limpeza do local', checked: false },
    { id: 6, text: 'Informar cliente sobre trabalho realizado', checked: false }
  ];

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
    const result = await subscribeToPush(userData.id || userData.email, 'TECHNICIAN');
    if (result.success) {
      setPushEnabled(true);
    }
  };

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const fetchDashboard = async () => {
    try {
      const [meRes, dashRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/connect/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}/api/connect/technician/dashboard`, {
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
      console.warn('Logout request failed, clearing local session anyway:', e.message);
    }
    localStorage.removeItem('connect_token');
    localStorage.removeItem('connect_user');
    navigate('/connect');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const getUrgencyBadge = (urgency) => {
    const config = {
      normal: { bg: 'bg-zinc-700', text: 'text-zinc-300' },
      urgent: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      emergency: { bg: 'bg-red-500/20', text: 'text-red-400' }
    };
    const c = config[urgency] || config.normal;
    return <span className={`px-2 py-1 text-xs font-bold ${c.bg} ${c.text} uppercase`}>{urgency}</span>;
  };

  const startJob = async (job) => {
    setSelectedJob(job);
    setTimerSeconds(0);
    setTimerRunning(true);
    setWorkLogForm({
      description: '',
      notes: '',
      checklist: defaultChecklist.map(item => ({ ...item, checked: false }))
    });
    setPhotos([]);
    setVideos([]);
    setSignature(null);
    
    // Update status to in_progress
    try {
      await fetch(`${BACKEND_URL}/api/connect/service-requests/${job.id}/status?status=in_progress`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboard();
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) {
      alert('Maximo de 10 fotos permitidas');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert('Cada foto deve ter menos de 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          data: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (videos.length + files.length > 3) {
      alert('Maximo de 3 videos permitidos');
      return;
    }

    files.forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        alert('Cada video deve ter menos de 50MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideos(prev => [...prev, {
          id: Date.now() + Math.random(),
          data: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const toggleChecklistItem = (itemId) => {
    setWorkLogForm(prev => ({
      ...prev,
      checklist: prev.checklist.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const handleSubmitWorkLog = async (e) => {
    e.preventDefault();
    
    if (!signature) {
      setShowSignature(true);
      return;
    }

    setSubmitting(true);
    setError('');

    const hoursSpent = timerSeconds / 3600;

    try {
      // Submit work log
      const res = await fetch(`${BACKEND_URL}/api/connect/work-logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_request_id: selectedJob.id,
          hours_spent: Math.max(0.25, Math.round(hoursSpent * 4) / 4), // Round to nearest 15 min
          work_description: workLogForm.description || `Servico realizado: ${selectedJob.request_type}`,
          notes: workLogForm.notes,
          checklist: workLogForm.checklist,
          photos: photos.map(p => p.data),
          videos: videos.map(v => v.data),
          signature: signature
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erro ao submeter work log');
      }

      // Update status to completed
      await fetch(`${BACKEND_URL}/api/connect/service-requests/${selectedJob.id}/status?status=completed`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimerRunning(false);
      setSelectedJob(null);
      setShowWorkLog(false);
      fetchDashboard();
      alert('Trabalho registado com sucesso!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignatureSave = (signatureData) => {
    setSignature(signatureData);
    setShowSignature(false);
  };

  const openMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const callClient = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  // Active Job View
  if (selectedJob) {
    return (
      <div className="min-h-screen bg-[#09090B]">
        {/* Header */}
        <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Tem a certeza que quer sair sem registar o trabalho?')) {
                  setTimerRunning(false);
                  setSelectedJob(null);
                }
              }}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <p className="text-xs text-zinc-500">Servico em Curso</p>
              <p className="font-bold text-[#FFD700]">{selectedJob.customer_name || 'Cliente'}</p>
            </div>
            <div className="w-6" />
          </div>
        </header>

        <main className="px-4 py-6 max-w-lg mx-auto pb-32">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Timer Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 mb-6 text-center">
            <p className="text-xs text-zinc-500 mb-2">TEMPO DE SERVICO</p>
            <p className="text-5xl font-mono font-bold text-[#FFD700] mb-4" data-testid="service-timer">
              {formatTime(timerSeconds)}
            </p>
            <div className="flex gap-3 justify-center">
              {timerRunning ? (
                <button
                  onClick={() => setTimerRunning(false)}
                  className="bg-orange-500 text-white p-3 rounded-full"
                  data-testid="pause-timer"
                >
                  <Pause className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={() => setTimerRunning(true)}
                  className="bg-green-500 text-white p-3 rounded-full"
                  data-testid="resume-timer"
                >
                  <Play className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={() => setShowWorkLog(true)}
                className="bg-[#FFD700] text-black p-3 rounded-full"
                data-testid="finish-job"
              >
                <Square className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Job Info */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 mb-4">
            <h3 className="font-bold text-white mb-3">{selectedJob.description}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-zinc-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{selectedJob.address || 'Morada nao especificada'}</span>
              </div>
              {selectedJob.customer_phone && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="w-4 h-4" />
                  <span>{selectedJob.customer_phone}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              {selectedJob.address && (
                <button
                  onClick={() => openMaps(selectedJob.address)}
                  className="flex-1 bg-blue-500/20 text-blue-400 py-2 px-3 flex items-center justify-center gap-2 text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Navegar
                </button>
              )}
              {selectedJob.customer_phone && (
                <button
                  onClick={() => callClient(selectedJob.customer_phone)}
                  className="flex-1 bg-green-500/20 text-green-400 py-2 px-3 flex items-center justify-center gap-2 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Ligar
                </button>
              )}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 mb-4">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#FFD700]" />
              Checklist de Servico
            </h3>
            <div className="space-y-2">
              {workLogForm.checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`w-full text-left p-3 border transition-colors flex items-center gap-3 ${
                    item.checked
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                  data-testid={`checklist-item-${item.id}`}
                >
                  <div className={`w-5 h-5 border flex items-center justify-center ${
                    item.checked ? 'bg-green-500 border-green-500' : 'border-zinc-600'
                  }`}>
                    {item.checked && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 mb-4">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FFD700]" />
              Fotos ({photos.length}/10)
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map(photo => (
                  <div key={photo.id} className="relative">
                    <img src={photo.data} alt="Preview" className="w-full h-20 object-cover border border-zinc-700" />
                    <button
                      onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= 10}
              className="w-full py-3 border border-dashed border-zinc-700 text-zinc-500 hover:border-[#FFD700] hover:text-[#FFD700] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="add-photo"
            >
              <Camera className="w-5 h-5" />
              Adicionar Foto
            </button>
          </div>

          {/* Videos */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 mb-4">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#FFD700]" />
              Videos ({videos.length}/3)
            </h3>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              onChange={handleVideoSelect}
              className="hidden"
            />
            {videos.length > 0 && (
              <div className="space-y-2 mb-3">
                {videos.map(video => (
                  <div key={video.id} className="flex items-center justify-between bg-zinc-800 p-2 border border-zinc-700">
                    <span className="text-sm text-zinc-300 truncate">{video.name}</span>
                    <button
                      onClick={() => setVideos(prev => prev.filter(v => v.id !== video.id))}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={videos.length >= 3}
              className="w-full py-3 border border-dashed border-zinc-700 text-zinc-500 hover:border-[#FFD700] hover:text-[#FFD700] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="add-video"
            >
              <Video className="w-5 h-5" />
              Adicionar Video
            </button>
          </div>
        </main>

        {/* Work Log Modal */}
        {showWorkLog && (
          <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
            <div className="min-h-screen p-4">
              <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900">
                  <h3 className="text-lg font-bold text-white">Finalizar Servico</h3>
                  <button onClick={() => setShowWorkLog(false)} className="text-zinc-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitWorkLog} className="p-4 space-y-4">
                  <div className="bg-zinc-800 p-4 text-center">
                    <p className="text-xs text-zinc-500">Tempo Total</p>
                    <p className="text-3xl font-mono font-bold text-[#FFD700]">{formatTime(timerSeconds)}</p>
                    <p className="text-sm text-zinc-400 mt-1">
                      = {Math.max(0.25, Math.round((timerSeconds / 3600) * 4) / 4).toFixed(2)} horas
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-2">Descricao do Trabalho *</label>
                    <textarea
                      value={workLogForm.description}
                      onChange={e => setWorkLogForm({...workLogForm, description: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 min-h-[100px]"
                      placeholder="Descreva o trabalho realizado..."
                      required
                      data-testid="worklog-description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-2">Notas Adicionais</label>
                    <textarea
                      value={workLogForm.notes}
                      onChange={e => setWorkLogForm({...workLogForm, notes: e.target.value})}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 min-h-[60px]"
                      placeholder="Observacoes, recomendacoes..."
                      data-testid="worklog-notes"
                    />
                  </div>

                  {/* Checklist Summary */}
                  <div className="bg-zinc-800 p-3">
                    <p className="text-xs text-zinc-500 mb-2">Checklist Completada</p>
                    <p className="text-white">
                      {workLogForm.checklist.filter(i => i.checked).length}/{workLogForm.checklist.length} itens
                    </p>
                  </div>

                  {/* Media Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800 p-3">
                      <p className="text-xs text-zinc-500 mb-1">Fotos</p>
                      <p className="text-white">{photos.length} anexadas</p>
                    </div>
                    <div className="bg-zinc-800 p-3">
                      <p className="text-xs text-zinc-500 mb-1">Videos</p>
                      <p className="text-white">{videos.length} anexados</p>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="bg-zinc-800 p-4">
                    <p className="text-xs text-zinc-500 uppercase mb-3">Assinatura do Cliente</p>
                    {signature ? (
                      <div className="space-y-3">
                        <img src={signature} alt="Assinatura" className="w-full h-24 object-contain border border-zinc-700 bg-zinc-900" />
                        <button
                          type="button"
                          onClick={() => setSignature(null)}
                          className="text-red-400 text-sm flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Remover assinatura
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSignature(true)}
                        className="w-full py-3 border border-dashed border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors flex items-center justify-center gap-2"
                        data-testid="open-signature"
                      >
                        <Edit2 className="w-5 h-5" />
                        Recolher Assinatura
                      </button>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting || !signature}
                    className="w-full bg-[#FFD700] text-black font-bold py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="submit-worklog"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {signature ? 'Submeter Trabalho' : 'Falta Assinatura do Cliente'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Signature Modal */}
        {showSignature && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 w-full max-w-md">
              <SignaturePad
                onSave={handleSignatureSave}
                onCancel={() => setShowSignature(false)}
                width={350}
                height={180}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Dashboard View
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
              <p className="text-xs text-zinc-500">Area do Tecnico</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            data-testid="tech-logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FFD700]/20 border border-[#FFD700] flex items-center justify-center">
              <User className="w-7 h-7 text-[#FFD700]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name || 'Tecnico'}</h2>
              <p className="text-zinc-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{dashboard?.stats?.pending || 0}</p>
            <p className="text-xs text-zinc-500">Pendentes</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{dashboard?.stats?.in_progress || 0}</p>
            <p className="text-xs text-zinc-500">Em Curso</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{dashboard?.stats?.completed_today || 0}</p>
            <p className="text-xs text-zinc-500">Concluidos Hoje</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{dashboard?.stats?.total_jobs || 0}</p>
            <p className="text-xs text-zinc-500">Total</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'jobs', label: 'Trabalhos', icon: ClipboardList },
            { id: 'history', label: 'Historico', icon: History },
            { id: 'profile', label: 'Perfil', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#FFD700] text-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              data-testid={`tech-tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Trabalhos Atribuidos</h3>
              <button onClick={fetchDashboard} className="text-zinc-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {dashboard?.assigned_requests?.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhum trabalho atribuido</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {dashboard?.assigned_requests?.map(job => (
                  <div key={job.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(job.status)}
                          {getUrgencyBadge(job.urgency)}
                        </div>
                        <p className="text-white font-medium">{job.description}</p>
                        <p className="text-xs text-zinc-500 mt-1">{job.customer_name || 'Cliente'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                      {job.scheduled_date && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <Calendar className="w-3 h-3" />
                          {job.scheduled_date} {job.scheduled_time}
                        </span>
                      )}
                      {job.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.address.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {job.status !== 'completed' && job.status !== 'cancelled' && (
                        <button
                          onClick={() => startJob(job)}
                          className="flex-1 bg-[#FFD700] text-black font-bold py-2 flex items-center justify-center gap-2"
                          data-testid={`start-job-${job.id}`}
                        >
                          <Play className="w-4 h-4" />
                          Iniciar
                        </button>
                      )}
                      {job.address && (
                        <button
                          onClick={() => openMaps(job.address)}
                          className="bg-blue-500/20 text-blue-400 py-2 px-4"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                      )}
                      {job.customer_phone && (
                        <button
                          onClick={() => callClient(job.customer_phone)}
                          className="bg-green-500/20 text-green-400 py-2 px-4"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-bold text-white">Work Logs Recentes</h3>
            </div>
            {dashboard?.recent_logs?.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">Nenhum registo</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {dashboard?.recent_logs?.map(log => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{log.work_description}</p>
                        <p className="text-xs text-zinc-400 mt-1">{log.notes}</p>
                      </div>
                      <span className="text-[#FFD700] font-bold">{log.hours_spent}h</span>
                    </div>
                    <p className="text-xs text-zinc-500">{formatDate(log.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Dados do Perfil</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Nome</p>
                  <p className="text-white">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Funcao</p>
                  <p className="text-[#FFD700] font-bold uppercase">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#FFD700]" />
                Notificacoes
              </h3>
              {pushEnabled ? (
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Notificacoes ativadas - Recebera alertas de novos trabalhos</span>
                </div>
              ) : (
                <div>
                  <p className="text-zinc-400 text-sm mb-3">Ative as notificacoes para receber alertas quando lhe for atribuido um novo trabalho.</p>
                  <button
                    onClick={handleEnablePush}
                    className="w-full bg-[#FFD700] text-black font-bold py-3 flex items-center justify-center gap-2"
                    data-testid="enable-push-tech"
                  >
                    <Bell className="w-5 h-5" />
                    Ativar Notificacoes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 md:hidden">
        <div className="flex items-center justify-around py-3">
          <button onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center gap-1 ${activeTab === 'jobs' ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs">Trabalhos</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
            <History className="w-5 h-5" />
            <span className="text-xs">Historico</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-[#FFD700]' : 'text-zinc-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ConnectTechDashboard;
