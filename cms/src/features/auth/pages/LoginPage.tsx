import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Form, Input, Typography } from 'antd'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getApiErrorMessage } from '@/shared/api/errors'

type LoginFormValues = {
  identifier: string
  password: string
}

const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export function LoginPage() {
  const { message } = AntApp.useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, login } = useAuth()
  const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard'

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (values: LoginFormValues) => {
    const result = loginSchema.safeParse(values)

    if (!result.success) {
      message.error(result.error.issues[0]?.message ?? 'Thông tin đăng nhập không hợp lệ')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await login(result.data)
      message.success(response.message)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Đăng nhập thất bại'))
    } finally {
      setIsSubmitting(false)
    }
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
          initialValues={{
            identifier: 'admin@traintickets.local',
            password: 'Admin-sSjRqGa9JH-6#1',
          }}
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Email hoặc số điện thoại"
            name="identifier"
            rules={[{ required: true, message: 'Vui lòng nhập email hoặc số điện thoại' }]}
          >
            <Input prefix={<MailOutlined />} autoComplete="username" size="large" />
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

          <Button type="primary" htmlType="submit" size="large" loading={isSubmitting} block>
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </main>
  )
}
