import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, MessageSquare, Bell, Menu, X, LogOut, Settings, Database } from 'lucide-react'

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const location = useLocation()

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Visão Geral' },
        { path: '/users', icon: Users, label: 'Usuários' },
        { path: '/conversations', icon: MessageSquare, label: 'Conversas' },
        { path: '/alerts', icon: Bell, label: 'Alertas' },
        { path: '/sources', icon: Database, label: 'Fontes' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-lg lg:shadow-none transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-100">
                        <img
                            src="https://i.imgur.com/Diz9NMI.jpeg"
                            alt="NutrIA Logo"
                            className="h-8 w-8 rounded-full mr-3 ring-2 ring-primary-100"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                            NutrIA
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map(({ path, icon: Icon, label }) => (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                  flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(path)
                                        ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive(path) ? 'text-primary-600' : 'text-slate-400'}`} />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile / Footer */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                AD
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">Admin</p>
                                <p className="text-xs text-slate-500 truncate">admin@nutria.com</p>
                            </div>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm transition-all">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center ml-auto space-x-4">
                        <button className="p-2 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
