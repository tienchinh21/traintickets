import { EditOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Form, Input, Modal, Select, Tag } from 'antd'
import { useState } from 'react'
import { accessControlApi } from '@/features/access-control/api/accessControlApi'
import type {
  Permission,
  PermissionFormValues,
} from '@/features/access-control/types/accessControl.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const methodOptions = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].map((method) => ({
  label: method,
  value: method,
}))

const columns: ProColumns<Permission>[] = [
  {
    title: 'Mã quyền',
    dataIndex: 'code',
    width: 220,
    render: (_, record) => <span className="table-code">{record.code}</span>,
  },
  {
    title: 'Tên quyền',
    dataIndex: 'name',
    width: 220,
  },
  {
    title: 'Module',
    dataIndex: 'module',
    width: 150,
    render: (_, record) => <Tag color="cyan">{record.module}</Tag>,
  },
  {
    title: 'Action',
    dataIndex: 'action',
    width: 120,
  },
  {
    title: 'Method',
    dataIndex: 'method',
    width: 100,
    render: (_, record) => record.method ? <Tag>{record.method}</Tag> : '-',
  },
  {
    title: 'Path',
    dataIndex: 'path',
    width: 240,
    ellipsis: true,
    render: (_, record) => record.path || '-',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (_, record) => (
      <Tag color={record.status === 'ACTIVE' ? 'green' : 'red'}>
        {record.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
      </Tag>
    ),
  },
]

export function PermissionsPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<PermissionFormValues>()
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await accessControlApi.getPermissions()).data,
  })

  const savePermissionMutation = useMutation({
    mutationFn: async (values: PermissionFormValues) => {
      if (editingPermission) {
        return accessControlApi.updatePermission(editingPermission.id, values)
      }

      return accessControlApi.createPermission(values)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingPermission(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu quyền thất bại')),
  })

  const deactivatePermissionMutation = useMutation({
    mutationFn: accessControlApi.deactivatePermission,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Vô hiệu hóa quyền thất bại')),
  })

  const openCreateForm = () => {
    setEditingPermission(null)
    form.setFieldsValue({ status: 'ACTIVE' } as PermissionFormValues)
    setIsFormOpen(true)
  }

  const openEditForm = (permission: Permission) => {
    setEditingPermission(permission)
    form.setFieldsValue({
      code: permission.code,
      name: permission.name,
      description: permission.description ?? undefined,
      module: permission.module,
      action: permission.action,
      method: permission.method ?? undefined,
      path: permission.path ?? undefined,
      status: permission.status,
    })
    setIsFormOpen(true)
  }

  const confirmDeactivate = (permission: Permission) => {
    modal.confirm({
      title: 'Vô hiệu hóa quyền?',
      content: `Quyền ${permission.name} sẽ chuyển sang trạng thái tạm khóa.`,
      okText: 'Vô hiệu hóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deactivatePermissionMutation.mutateAsync(permission.id),
    })
  }

  const actionColumn = createActionColumn<Permission>((record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa quyền',
      onClick: () => openEditForm(record),
    },
    {
      key: 'deactivate',
      icon: <LockOutlined />,
      tooltip: 'Vô hiệu hóa quyền',
      danger: true,
      disabled: record.status === 'INACTIVE',
      onClick: () => confirmDeactivate(record),
    },
  ])

  return (
    <>
      <PageHeader
        title="Quyền"
        description="Quản lý permission động dùng cho guard runtime của backend."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm quyền
          </Button>
        }
      />

      <Card>
        <CoreTable<Permission>
          columns={[...columns, actionColumn]}
          dataSource={permissionsQuery.data ?? []}
          loading={permissionsQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingPermission ? 'Sửa quyền' : 'Thêm quyền'}
        open={isFormOpen}
        okText={editingPermission ? 'Lưu thay đổi' : 'Tạo quyền'}
        cancelText="Hủy"
        confirmLoading={savePermissionMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingPermission(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<PermissionFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => savePermissionMutation.mutate(values)}
        >
          <Form.Item label="Mã quyền" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã quyền' }]}>
            <Input placeholder="STATIONS_CREATE" />
          </Form.Item>
          <Form.Item label="Tên quyền" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên quyền' }]}>
            <Input placeholder="Tạo ga" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả quyền" />
          </Form.Item>
          <Form.Item label="Module" name="module" rules={[{ required: true, message: 'Vui lòng nhập module' }]}>
            <Input placeholder="stations" />
          </Form.Item>
          <Form.Item label="Action" name="action" rules={[{ required: true, message: 'Vui lòng nhập action' }]}>
            <Input placeholder="create" />
          </Form.Item>
          <Form.Item label="HTTP method" name="method">
            <Select allowClear options={methodOptions} placeholder="Chọn method" />
          </Form.Item>
          <Form.Item label="Route path" name="path">
            <Input placeholder="/stations/:id" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
