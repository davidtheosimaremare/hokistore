'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name?: string
  role: 'super_admin' | 'admin' | 'editor'
  status: 'active' | 'inactive'
  last_sign_in_at?: string
  created_at: string
  avatar_url?: string
}

const userSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(1, 'Nama harus diisi'),
  role: z.enum(['super_admin', 'admin', 'editor']),
  status: z.enum(['active', 'inactive'])
})

type UserForm = z.infer<typeof userSchema>

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor'
}

const roleColors = {
  super_admin: 'danger',
  admin: 'primary',
  editor: 'secondary'
} as const

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema)
  })

  useEffect(() => {
    loadUsers()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setCurrentUser(profile)
      }
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select('*')

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      // Apply role filter
      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        toast.error('Error loading users')
        console.error('Error:', error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      toast.error('Error loading users')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingUser(null)
    reset()
    onOpen()
  }

  const openEditModal = (user: User) => {
    setIsEditMode(true)
    setEditingUser(user)
    setValue('email', user.email)
    setValue('name', user.name || '')
    setValue('role', user.role)
    setValue('status', user.status)
    onOpen()
  }

  const onSubmit = async (data: UserForm) => {
    try {
      if (isEditMode && editingUser) {
        // Update user
        const { error } = await supabase
          .from('users')
          .update({
            name: data.name,
            role: data.role,
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id)

        if (error) {
          toast.error('Error updating user')
          return
        }

        toast.success('User updated successfully')
      } else {
        // For creating users, we would typically invite them via Supabase Auth
        // This is a simplified version - in production you'd use Supabase's invite functionality
        const { error } = await supabase
          .from('users')
          .insert([{
            email: data.email,
            name: data.name,
            role: data.role,
            status: data.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) {
          toast.error('Error creating user')
          return
        }

        toast.success('User invitation sent successfully')
      }

      onClose()
      loadUsers()
    } catch (error) {
      toast.error('Error saving user')
      console.error('Save error:', error)
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      
      const { error } = await supabase
        .from('users')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        toast.error('Error updating user status')
        return
      }

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      loadUsers()
    } catch (error) {
      toast.error('Error updating user status')
      console.error('Status update error:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (currentUser?.id === userId) {
      toast.error('Cannot delete your own account')
      return
    }

    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        toast.error('Error deleting user')
        return
      }

      toast.success('User deleted successfully')
      loadUsers()
    } catch (error) {
      toast.error('Error deleting user')
      console.error('Delete error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'warning'
  }

  const formatLastSignIn = (dateString?: string) => {
    if (!dateString) return 'Belum pernah login'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canEditUser = (user: User) => {
    if (!currentUser) return false
    
    // Super admin can edit anyone except themselves for role changes
    if (currentUser.role === 'super_admin') {
      return true
    }
    
    // Admin can only edit editors
    if (currentUser.role === 'admin') {
      return user.role === 'editor'
    }
    
    return false
  }

  const canDeleteUser = (user: User) => {
    if (!currentUser) return false
    
    // Cannot delete yourself
    if (currentUser.id === user.id) return false
    
    // Super admin can delete admin and editor
    if (currentUser.role === 'super_admin') {
      return user.role !== 'super_admin'
    }
    
    // Admin can only delete editors
    if (currentUser.role === 'admin') {
      return user.role === 'editor'
    }
    
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Pengguna</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola pengguna dan akses role
              </p>
            </div>
            {currentUser?.role === 'super_admin' && (
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onClick={openCreateModal}
              >
                Undang Pengguna
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Cari pengguna..."
              startContent={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select
              placeholder="Semua Role"
              selectedKeys={selectedRole ? [selectedRole] : []}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as string
                setSelectedRole(key || 'all')
              }}
              className="sm:max-w-xs"
            >
              <SelectItem key="all">Semua Role</SelectItem>
              <SelectItem key="super_admin">Super Admin</SelectItem>
              <SelectItem key="admin">Admin</SelectItem>
              <SelectItem key="editor">Editor</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-md">
        <CardBody>
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>PENGGUNA</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>TERAKHIR LOGIN</TableColumn>
              <TableColumn>AKSI</TableColumn>
            </TableHeader>
            <TableBody
              items={users}
              isLoading={loading}
              loadingContent="Loading users..."
              emptyContent="Tidak ada pengguna ditemukan"
            >
              {(user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.avatar_url}
                        name={user.name || user.email}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={roleColors[user.role]}
                      startContent={<Shield className="w-3 h-3" />}
                    >
                      {roleLabels[user.role]}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={getStatusColor(user.status)}>
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatLastSignIn(user.last_sign_in_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit className="w-4 h-4" />}
                          onClick={() => openEditModal(user)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="toggle-status"
                          startContent={
                            user.status === 'active' ? 
                              <UserX className="w-4 h-4" /> : 
                              <UserCheck className="w-4 h-4" />
                          }
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </DropdownItem>
                        <DropdownItem
                          key="send-email"
                          startContent={<Mail className="w-4 h-4" />}
                        >
                          Kirim Email
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDelete(user.id)}
                        >
                          Hapus
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* User Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {isEditMode ? 'Edit Pengguna' : 'Undang Pengguna Baru'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  {...register('email')}
                  type="email"
                  label="Email"
                  placeholder="user@example.com"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                  isDisabled={isEditMode}
                />
                <Input
                  {...register('name')}
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
                <Select
                  {...register('role')}
                  label="Role"
                  placeholder="Pilih role"
                  isInvalid={!!errors.role}
                  errorMessage={errors.role?.message}
                >
                  <SelectItem key="super_admin">Super Admin</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                  <SelectItem key="editor">Editor</SelectItem>
                </Select>
                <Select
                  {...register('status')}
                  label="Status"
                  placeholder="Pilih status"
                  isInvalid={!!errors.status}
                  errorMessage={errors.status?.message}
                >
                  <SelectItem key="active">Aktif</SelectItem>
                  <SelectItem key="inactive">Nonaktif</SelectItem>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button color="primary" type="submit">
                {isEditMode ? 'Update' : 'Kirim Undangan'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  )
} 