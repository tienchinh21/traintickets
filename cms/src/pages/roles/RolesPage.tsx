import {
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Checkbox, Form, Input, Modal, Select, Space, Tag } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { accessControlApi } from '@/features/access-control/api/accessControlApi'
import type {
  Permission,
  Role,
  RoleFormValues,
} from '@/features/access-control/types/accessControl.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const columns: ProColumns<Role>[] = [
  {
    title: 'Mã vai trò',
    dataIndex: 'code',
    width: 180,
    render: (_, record) => <TypographyCode>{record.code}</TypographyCode>,
  },
  {
    title: 'Tên vai trò',
    dataIndex: 'name',
    width: 220,
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    width: 320,
    ellipsis: true,
    render: (_, record) => record.description || '-',
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

function TypographyCode({ children }: { children: string }) {
  return <span className="table-code">{children}</span>
}

export function RolesPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<RoleFormValues>()
  const [permissionForm] = Form.useForm<{ permissionCodes: string[] }>()
  const selectedPermissionCodes = Form.useWatch('permissionCodes', permissionForm) ?? []
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permissionRole, setPermissionRole] = useState<Role | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await accessControlApi.getRoles()).data,
  })

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await accessControlApi.getPermissions()).data,
  })

  const roleDetailQuery = useQuery({
    queryKey: ['roles', permissionRole?.id],
    enabled: Boolean(permissionRole),
    queryFn: async () => (await accessControlApi.getRole(permissionRole?.id ?? '')).data,
  })

  useEffect(() => {
    if (!roleDetailQuery.data) return

    permissionForm.setFieldsValue({
      permissionCodes: roleDetailQuery.data.permissions.map((item) => item.permission.code),
    })
  }, [permissionForm, roleDetailQuery.data])

  const saveRoleMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      if (editingRole) {
        return accessControlApi.updateRole(editingRole.id, values)
      }

      return accessControlApi.createRole(values)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingRole(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu vai trò thất bại')),
  })

  const deactivateRoleMutation = useMutation({
    mutationFn: accessControlApi.deactivateRole,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Vô hiệu hóa vai trò thất bại')),
  })

  const syncPermissionsMutation = useMutation({
    mutationFn: async (values: { permissionCodes: string[] }) =>
      accessControlApi.syncRolePermissions(permissionRole?.id ?? '', values),
    onSuccess: async (response) => {
      message.success(response.message)
      setPermissionRole(null)
      permissionForm.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Gán quyền thất bại')),
  })

  const permissionGroups = useMemo(() => {
    const permissions = permissionsQuery.data ?? []
    return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
      groups[permission.module] = groups[permission.module] ?? []
      groups[permission.module].push(permission)
      return groups
    }, {})
  }, [permissionsQuery.data])

  const openCreateForm = () => {
    setEditingRole(null)
    form.setFieldsValue({ status: 'ACTIVE' } as RoleFormValues)
    setIsFormOpen(true)
  }

  const openEditForm = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue({
      code: role.code,
      name: role.name,
      description: role.description ?? undefined,
      status: role.status,
    })
    setIsFormOpen(true)
  }

  const confirmDeactivate = (role: Role) => {
    modal.confirm({
      title: 'Vô hiệu hóa vai trò?',
      content: `Vai trò ${role.name} sẽ chuyển sang trạng thái tạm khóa.`,
      okText: 'Vô hiệu hóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deactivateRoleMutation.mutateAsync(role.id),
    })
  }

  const togglePermissionGroup = (permissions: Permission[], checked: boolean) => {
    const permissionCodes = permissions.map((permission) => permission.code)
    const selectedCodes = new Set(selectedPermissionCodes)

    permissionCodes.forEach((code) => {
      if (checked) {
        selectedCodes.add(code)
      } else {
        selectedCodes.delete(code)
      }
    })

    permissionForm.setFieldsValue({
      permissionCodes: Array.from(selectedCodes),
    })
  }

  const togglePermission = (permissionCode: string, checked: boolean) => {
    const selectedCodes = new Set(selectedPermissionCodes)

    if (checked) {
      selectedCodes.add(permissionCode)
    } else {
      selectedCodes.delete(permissionCode)
    }

    permissionForm.setFieldsValue({
      permissionCodes: Array.from(selectedCodes),
    })
  }

  const actionColumn = createActionColumn<Role>((record) => [
    {
      key: 'permissions',
      icon: <SafetyCertificateOutlined />,
      tooltip: 'Gán quyền',
      onClick: () => setPermissionRole(record),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa vai trò',
      onClick: () => openEditForm(record),
    },
    {
      key: 'deactivate',
      icon: <LockOutlined />,
      tooltip: 'Vô hiệu hóa vai trò',
      danger: true,
      disabled: record.status === 'INACTIVE',
      onClick: () => confirmDeactivate(record),
    },
  ], 136)

  return (
    <>
      <PageHeader
        title="Vai trò"
        description="Quản lý nhóm quyền truy cập và trạng thái vai trò trong CMS."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm vai trò
          </Button>
        }
      />

      <Card>
        <CoreTable<Role>
          columns={[...columns, actionColumn]}
          dataSource={rolesQuery.data ?? []}
          loading={rolesQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingRole ? 'Sửa vai trò' : 'Thêm vai trò'}
        open={isFormOpen}
        okText={editingRole ? 'Lưu thay đổi' : 'Tạo vai trò'}
        cancelText="Hủy"
        confirmLoading={saveRoleMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingRole(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<RoleFormValues> form={form} layout="vertical" onFinish={(values) => saveRoleMutation.mutate(values)}>
          <Form.Item label="Mã vai trò" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã vai trò' }]}>
            <Input placeholder="OPERATOR" />
          </Form.Item>
          <Form.Item label="Tên vai trò" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}>
            <Input placeholder="Nhân viên vận hành" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả phạm vi quyền hạn" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Gán quyền${permissionRole ? `: ${permissionRole.name}` : ''}`}
        open={Boolean(permissionRole)}
        width={760}
        okText="Lưu quyền"
        cancelText="Hủy"
        confirmLoading={syncPermissionsMutation.isPending || roleDetailQuery.isLoading}
        onCancel={() => {
          setPermissionRole(null)
          permissionForm.resetFields()
        }}
        onOk={() => permissionForm.submit()}
      >
        <Form
          form={permissionForm}
          layout="vertical"
          onFinish={(values) => syncPermissionsMutation.mutate(values)}
        >
          <Form.Item name="permissionCodes" hidden>
            <Input />
          </Form.Item>

          <div className="permission-checklist">
            {Object.entries(permissionGroups).map(([module, permissions]) => (
              <div className="permission-group" key={module}>
                <div className="permission-group-header">
                  <Checkbox
                    checked={permissions.every((permission) =>
                      selectedPermissionCodes.includes(permission.code),
                    )}
                    indeterminate={
                      permissions.some((permission) =>
                        selectedPermissionCodes.includes(permission.code),
                      ) &&
                      !permissions.every((permission) =>
                        selectedPermissionCodes.includes(permission.code),
                      )
                    }
                    onChange={(event) => togglePermissionGroup(permissions, event.target.checked)}
                  >
                    <span className="permission-group-title">{module}</span>
                  </Checkbox>
                </div>
                <Space wrap>
                  {permissions.map((permission) => (
                    <Checkbox
                      checked={selectedPermissionCodes.includes(permission.code)}
                      key={permission.code}
                      onChange={(event) => togglePermission(permission.code, event.target.checked)}
                    >
                      {permission.name}
                    </Checkbox>
                  ))}
                </Space>
              </div>
            ))}
          </div>
        </Form>
      </Modal>
    </>
  )
}
