import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Result
      status="404"
      title="Không tìm thấy trang"
      subTitle="Đường dẫn không tồn tại hoặc bạn không có quyền truy cập."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Về dashboard
        </Button>
      }
    />
  )
}
