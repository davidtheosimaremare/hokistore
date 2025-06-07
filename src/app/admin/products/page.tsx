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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Selection
} from '@nextui-org/react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Package
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

interface Product {
  id: string
  accurate_id?: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  brand: string
  sku: string
  image_url?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  description: z.string().optional(),
  price: z.number().min(0, 'Harga harus lebih dari 0'),
  stock: z.number().min(0, 'Stok tidak boleh negatif'),
  category: z.string().min(1, 'Kategori harus dipilih'),
  brand: z.string().min(1, 'Brand harus diisi'),
  sku: z.string().min(1, 'SKU harus diisi'),
  status: z.enum(['active', 'inactive'])
})

type ProductForm = z.infer<typeof productSchema>

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<Selection>(new Set([]))
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema)
  })

  const categories = ['Semua', 'Circuit Breaker', 'Contactor', 'Relay', 'Switch', 'Motor']
  const pageSize = 10

  useEffect(() => {
    loadProducts()
  }, [page, searchTerm, selectedCategory])

  const loadProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        toast.error('Error loading products')
        console.error('Error:', error)
        return
      }

      setProducts(data || [])
      setTotalPages(Math.ceil((count || 0) / pageSize))
    } catch (error) {
      toast.error('Error loading products')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/sync-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncSiemens: true,
          limit: 50,
          upsertMode: true
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Berhasil sinkronisasi ${result.data.syncedProducts} produk`)
        loadProducts()
      } else {
        toast.error(result.message || 'Gagal sinkronisasi produk')
      }
    } catch (error) {
      toast.error('Error syncing products')
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingProduct(null)
    reset()
    onOpen()
  }

  const openEditModal = (product: Product) => {
    setIsEditMode(true)
    setEditingProduct(product)
    setValue('name', product.name)
    setValue('description', product.description)
    setValue('price', product.price)
    setValue('stock', product.stock)
    setValue('category', product.category)
    setValue('brand', product.brand)
    setValue('sku', product.sku)
    setValue('status', product.status)
    onOpen()
  }

  const onSubmit = async (data: ProductForm) => {
    try {
      if (isEditMode && editingProduct) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id)

        if (error) {
          toast.error('Error updating product')
          return
        }

        toast.success('Product updated successfully')
      } else {
        // Create product
        const { error } = await supabase
          .from('products')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) {
          toast.error('Error creating product')
          return
        }

        toast.success('Product created successfully')
      }

      onClose()
      loadProducts()
    } catch (error) {
      toast.error('Error saving product')
      console.error('Save error:', error)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        toast.error('Error deleting product')
        return
      }

      toast.success('Product deleted successfully')
      loadProducts()
    } catch (error) {
      toast.error('Error deleting product')
      console.error('Delete error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'warning'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Produk</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola produk dan sinkronisasi dengan Accurate API
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                color="secondary"
                variant="bordered"
                startContent={<RefreshCw className="w-4 h-4" />}
                onClick={handleSync}
                isLoading={isSyncing}
              >
                Sinkron Accurate
              </Button>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onClick={openCreateModal}
              >
                Tambah Produk
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Cari produk..."
              startContent={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-xs"
            />
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" startContent={<Filter className="w-4 h-4" />}>
                  {selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedCategory]}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  setSelectedCategory(key)
                }}
              >
                <DropdownItem key="all">Semua Kategori</DropdownItem>
                <DropdownItem key="Circuit Breaker">Circuit Breaker</DropdownItem>
                <DropdownItem key="Contactor">Contactor</DropdownItem>
                <DropdownItem key="Relay">Relay</DropdownItem>
                <DropdownItem key="Switch">Switch</DropdownItem>
                <DropdownItem key="Motor">Motor</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <div className="flex gap-2 ml-auto">
              <Button variant="bordered" startContent={<Download className="w-4 h-4" />}>
                Export
              </Button>
              <Button variant="bordered" startContent={<Upload className="w-4 h-4" />}>
                Import
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-md">
        <CardBody>
          <Table 
            aria-label="Products table"
            selectionMode="multiple"
            selectedKeys={selectedProducts}
            onSelectionChange={setSelectedProducts}
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>PRODUK</TableColumn>
              <TableColumn>SKU</TableColumn>
              <TableColumn>KATEGORI</TableColumn>
              <TableColumn>HARGA</TableColumn>
              <TableColumn>STOK</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>AKSI</TableColumn>
            </TableHeader>
            <TableBody
              items={products}
              isLoading={loading}
              loadingContent="Loading products..."
              emptyContent="Tidak ada produk ditemukan"
            >
              {(product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <Chip size="sm" color={product.stock > 0 ? 'success' : 'danger'}>
                      {product.stock}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={getStatusColor(product.status)}>
                      {product.status}
                    </Chip>
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
                          key="view"
                          startContent={<Eye className="w-4 h-4" />}
                        >
                          Lihat Detail
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit className="w-4 h-4" />}
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDelete(product.id)}
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

      {/* Product Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('name')}
                  label="Nama Produk"
                  placeholder="Masukkan nama produk"
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
                <Input
                  {...register('sku')}
                  label="SKU"
                  placeholder="Masukkan SKU"
                  isInvalid={!!errors.sku}
                  errorMessage={errors.sku?.message}
                />
                <Input
                  {...register('brand')}
                  label="Brand"
                  placeholder="Masukkan brand"
                  isInvalid={!!errors.brand}
                  errorMessage={errors.brand?.message}
                />
                <Input
                  {...register('category')}
                  label="Kategori"
                  placeholder="Masukkan kategori"
                  isInvalid={!!errors.category}
                  errorMessage={errors.category?.message}
                />
                <Input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  label="Harga"
                  placeholder="0"
                  startContent="Rp"
                  isInvalid={!!errors.price}
                  errorMessage={errors.price?.message}
                />
                <Input
                  {...register('stock', { valueAsNumber: true })}
                  type="number"
                  label="Stok"
                  placeholder="0"
                  isInvalid={!!errors.stock}
                  errorMessage={errors.stock?.message}
                />
              </div>
              <Input
                {...register('description')}
                label="Deskripsi"
                placeholder="Masukkan deskripsi produk"
                isInvalid={!!errors.description}
                errorMessage={errors.description?.message}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button color="primary" type="submit">
                {isEditMode ? 'Update' : 'Simpan'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  )
} 