import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Form, Input, InputNumber, Modal, Select, Tag } from 'antd'
import { useState } from 'react'
import { operationsApi } from '@/features/operations/api/operationsApi'
import type { Station, StationFormValues } from '@/features/operations/types/operations.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const columns: ProColumns<Station>[] = [
  {
    title: 'Mã ga',
    dataIndex: 'code',
    width: 120,
    render: (_, record) => <span className="table-code">{record.code}</span>,
  },
  {
    title: 'Tên ga',
    dataIndex: 'name',
    width: 220,
  },
  {
    title: 'Slug',
    dataIndex: 'slug',
    width: 180,
    render: (_, record) => <span className="table-code">{record.slug}</span>,
  },
  {
    title: 'Tỉnh/TP',
    dataIndex: 'city',
    width: 160,
    render: (_, record) => record.city || '-',
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'address',
    width: 280,
    ellipsis: true,
    render: (_, record) => record.address || '-',
  },
  {
    title: 'Múi giờ',
    dataIndex: 'timezone',
    width: 180,
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

export function StationsPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<StationFormValues>()
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const stationsQuery = useQuery({
    queryKey: ['stations'],
    queryFn: async () => (await operationsApi.getStations()).data,
  })

  const saveStationMutation = useMutation({
    mutationFn: async (values: StationFormValues) => {
      if (editingStation) {
        return operationsApi.updateStation(editingStation.id, values)
      }

      return operationsApi.createStation(values)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingStation(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['stations'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu ga thất bại')),
  })

  const deleteStationMutation = useMutation({
    mutationFn: operationsApi.deleteStation,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['stations'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Xóa ga thất bại')),
  })

  const openCreateForm = () => {
    setEditingStation(null)
    form.setFieldsValue({
      timezone: 'Asia/Ho_Chi_Minh',
      status: 'ACTIVE',
    } as StationFormValues)
    setIsFormOpen(true)
  }

  const openEditForm = (station: Station) => {
    setEditingStation(station)
    form.setFieldsValue({
      code: station.code,
      name: station.name,
      slug: station.slug,
      city: station.city ?? undefined,
      address: station.address ?? undefined,
      latitude: station.latitude ?? undefined,
      longitude: station.longitude ?? undefined,
      timezone: station.timezone,
      status: station.status,
    })
    setIsFormOpen(true)
  }

  const confirmDelete = (station: Station) => {
    modal.confirm({
      title: 'Xóa mềm ga?',
      content: `Ga ${station.name} sẽ không còn dùng cho dữ liệu mới.`,
      okText: 'Xóa ga',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteStationMutation.mutateAsync(station.id),
    })
  }

  const actionColumn = createActionColumn<Station>((record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa ga',
      onClick: () => openEditForm(record),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Xóa mềm ga',
      danger: true,
      onClick: () => confirmDelete(record),
    },
  ])

  return (
    <>
      <PageHeader
        title="Ga"
        description="Quản lý danh mục ga tàu, vị trí và trạng thái vận hành."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm ga
          </Button>
        }
      />

      <Card>
        <CoreTable<Station>
          columns={[...columns, actionColumn]}
          dataSource={stationsQuery.data ?? []}
          loading={stationsQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingStation ? 'Sửa ga' : 'Thêm ga'}
        open={isFormOpen}
        okText={editingStation ? 'Lưu thay đổi' : 'Tạo ga'}
        cancelText="Hủy"
        confirmLoading={saveStationMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingStation(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<StationFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => saveStationMutation.mutate(values)}
        >
          <Form.Item label="Mã ga" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã ga' }]}>
            <Input placeholder="HAN" />
          </Form.Item>
          <Form.Item label="Tên ga" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên ga' }]}>
            <Input placeholder="Ga Hà Nội" />
          </Form.Item>
          <Form.Item label="Slug" name="slug" rules={[{ required: true, message: 'Vui lòng nhập slug' }]}>
            <Input placeholder="ga-ha-noi" />
          </Form.Item>
          <Form.Item label="Tỉnh/Thành phố" name="city">
            <Input placeholder="Hà Nội" />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address">
            <Input.TextArea rows={3} placeholder="Địa chỉ chi tiết" />
          </Form.Item>
          <Form.Item label="Vĩ độ" name="latitude">
            <InputNumber className="full-width-input" placeholder="21.0245" />
          </Form.Item>
          <Form.Item label="Kinh độ" name="longitude">
            <InputNumber className="full-width-input" placeholder="105.8412" />
          </Form.Item>
          <Form.Item label="Múi giờ" name="timezone" rules={[{ required: true, message: 'Vui lòng nhập múi giờ' }]}>
            <Input placeholder="Asia/Ho_Chi_Minh" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
