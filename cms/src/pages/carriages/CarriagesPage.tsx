import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Form, Input, InputNumber, Modal, Select, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { operationsApi } from '@/features/operations/api/operationsApi'
import type { Carriage, CarriageFormValues } from '@/features/operations/types/operations.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Bảo trì', value: 'MAINTENANCE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const statusMeta = {
  ACTIVE: { color: 'green', label: 'Đang hoạt động' },
  MAINTENANCE: { color: 'gold', label: 'Bảo trì' },
  INACTIVE: { color: 'red', label: 'Tạm khóa' },
}

type CarriageFormModel = Omit<CarriageFormValues, 'seatMapLayout'> & {
  seatMapLayout?: string
}

const columns: ProColumns<Carriage>[] = [
  { title: 'Số toa', dataIndex: 'carriageNumber', width: 100 },
  { title: 'Tên toa', dataIndex: 'name', width: 220 },
  {
    title: 'Loại toa',
    dataIndex: 'carriageType',
    width: 140,
    render: (_, record) => <Tag>{record.carriageType}</Tag>,
  },
  {
    title: 'Layout',
    dataIndex: 'seatMapLayout',
    width: 300,
    ellipsis: true,
    render: (_, record) => (
      <span className="table-code">{record.seatMapLayout ? JSON.stringify(record.seatMapLayout) : '-'}</span>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (_, record) => {
      const meta = statusMeta[record.status]
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
]

function parseLayout(value?: string) {
  if (!value?.trim()) return undefined
  return JSON.parse(value) as Record<string, never>
}

export function CarriagesPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<CarriageFormModel>()
  const [selectedTrainId, setSelectedTrainId] = useState<string>()
  const [editingCarriage, setEditingCarriage] = useState<Carriage | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const trainsQuery = useQuery({
    queryKey: ['trains'],
    queryFn: async () => (await operationsApi.getTrains()).data,
  })

  const activeTrainId = selectedTrainId ?? trainsQuery.data?.[0]?.id

  const carriagesQuery = useQuery({
    queryKey: ['trains', activeTrainId, 'carriages'],
    enabled: Boolean(activeTrainId),
    queryFn: async () => (await operationsApi.getTrainCarriages(activeTrainId ?? '')).data,
  })

  const selectedTrain = useMemo(
    () => trainsQuery.data?.find((train) => train.id === activeTrainId),
    [activeTrainId, trainsQuery.data],
  )

  const saveCarriageMutation = useMutation({
    mutationFn: async (values: CarriageFormModel) => {
      const payload: CarriageFormValues = {
        ...values,
        seatMapLayout: parseLayout(values.seatMapLayout),
      }

      if (editingCarriage) {
        return operationsApi.updateCarriage(editingCarriage.id, payload)
      }

      return operationsApi.createCarriage(activeTrainId ?? '', payload)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingCarriage(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['trains', activeTrainId, 'carriages'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu toa thất bại')),
  })

  const deleteCarriageMutation = useMutation({
    mutationFn: operationsApi.deleteCarriage,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['trains', activeTrainId, 'carriages'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Xóa toa thất bại')),
  })

  const openCreateForm = () => {
    setEditingCarriage(null)
    form.setFieldsValue({ status: 'ACTIVE', carriageType: 'SEAT' } as CarriageFormModel)
    setIsFormOpen(true)
  }

  const openEditForm = (carriage: Carriage) => {
    setEditingCarriage(carriage)
    form.setFieldsValue({
      carriageNumber: carriage.carriageNumber,
      name: carriage.name,
      carriageType: carriage.carriageType,
      seatMapLayout: carriage.seatMapLayout ? JSON.stringify(carriage.seatMapLayout, null, 2) : undefined,
      status: carriage.status,
    })
    setIsFormOpen(true)
  }

  const confirmDelete = (carriage: Carriage) => {
    modal.confirm({
      title: 'Xóa mềm toa?',
      content: `Toa ${carriage.name} sẽ không còn dùng cho dữ liệu mới.`,
      okText: 'Xóa toa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteCarriageMutation.mutateAsync(carriage.id),
    })
  }

  const actionColumn = createActionColumn<Carriage>((record) => [
    { key: 'edit', icon: <EditOutlined />, tooltip: 'Sửa toa', onClick: () => openEditForm(record) },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Xóa mềm toa',
      danger: true,
      onClick: () => confirmDelete(record),
    },
  ])

  return (
    <>
      <PageHeader
        title="Toa"
        description="Quản lý các toa thuộc từng tàu và layout sơ đồ ghế."
        extra={
            <Button type="primary" icon={<PlusOutlined />} disabled={!activeTrainId} onClick={openCreateForm}>
            Thêm toa
          </Button>
        }
      />

      <Card>
        <div className="table-toolbar">
          <Select
            className="table-search"
            loading={trainsQuery.isLoading}
            options={(trainsQuery.data ?? []).map((train) => ({
              label: `${train.code} - ${train.name}`,
              value: train.id,
            }))}
            placeholder="Chọn tàu"
            value={activeTrainId}
            onChange={setSelectedTrainId}
          />
        </div>

        <CoreTable<Carriage>
          columns={[...columns, actionColumn]}
          dataSource={carriagesQuery.data ?? []}
          headerTitle={selectedTrain ? `Toa thuộc ${selectedTrain.name}` : undefined}
          loading={carriagesQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingCarriage ? 'Sửa toa' : 'Thêm toa'}
        open={isFormOpen}
        okText={editingCarriage ? 'Lưu thay đổi' : 'Tạo toa'}
        cancelText="Hủy"
        confirmLoading={saveCarriageMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingCarriage(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<CarriageFormModel>
          form={form}
          layout="vertical"
          onFinish={(values) => saveCarriageMutation.mutate(values)}
        >
          <Form.Item label="Số toa" name="carriageNumber" rules={[{ required: true, message: 'Vui lòng nhập số toa' }]}>
            <InputNumber className="full-width-input" min={1} />
          </Form.Item>
          <Form.Item label="Tên toa" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên toa' }]}>
            <Input placeholder="Toa 1 ghế ngồi" />
          </Form.Item>
          <Form.Item label="Loại toa" name="carriageType" rules={[{ required: true, message: 'Vui lòng nhập loại toa' }]}>
            <Input placeholder="SEAT" />
          </Form.Item>
          <Form.Item label="Seat map layout JSON" name="seatMapLayout">
            <Input.TextArea rows={4} placeholder='{"rows":10,"columns":4}' />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
