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
import { useAuth } from '@/features/auth/hooks/useAuth'

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
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout className="cms-shell">
      <Sider
        width={240}
        collapsedWidth={72}
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
      >
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
                <Avatar size="small">{user?.fullName.charAt(0) ?? 'A'}</Avatar>
                <Typography.Text>{user?.fullName ?? 'Admin'}</Typography.Text>
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
