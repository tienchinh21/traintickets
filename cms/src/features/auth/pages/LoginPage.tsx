import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Form, Input, Typography } from 'antd'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuthStore } from '@/features/auth/store/authStore'

type LoginFormValues = {
  email: string
  password: string
}

const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export function LoginPage() {
  const { message } = AntApp.useApp()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = (values: LoginFormValues) => {
    const result = loginSchema.safeParse(values)

    if (!result.success) {
      message.error(result.error.issues[0]?.message ?? 'Thông tin đăng nhập không hợp lệ')
      return
    }

    login(result.data.email)
    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="login-page">
      <Card className="login-card" variant="borderless">
        <Typography.Title level={2}>TrainTickets CMS</Typography.Title>
        <Typography.Paragraph type="secondary">
          Quản trị vé tàu, người dùng và vận hành hệ thống.
        </Typography.Paragraph>

        <Form<LoginFormValues>
          layout="vertical"
          initialValues={{ email: 'admin@traintickets.local', password: '123456' }}
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }]}
          >
            <Input prefix={<MailOutlined />} autoComplete="email" size="large" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              autoComplete="current-password"
              size="large"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block>
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </main>
  )
}
