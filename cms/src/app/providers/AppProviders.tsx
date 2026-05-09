import { QueryClientProvider } from '@tanstack/react-query'
import { ProConfigProvider, viVNIntl } from '@ant-design/pro-components'
import { App as AntApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/providers/AuthProvider'
import { queryClient } from '@/shared/api/queryClient'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#0f766e',
          colorInfo: '#0f766e',
          colorSuccess: '#16a34a',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          colorText: '#1f2933',
          colorTextSecondary: '#667085',
          colorBorder: '#d9e2ec',
          colorBgLayout: '#f3f1ea',
          colorBgContainer: '#fffdf7',
          borderRadius: 8,
          boxShadowSecondary: '0 16px 40px rgba(47, 43, 34, 0.08)',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Layout: {
            bodyBg: '#f3f1ea',
            headerBg: '#fffdf7',
            siderBg: '#1f2926',
          },
          Menu: {
            darkItemBg: '#1f2926',
            darkSubMenuItemBg: '#1f2926',
            darkItemSelectedBg: '#0f766e',
            darkItemColor: 'rgba(255, 253, 247, 0.72)',
            darkItemHoverColor: '#fffdf7',
            darkItemSelectedColor: '#fffdf7',
          },
          Table: {
            headerBg: '#f7f2e8',
            headerColor: '#374151',
            rowHoverBg: '#f9f6ef',
          },
          Card: {
            colorBgContainer: '#fffdf7',
          },
        },
      }}
    >
      <AntApp>
        <ProConfigProvider intl={viVNIntl}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        </ProConfigProvider>
      </AntApp>
    </ConfigProvider>
  )
}
