'use client'

import { Card, CardBody, CardHeader } from '@nextui-org/react'
import { Settings } from 'lucide-react'

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-2xl font-bold">Pengaturan Sistem</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Konfigurasi dan pengaturan aplikasi
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-md">
        <CardBody className="flex items-center justify-center py-20">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Fitur Dalam Pengembangan
            </h3>
            <p className="text-gray-500">
              Halaman pengaturan akan segera hadir
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 