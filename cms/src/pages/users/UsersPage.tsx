import { EditOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Tag } from 'antd'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

type CmsUser = Record<string, unknown> & {
  id: string
  name: string
  email: string
  role: 'admin' | 'operator' | 'support'
  status: 'active' | 'inactive'
}

const users: CmsUser[] = [
  {
    id: '1',
    name: 'CMS Admin',
    email: 'admin@traintickets.local',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Nhân viên vận hành',
    email: 'operator@traintickets.local',
    role: 'operator',
    status: 'active',
  },
  {
    id: '3',
    name: 'Hỗ trợ khách hàng',
    email: 'support@traintickets.local',
    role: 'support',
    status: 'inactive',
  },
]

const fetchUsers = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 250))
  return users
}

const columns: ProColumns<CmsUser>[] = [
  {
    title: 'Tên',
    dataIndex: 'name',
    width: 180,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: 240,
  },
  {
    title: 'Vai trò',
    dataIndex: 'role',
    width: 140,
    render: (_, record) => {
      const labelByRole = {
        admin: 'Quản trị',
        operator: 'Vận hành',
        support: 'Hỗ trợ',
      }

      return (
        <Tag color={record.role === 'admin' ? 'cyan' : 'default'}>
          {labelByRole[record.role]}
        </Tag>
      )
    },
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (_, record) => (
      <Tag color={record.status === 'active' ? 'green' : 'red'}>
        {record.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
      </Tag>
    ),
  },
]

export function UsersPage() {
  const { message } = AntApp.useApp()
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const actionColumn = createActionColumn<CmsUser>((record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa người dùng',
      onClick: () => message.info(`Sửa ${record.name}`),
    },
    {
      key: 'lock',
      icon: <LockOutlined />,
      tooltip: 'Khóa người dùng',
      danger: true,
      onClick: () => message.warning(`Khóa ${record.name}`),
    },
  ])

  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Quản lý tài khoản nội bộ và phân quyền truy cập CMS."
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm người dùng
          </Button>
        }
      />

      <Card>
        <CoreTable<CmsUser>
          columns={[...columns, actionColumn]}
          dataSource={data ?? []}
          loading={isLoading}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>
    </>
  )
}
