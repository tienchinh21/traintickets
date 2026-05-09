import {
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

const { Header, Content, Sider } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: 'Người dùng',
  },
]

export function CmsLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout className="cms-shell">
      <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg">
        <div className="cms-brand">
          <div className="cms-brand-mark">T</div>
          {!collapsed && <span>TrainTickets</span>}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header className="cms-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />

          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Đăng xuất',
                  onClick: handleLogout,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" className="account-button">
              <Space>
                <Avatar size="small">{user?.name.charAt(0) ?? 'A'}</Avatar>
                <Typography.Text>{user?.name ?? 'Admin'}</Typography.Text>
              </Space>
            </Button>
          </Dropdown>
        </Header>

        <Content className="cms-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
