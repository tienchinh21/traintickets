import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Descriptions, Drawer, Form, Input, Modal, Result, Select, Space, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { accessControlApi } from '@/features/access-control/api/accessControlApi'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usersApi } from '@/features/users/api/usersApi'
import type {
  UpdateUserPayload,
  User,
  UserFormValues,
  UserListQuery,
  UserStatus,
  UserType,
} from '@/features/users/types/user.types'
import { getApiError } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { useUrlQuery } from '@/shared/hooks/useUrlQuery'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

type UserFormModel = Omit<UserFormValues, 'password'> & {
  password?: string
}

const defaultUserQuery: UserListQuery = {
  page: 1,
  limit: 20,
  search: undefined,
  userType: undefined,
  status: undefined,
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

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString('vi-VN') : '-'
}

function sanitizeUserPayload(values: UserFormModel, isEditing: boolean) {
  const payload: UpdateUserPayload = {
    email: values.email?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    fullName: values.fullName?.trim(),
    password: values.password?.trim() || undefined,
    userType: values.userType,
    status: values.status,
    roleIds: values.roleIds,
  }

  if (!isEditing) {
    return payload as UserFormValues
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as UpdateUserPayload
}

export function UsersPage() {
  const { message, modal, notification } = AntApp.useApp()
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<UserFormModel>()
  const [filterForm] = Form.useForm<Pick<UserListQuery, 'search' | 'userType' | 'status'>>()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { query, setQuery, resetQuery } = useUrlQuery<UserListQuery>({ defaults: defaultUserQuery })

  const canRead = hasPermission('USERS_READ')
  const canCreate = hasPermission('USERS_CREATE')
  const canUpdate = hasPermission('USERS_UPDATE')
  const canDelete = hasPermission('USERS_DELETE')

  const usersQuery = useQuery({
    queryKey: ['users', query],
    enabled: canRead,
    queryFn: async () => usersApi.getUsers(query),
  })

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    enabled: canCreate || canUpdate,
    queryFn: async () => (await accessControlApi.getRoles()).data,
  })

  const roleOptions = (rolesQuery.data ?? [])
    .filter((role) => role.status === 'ACTIVE')
    .map((role) => ({
      label: `${role.code} - ${role.name}`,
      value: Number(role.id),
    }))

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
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (_, record) => {
        const meta = userStatusMeta[record.status]
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      width: 260,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.roles.length ? record.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>) : '-'}
        </Space>
      ),
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'lastLoginAt',
      width: 190,
      render: (_, record) => formatDate(record.lastLoginAt),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 190,
      render: (_, record) => formatDate(record.createdAt),
    },
  ]

  const showApiError = (error: unknown, fallback: string) => {
    const apiError = getApiError(error, fallback)
    notification.error({
      message: apiError.message,
      description: apiError.details.length ? apiError.details.join('\n') : undefined,
    })

    const focusMap: Partial<Record<string, keyof UserFormModel>> = {
      USER_EMAIL_DUPLICATED: 'email',
      USER_PHONE_DUPLICATED: 'phone',
      USER_CONTACT_REQUIRED: 'email',
      USER_ROLE_NOT_FOUND: 'roleIds',
    }
    const focusField = focusMap[apiError.code]

    if (focusField) {
      form.scrollToField(focusField, { focus: true })
    }

    if (apiError.code === 'USER_ROLE_NOT_FOUND') {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  }

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
    onError: (error) => showApiError(error, 'Lưu người dùng thất bại'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => showApiError(error, 'Xóa người dùng thất bại'),
  })

  const openCreateForm = () => {
    setEditingUser(null)
    form.resetFields()
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
      roleIds: user.roles.map((role) => Number(role.id)),
      password: undefined,
    })
    setIsFormOpen(true)
  }

  const confirmDelete = (user: User) => {
    modal.confirm({
      title: 'Xóa người dùng?',
      content: `Tài khoản ${user.fullName} sẽ bị xóa mềm và không còn xuất hiện trong danh sách.`,
      okText: 'Xóa người dùng',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteUserMutation.mutateAsync(user.id),
    })
  }

  const handleFilter = (values: Pick<UserListQuery, 'search' | 'userType' | 'status'>) => {
    setQuery({
      ...defaultUserQuery,
      search: values.search?.trim() || undefined,
      userType: values.userType,
      status: values.status,
    })
  }

  const resetFilter = () => {
    filterForm.resetFields()
    resetQuery()
  }

  useEffect(() => {
    filterForm.setFieldsValue({
      search: query.search,
      userType: query.userType,
      status: query.status,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const actionColumn = createActionColumn<User>((record) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      tooltip: 'Xem chi tiết',
      onClick: () => setViewingUser(record),
    },
    ...(canUpdate
      ? [{
          key: 'edit',
          icon: <EditOutlined />,
          tooltip: 'Sửa người dùng',
          onClick: () => openEditForm(record),
        }]
      : []),
    ...(canDelete
      ? [{
          key: 'delete',
          icon: <DeleteOutlined />,
          tooltip: 'Xóa người dùng',
          danger: true,
          onClick: () => confirmDelete(record),
        }]
      : []),
  ], 136)

  if (!canRead) {
    return (
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle="Bạn cần quyền USERS_READ để xem danh sách người dùng."
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Quản lý tài khoản nội bộ, khách hàng và vai trò truy cập CMS."
        extra={
          canCreate ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
              Thêm người dùng
            </Button>
          ) : null
        }
      />

      <Card>
        <Form form={filterForm} layout="inline" className="table-filter-bar" onFinish={handleFilter}>
          <Form.Item name="search">
            <Input.Search allowClear placeholder="Tìm họ tên, email, số điện thoại" onSearch={() => filterForm.submit()} />
          </Form.Item>
          <Form.Item name="userType">
            <Select allowClear options={userTypeOptions} placeholder="Loại người dùng" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select allowClear options={userStatusOptions} placeholder="Trạng thái" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
              <Button onClick={resetFilter}>Đặt lại</Button>
            </Space>
          </Form.Item>
        </Form>

        <CoreTable<User>
          columns={[...columns, actionColumn]}
          dataSource={usersQuery.data?.data ?? []}
          loading={usersQuery.isLoading}
          pagination={{
            current: usersQuery.data?.meta.page ?? query.page,
            pageSize: usersQuery.data?.meta.limit ?? query.limit,
            total: usersQuery.data?.meta.total ?? 0,
            showSizeChanger: true,
            onChange: (page, limit) => setQuery((current) => ({ ...current, page, limit })),
          }}
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

      <Drawer
        title="Chi tiết người dùng"
        open={Boolean(viewingUser)}
        width={620}
        onClose={() => setViewingUser(null)}
      >
        {viewingUser && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Họ tên">{viewingUser.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewingUser.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{viewingUser.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="Loại người dùng">
              <Tag color={userTypeMeta[viewingUser.userType].color}>
                {userTypeMeta[viewingUser.userType].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={userStatusMeta[viewingUser.status].color}>
                {userStatusMeta[viewingUser.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Space size={[0, 4]} wrap>
                {viewingUser.roles.length ? viewingUser.roles.map((role) => <Tag key={role.id}>{role.name}</Tag>) : '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Đăng nhập gần nhất">{formatDate(viewingUser.lastLoginAt)}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{formatDate(viewingUser.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">{formatDate(viewingUser.updatedAt)}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  )
}
