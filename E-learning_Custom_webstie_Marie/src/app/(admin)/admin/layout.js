'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/Components/Admin/Common/AdminSidebar';
import AdminHeader from '@/Components/Admin/Common/AdminHeader';
import { ToastProvider } from '@/Components/Admin/hooks/useToast';
import { ConfirmProvider } from '@/Components/Admin/hooks/useConfirm';
 


export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (

    <ToastProvider>
      <ConfirmProvider>
        <div className="flex min-h-screen bg-gray-100">
          <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="flex-1 min-w-0 flex flex-col">
            <AdminHeader isOpen={isOpen} setIsOpen={setIsOpen} />
            <main className="flex-1 p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}