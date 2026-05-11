import { EditOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Form, Input, Modal, Select, Space, Tag } from 'antd'
import { useState } from 'react'
import { accessControlApi } from '@/features/access-control/api/accessControlApi'
import { usersApi } from '@/features/users/api/usersApi'
import type { UpdateUserPayload, User, UserFormValues, UserStatus, UserType } from '@/features/users/types/user.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

type UserFormModel = Omit<UserFormValues, 'password'> & {
  password?: string
}

const userTypeOptions: Array<{ label: string; value: UserType }> = [
  { label: 'Khách hàng', value: 'CUSTOMER' },
  { label: 'Nhân sự', value: 'STAFF' },
  { label: 'Hệ thống', value: 'SYSTEM' },
]

const userStatusOptions: Array<{ label: string; value: UserStatus }> = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
  { label: 'Đã khóa', value: 'LOCKED' },
]

const userTypeMeta: Record<UserType, { color: string; label: string }> = {
  CUSTOMER: { color: 'blue', label: 'Khách hàng' },
  STAFF: { color: 'cyan', label: 'Nhân sự' },
  SYSTEM: { color: 'purple', label: 'Hệ thống' },
}

const userStatusMeta: Record<UserStatus, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: 'Đang hoạt động' },
  INACTIVE: { color: 'red', label: 'Tạm khóa' },
  LOCKED: { color: 'gold', label: 'Đã khóa' },
}

const columns: ProColumns<User>[] = [
  {
    title: 'Họ tên',
    dataIndex: 'fullName',
    width: 220,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: 240,
    render: (_, record) => record.email || '-',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phone',
    width: 160,
    render: (_, record) => record.phone || '-',
  },
  {
    title: 'Loại người dùng',
    dataIndex: 'userType',
    width: 150,
    render: (_, record) => {
      const meta = userTypeMeta[record.userType]
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
  {
    title: 'Vai trò',
    dataIndex: 'roles',
    width: 260,
    render: (_, record) => (
      <Space size={[0, 4]} wrap>
        {record.roles.length
          ? record.roles.map((userRole) => <Tag key={userRole.roleId}>{userRole.role.name}</Tag>)
          : '-'}
      </Space>
    ),
  },
  {
    title: 'Đăng nhập gần nhất',
    dataIndex: 'lastLoginAt',
    width: 190,
    render: (_, record) => record.lastLoginAt ? new Date(record.lastLoginAt).toLocaleString('vi-VN') : '-',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (_, record) => {
      const meta = userStatusMeta[record.status]
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
]

function sanitizeUserPayload(values: UserFormModel, isEditing: boolean) {
  const payload: UpdateUserPayload = {
    ...values,
    email: values.email?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    fullName: values.fullName?.trim(),
    password: values.password?.trim() || undefined,
  }

  if (!isEditing) {
    return payload as UserFormValues
  }

  return payload
}

export function UsersPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<UserFormModel>()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersApi.getUsers()).data,
  })

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await accessControlApi.getRoles()).data,
  })

  const roleOptions = (rolesQuery.data ?? [])
    .filter((role) => role.status === 'ACTIVE')
    .map((role) => ({
      label: `${role.code} - ${role.name}`,
      value: Number(role.id),
    }))

  const saveUserMutation = useMutation({
    mutationFn: async (values: UserFormModel) => {
      if (editingUser) {
        return usersApi.updateUser(editingUser.id, sanitizeUserPayload(values, true))
      }

      return usersApi.createUser(sanitizeUserPayload(values, false) as UserFormValues)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingUser(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu người dùng thất bại')),
  })

  const lockUserMutation = useMutation({
    mutationFn: (user: User) => usersApi.updateUser(user.id, { status: 'LOCKED' }),
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Khóa người dùng thất bại')),
  })

  const openCreateForm = () => {
    setEditingUser(null)
    form.setFieldsValue({
      userType: 'STAFF',
      status: 'ACTIVE',
      roleIds: [],
    })
    setIsFormOpen(true)
  }

  const openEditForm = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      fullName: user.fullName,
      userType: user.userType,
      status: user.status,
      roleIds: user.roles.map((userRole) => Number(userRole.roleId)),
      password: undefined,
    })
    setIsFormOpen(true)
  }

  const confirmLock = (user: User) => {
    modal.confirm({
      title: 'Khóa người dùng?',
      content: `Tài khoản ${user.fullName} sẽ không thể đăng nhập cho tới khi được mở lại.`,
      okText: 'Khóa tài khoản',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => lockUserMutation.mutateAsync(user),
    })
  }

  const actionColumn = createActionColumn<User>((record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa người dùng',
      onClick: () => openEditForm(record),
    },
    {
      key: 'lock',
      icon: <LockOutlined />,
      tooltip: 'Khóa người dùng',
      danger: true,
      disabled: record.status === 'LOCKED',
      onClick: () => confirmLock(record),
    },
  ], 136)

  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Quản lý tài khoản nội bộ, khách hàng và vai trò truy cập CMS."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm người dùng
          </Button>
        }
      />

      <Card>
        <CoreTable<User>
          columns={[...columns, actionColumn]}
          dataSource={usersQuery.data ?? []}
          loading={usersQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
        open={isFormOpen}
        okText={editingUser ? 'Lưu thay đổi' : 'Tạo người dùng'}
        cancelText="Hủy"
        confirmLoading={saveUserMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingUser(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<UserFormModel>
          form={form}
          layout="vertical"
          onFinish={(values) => saveUserMutation.mutate(values)}
        >
          <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="0901234567" />
          </Form.Item>
          <Form.Item
            label={editingUser ? 'Mật khẩu mới' : 'Mật khẩu'}
            name="password"
            rules={[
              {
                required: !editingUser,
                message: 'Vui lòng nhập mật khẩu',
              },
              {
                min: 8,
                message: 'Mật khẩu tối thiểu 8 ký tự',
              },
            ]}
          >
            <Input.Password placeholder={editingUser ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu'} />
          </Form.Item>
          <Form.Item label="Loại người dùng" name="userType" rules={[{ required: true, message: 'Vui lòng chọn loại người dùng' }]}>
            <Select options={userTypeOptions} />
          </Form.Item>
          <Form.Item label="Vai trò" name="roleIds">
            <Select
              mode="multiple"
              loading={rolesQuery.isLoading}
              options={roleOptions}
              placeholder="Chọn vai trò"
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={userStatusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
