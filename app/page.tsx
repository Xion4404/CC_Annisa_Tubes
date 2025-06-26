"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit2, Trash2, Check, X, Calendar, Clock, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  dueDate: string
  createdAt: string
}

interface ApiResponse {
  status: "success" | "error"
  message: string
  data?: Todo[] | Todo
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [baseUrl, setBaseUrl] = useState<string>("")
  const [showBaseUrlModal, setShowBaseUrlModal] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [tempBaseUrl, setTempBaseUrl] = useState("")

  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    dueDate: "",
  })

  const { toast } = useToast()

  // Load base URL from localStorage on mount
  useEffect(() => {
    const savedBaseUrl = localStorage.getItem("todoBaseUrl")
    if (savedBaseUrl) {
      setBaseUrl(savedBaseUrl)
      setShowBaseUrlModal(false)
      fetchTodos(savedBaseUrl)
    }
  }, [])

  const saveBaseUrl = () => {
    if (!tempBaseUrl.trim()) {
      toast({
        title: "Error",
        description: "Base URL tidak boleh kosong",
        variant: "destructive",
      })
      return
    }

    const cleanUrl = tempBaseUrl.replace(/\/+$/, "") // Remove trailing slashes
    setBaseUrl(cleanUrl)
    localStorage.setItem("todoBaseUrl", cleanUrl)
    setShowBaseUrlModal(false)
    fetchTodos(cleanUrl)
  }

  const fetchTodos = async (url: string = baseUrl) => {
    if (!url) return

    setLoading(true)
    try {
      const response = await fetch(`${url}/api/todos`)
      const result: ApiResponse = await response.json()

      if (result.status === "success" && Array.isArray(result.data)) {
        setTodos(result.data)
      } else {
        throw new Error(result.message || "Failed to fetch todos")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal mengambil data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodo.title.trim()) {
      toast({
        title: "Error",
        description: "Judul todo tidak boleh kosong",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const todoData = {
        title: newTodo.title,
        description: newTodo.description,
        completed: false,
        dueDate: newTodo.dueDate || new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      }

      const response = await fetch(`${baseUrl}/api/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      })

      const result: ApiResponse = await response.json()

      if (result.status === "success") {
        await fetchTodos()
        setNewTodo({ title: "", description: "", dueDate: "" })
        setShowAddModal(false)
        toast({
          title: "Berhasil",
          description: "Todo berhasil ditambahkan",
        })
      } else {
        throw new Error(result.message || "Failed to add todo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal menambah todo: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTodo = async () => {
    if (!editingTodo) return

    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/todos/${editingTodo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingTodo),
      })

      const result: ApiResponse = await response.json()

      if (result.status === "success") {
        await fetchTodos()
        setEditingTodo(null)
        setShowEditModal(false)
        toast({
          title: "Berhasil",
          description: "Todo berhasil diperbarui",
        })
      } else {
        throw new Error(result.message || "Failed to update todo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal memperbarui todo: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteTodo = async (id: number) => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/todos/${id}`, {
        method: "DELETE",
      })

      const result: ApiResponse = await response.json()

      if (result.status === "success") {
        await fetchTodos()
        toast({
          title: "Berhasil",
          description: "Todo berhasil dihapus",
        })
      } else {
        throw new Error(result.message || "Failed to delete todo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal menghapus todo: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async (todo: Todo) => {
    const updatedTodo = { ...todo, completed: !todo.completed }

    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      })

      const result: ApiResponse = await response.json()

      if (result.status === "success") {
        await fetchTodos()
        toast({
          title: "Berhasil",
          description: `Todo ${updatedTodo.completed ? "diselesaikan" : "dibatalkan"}`,
        })
      } else {
        throw new Error(result.message || "Failed to toggle todo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal mengubah status: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tugas Besar Komputasi Awan 2025</h1>
              <p className="text-slate-600 mt-1">Aplikasi Todo List - Frontend untuk Backend API</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">{todos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{todos.filter((t) => t.completed).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{todos.filter((t) => !t.completed).length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <X className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Todo Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2" disabled={loading}>
            <Plus className="w-4 h-4" />
            Tambah Todo Baru
          </Button>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">Semua ({todos.length})</TabsTrigger>
            <TabsTrigger value="active">Aktif ({todos.filter((t) => !t.completed).length})</TabsTrigger>
            <TabsTrigger value="completed">Selesai ({todos.filter((t) => t.completed).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Todo List */}
        <div className="space-y-4">
          {loading && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                  <span className="ml-2">Loading...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && filteredTodos.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 mb-4">
                  <Clock className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Tidak ada todo</h3>
                <p className="text-slate-600">
                  {filter === "all"
                    ? "Belum ada todo yang dibuat"
                    : filter === "active"
                      ? "Tidak ada todo yang aktif"
                      : "Tidak ada todo yang selesai"}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading &&
            filteredTodos.map((todo) => (
              <Card key={todo.id} className={`transition-all hover:shadow-md ${todo.completed ? "opacity-75" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComplete(todo)}
                          className={`p-1 rounded-full ${todo.completed ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <h3
                          className={`text-lg font-semibold ${todo.completed ? "line-through text-slate-500" : "text-slate-900"}`}
                        >
                          {todo.title}
                        </h3>
                        {isOverdue(todo.dueDate, todo.completed) && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                        {todo.completed && (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>

                      {todo.description && (
                        <p className={`text-sm mb-3 ${todo.completed ? "text-slate-400" : "text-slate-600"}`}>
                          {todo.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {formatDate(todo.dueDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {formatDate(todo.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTodo(todo)
                          setShowEditModal(true)
                        }}
                        className="text-slate-600 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-slate-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>

      {/* Base URL Modal */}
      <Dialog open={showBaseUrlModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfigurasi Base URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="baseUrl">Base URL Backend API</Label>
              <Input
                id="baseUrl"
                placeholder="https://your-backend-url.com"
                value={tempBaseUrl}
                onChange={(e) => setTempBaseUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Masukkan URL backend API Anda (tanpa /api di akhir)</p>
            </div>
            <Button onClick={saveBaseUrl} className="w-full">
              Simpan & Lanjutkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pengaturan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentBaseUrl">Base URL Saat Ini</Label>
              <Input id="currentBaseUrl" value={baseUrl} readOnly className="mt-1 bg-slate-50" />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setTempBaseUrl(baseUrl)
                setShowSettingsModal(false)
                setShowBaseUrlModal(true)
              }}
              className="w-full"
            >
              Ubah Base URL
            </Button>
            <Button variant="outline" onClick={() => fetchTodos()} className="w-full">
              Refresh Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Todo Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Todo Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                placeholder="Masukkan judul todo"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Masukkan deskripsi (opsional)"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Tanggal Deadline</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addTodo} disabled={loading} className="flex-1">
                {loading ? "Menambah..." : "Tambah Todo"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Todo Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          {editingTodo && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">Judul *</Label>
                <Input
                  id="editTitle"
                  placeholder="Masukkan judul todo"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Deskripsi</Label>
                <Textarea
                  id="editDescription"
                  placeholder="Masukkan deskripsi (opsional)"
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="editDueDate">Tanggal Deadline</Label>
                <Input
                  id="editDueDate"
                  type="date"
                  value={editingTodo.dueDate}
                  onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateTodo} disabled={loading} className="flex-1">
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
