import { useState, useEffect } from 'react'
import { Plus, Trash2, Power, Check, X, Loader, Search, Link as LinkIcon, Rss, Globe, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'

const SCRAPER_API = 'https://scrapers-reddit-youtube-blogs.7exngm.easypanel.host'

export default function SourcesManager() {
    const [sources, setSources] = useState([])
    const [loading, setLoading] = useState(true)
    const [addingSource, setAddingSource] = useState(false)
    const [validating, setValidating] = useState(false)
    const [newSourceUrl, setNewSourceUrl] = useState('')
    const [newSourceName, setNewSourceName] = useState('')
    const [validationResult, setValidationResult] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchSources()
    }, [])

    const fetchSources = async () => {
        try {
            const res = await fetch(`${SCRAPER_API}/api/sources`)
            if (res.ok) {
                const data = await res.json()
                setSources(data.sources || [])
            }
        } catch (error) {
            console.error('Error fetching sources:', error)
        } finally {
            setLoading(false)
        }
    }

    const validateSource = async () => {
        if (!newSourceUrl.trim()) return

        setValidating(true)
        setValidationResult(null)

        try {
            const res = await fetch(`${SCRAPER_API}/api/sources/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: newSourceUrl.trim(),
                    name: newSourceName.trim() || null
                })
            })

            const data = await res.json()
            setValidationResult(data)
        } catch (error) {
            console.error('Error validating source:', error)
            setValidationResult({
                success: false,
                error: 'Erro ao conectar com o serviço de validação'
            })
        } finally {
            setValidating(false)
        }
    }

    const addSource = async () => {
        if (!validationResult?.success || validationResult.data?.validation_score === 0) {
            alert('Valide a fonte antes de adicionar!')
            return
        }

        setAddingSource(true)

        try {
            const res = await fetch(`${SCRAPER_API}/api/sources/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: newSourceUrl.trim(),
                    name: newSourceName.trim() || null
                })
            })

            const data = await res.json()

            if (data.success) {
                await fetchSources()
                setNewSourceUrl('')
                setNewSourceName('')
                setValidationResult(null)
                alert('Fonte adicionada com sucesso!')
            } else {
                alert(data.error || 'Erro ao adicionar fonte')
            }
        } catch (error) {
            console.error('Error adding source:', error)
            alert('Erro ao adicionar fonte')
        } finally {
            setAddingSource(false)
        }
    }

    const toggleSource = async (id) => {
        try {
            const res = await fetch(`${SCRAPER_API}/api/sources/${id}/toggle`, {
                method: 'PATCH'
            })

            if (res.ok) {
                await fetchSources()
            }
        } catch (error) {
            console.error('Error toggling source:', error)
        }
    }

    const deleteSource = async (id) => {
        if (!confirm('Tem certeza que deseja remover esta fonte?')) return

        try {
            const res = await fetch(`${SCRAPER_API}/api/sources/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                await fetchSources()
            }
        } catch (error) {
            console.error('Error deleting source:', error)
        }
    }

    const filteredSources = sources.filter(source =>
        source.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.url?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getScoreColor = (score) => {
        if (score >= 9) return 'text-emerald-600 bg-emerald-50 ring-emerald-200'
        if (score >= 7) return 'text-amber-600 bg-amber-50 ring-amber-200'
        return 'text-rose-600 bg-rose-50 ring-rose-200'
    }

    const getTypeIcon = (type) => {
        if (type === 'rss') return <Rss className="w-4 h-4" />
        return <Globe className="w-4 h-4" />
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gerenciar Fontes de Conteúdo</h1>
                <p className="text-slate-500 mt-1">Adicione e gerencie fontes RSS, blogs e redes sociais</p>
            </div>

            {/* Add New Source Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Adicionar Nova Fonte</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">URL da Fonte *</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="url"
                                value={newSourceUrl}
                                onChange={(e) => setNewSourceUrl(e.target.value)}
                                placeholder="https://example.com/feed"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">RSS, Blog, Reddit ou YouTube</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nome (opcional)</label>
                        <input
                            type="text"
                            value={newSourceName}
                            onChange={(e) => setNewSourceName(e.target.value)}
                            placeholder="Nome da fonte"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={validateSource}
                        disabled={validating || !newSourceUrl.trim()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                    >
                        {validating ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Validando...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Validar Fonte
                            </>
                        )}
                    </button>

                    {validationResult?.success && validationResult.data?.validation_score > 0 && (
                        <button
                            onClick={addSource}
                            disabled={addingSource}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                        >
                            {addingSource ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Adicionando...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar ao Sistema
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Validation Result */}
                {validationResult && (
                    <div className={`mt-4 p-4 rounded-xl border ${validationResult.success && validationResult.data?.validation_score > 0
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-rose-50 border-rose-200'
                        }`}>
                        <div className="flex items-start">
                            {validationResult.success && validationResult.data?.validation_score > 0 ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 mr-3 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <h3 className={`font-semibold text-sm ${validationResult.success && validationResult.data?.validation_score > 0
                                        ? 'text-emerald-900'
                                        : 'text-rose-900'
                                    }`}>
                                    {validationResult.success && validationResult.data?.validation_score > 0
                                        ? 'Fonte Validada com Sucesso!'
                                        : 'Erro na Validação'}
                                </h3>

                                {validationResult.success && validationResult.data ? (
                                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getScoreColor(validationResult.data.validation_score)
                                                }`}>
                                                Score: {validationResult.data.validation_score}/10
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                Tipo: {validationResult.data.source_type}
                                            </span>
                                            {validationResult.data.rss_found?.length > 0 && (
                                                <span className="inline-flex items-center text-xs text-emerald-600">
                                                    <Rss className="w-3 h-3 mr-1" />
                                                    RSS Encontrado
                                                </span>
                                            )}
                                        </div>

                                        {validationResult.data.sample_news?.length > 0 && (
                                            <div>
                                                <p className="font-medium text-xs text-slate-600 mb-1">Exemplos encontrados:</p>
                                                <ul className="text-xs space-y-1">
                                                    {validationResult.data.sample_news.slice(0, 2).map((news, i) => (
                                                        <li key={i} className="truncate">• {news.title}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm text-rose-700">{validationResult.error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sources List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Fontes Cadastradas</h2>
                            <p className="text-sm text-slate-500 mt-1">{filteredSources.length} fontes</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar fonte..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredSources.map((source) => (
                        <div key={source.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="font-semibold text-slate-900 truncate">{source.name || 'Sem nome'}</h3>
                                        {source.type && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {getTypeIcon(source.type)}
                                                <span className="ml-1">{source.type.toUpperCase()}</span>
                                            </span>
                                        )}
                                        {source.validation_score !== null && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${getScoreColor(source.validation_score)
                                                }`}>
                                                {source.validation_score}/10
                                            </span>
                                        )}
                                    </div>

                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-600 hover:text-primary-600 flex items-center truncate group"
                                    >
                                        <span className="truncate">{source.url}</span>
                                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    </a>

                                    <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                                        <span>Criado: {new Date(source.created_at).toLocaleDateString('pt-BR')}</span>
                                        {source.validated_at && (
                                            <span>Validado: {new Date(source.validated_at).toLocaleDateString('pt-BR')}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => toggleSource(source.id)}
                                        className={`p-2 rounded-lg transition-colors ${source.active
                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                        title={source.active ? 'Desativar' : 'Ativar'}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => deleteSource(source.id)}
                                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                        title="Remover"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredSources.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <Rss className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Nenhuma fonte encontrada</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
