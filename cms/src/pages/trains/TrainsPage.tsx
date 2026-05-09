import { ApartmentOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  App as AntApp,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import { useState } from 'react'
import { operationsApi } from '@/features/operations/api/operationsApi'
import {
  carriageTypeOptions,
  getCarriageTypeMeta,
} from '@/features/operations/constants/carriage.constants'
import type {
  Carriage,
  CarriageFormValues,
  Seat,
  Train,
  TrainFormValues,
} from '@/features/operations/types/operations.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Bảo trì', value: 'MAINTENANCE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const trainStatusMeta = {
  ACTIVE: { color: 'green', label: 'Đang hoạt động' },
  MAINTENANCE: { color: 'gold', label: 'Bảo trì' },
  INACTIVE: { color: 'red', label: 'Tạm khóa' },
}

const carriageStatusMeta = {
  ACTIVE: { color: 'green', label: 'Đang hoạt động' },
  MAINTENANCE: { color: 'gold', label: 'Bảo trì' },
  INACTIVE: { color: 'red', label: 'Tạm khóa' },
}

const seatStatusMeta = {
  ACTIVE: { color: 'green', label: 'Đang hoạt động' },
  BROKEN: { color: 'gold', label: 'Hỏng' },
  INACTIVE: { color: 'red', label: 'Tạm khóa' },
}

const columns: ProColumns<Train>[] = [
  {
    title: 'Mã tàu',
    dataIndex: 'code',
    width: 140,
    render: (_, record) => <span className="table-code">{record.code}</span>,
  },
  {
    title: 'Tên tàu',
    dataIndex: 'name',
    width: 220,
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    width: 360,
    ellipsis: true,
    render: (_, record) => record.description || '-',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 160,
    render: (_, record) => {
      const meta = trainStatusMeta[record.status]
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
]

const carriageColumns: ProColumns<Carriage>[] = [
  {
    title: 'Số toa',
    dataIndex: 'carriageNumber',
    width: 100,
  },
  {
    title: 'Tên toa',
    dataIndex: 'name',
    width: 220,
  },
  {
    title: 'Loại toa',
    dataIndex: 'carriageType',
    width: 160,
    render: (_, record) => {
      const meta = getCarriageTypeMeta(record.carriageType)
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
  {
    title: 'Layout',
    dataIndex: 'seatMapLayout',
    width: 260,
    ellipsis: true,
    render: (_, record) => (
      <span className="table-code">
        {record.seatMapLayout ? JSON.stringify(record.seatMapLayout) : '-'}
      </span>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (_, record) => {
      const meta = carriageStatusMeta[record.status]
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
]

const seatColumns: ProColumns<Seat>[] = [
  {
    title: 'Số ghế',
    dataIndex: 'seatNumber',
    width: 120,
    render: (_, record) => <span className="table-code">{record.seatNumber}</span>,
  },
  {
    title: 'Loại ghế',
    dataIndex: 'seatType',
    width: 220,
    render: (_, record) => `${record.seatType.code} - ${record.seatType.name}`,
  },
  { title: 'Dòng', dataIndex: 'rowNumber', width: 100, render: (_, record) => record.rowNumber ?? '-' },
  { title: 'Cột', dataIndex: 'columnNumber', width: 100, render: (_, record) => record.columnNumber ?? '-' },
  { title: 'Tầng', dataIndex: 'floorNumber', width: 100, render: (_, record) => record.floorNumber ?? '-' },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (_, record) => {
      const meta = seatStatusMeta[record.status]
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
]

type CarriageFormModel = Omit<CarriageFormValues, 'seatMapLayout'> & {
  seatMapLayout?: string
}

function parseLayout(value?: string) {
  if (!value?.trim()) return undefined
  return JSON.parse(value) as Record<string, never>
}

export function TrainsPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<TrainFormValues>()
  const [carriageForm] = Form.useForm<CarriageFormModel>()
  const [editingTrain, setEditingTrain] = useState<Train | null>(null)
  const [editingCarriage, setEditingCarriage] = useState<Carriage | null>(null)
  const [detailTrain, setDetailTrain] = useState<Train | null>(null)
  const [selectedCarriage, setSelectedCarriage] = useState<Carriage | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCarriageFormOpen, setIsCarriageFormOpen] = useState(false)

  const trainsQuery = useQuery({
    queryKey: ['trains'],
    queryFn: async () => (await operationsApi.getTrains()).data,
  })

  const carriagesQuery = useQuery({
    queryKey: ['trains', detailTrain?.id, 'carriages'],
    enabled: Boolean(detailTrain),
    queryFn: async () => (await operationsApi.getTrainCarriages(detailTrain?.id ?? '')).data,
  })

  const seatsQuery = useQuery({
    queryKey: ['carriages', selectedCarriage?.id, 'seats'],
    enabled: Boolean(selectedCarriage),
    queryFn: async () => (await operationsApi.getSeats(selectedCarriage?.id ?? '')).data,
  })

  const saveTrainMutation = useMutation({
    mutationFn: async (values: TrainFormValues) => {
      if (editingTrain) {
        return operationsApi.updateTrain(editingTrain.id, values)
      }

      return operationsApi.createTrain(values)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingTrain(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['trains'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu tàu thất bại')),
  })

  const deleteTrainMutation = useMutation({
    mutationFn: operationsApi.deleteTrain,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['trains'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Xóa tàu thất bại')),
  })

  const saveCarriageMutation = useMutation({
    mutationFn: async (values: CarriageFormModel) => {
      const payload: CarriageFormValues = {
        ...values,
        seatMapLayout: parseLayout(values.seatMapLayout),
      }

      if (editingCarriage) {
        return operationsApi.updateCarriage(editingCarriage.id, payload)
      }

      return operationsApi.createCarriage(detailTrain?.id ?? '', payload)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsCarriageFormOpen(false)
      setEditingCarriage(null)
      carriageForm.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['trains', detailTrain?.id, 'carriages'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu toa thất bại')),
  })

  const deleteCarriageMutation = useMutation({
    mutationFn: operationsApi.deleteCarriage,
    onSuccess: async (response) => {
      message.success(response.message)
      setSelectedCarriage(null)
      await queryClient.invalidateQueries({ queryKey: ['trains', detailTrain?.id, 'carriages'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Xóa toa thất bại')),
  })

  const openCreateForm = () => {
    setEditingTrain(null)
    form.setFieldsValue({ status: 'ACTIVE' } as TrainFormValues)
    setIsFormOpen(true)
  }

  const openEditForm = (train: Train) => {
    setEditingTrain(train)
    form.setFieldsValue({
      code: train.code,
      name: train.name,
      description: train.description ?? undefined,
      status: train.status,
    })
    setIsFormOpen(true)
  }

  const confirmDelete = (train: Train) => {
    modal.confirm({
      title: 'Xóa mềm tàu?',
      content: `Tàu ${train.name} sẽ không còn dùng cho dữ liệu mới.`,
      okText: 'Xóa tàu',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteTrainMutation.mutateAsync(train.id),
    })
  }

  const openCreateCarriageForm = () => {
    setEditingCarriage(null)
    carriageForm.setFieldsValue({ status: 'ACTIVE', carriageType: 'SEAT' } as CarriageFormModel)
    setIsCarriageFormOpen(true)
  }

  const openEditCarriageForm = (carriage: Carriage) => {
    setEditingCarriage(carriage)
    carriageForm.setFieldsValue({
      carriageNumber: carriage.carriageNumber,
      name: carriage.name,
      carriageType: carriage.carriageType,
      seatMapLayout: carriage.seatMapLayout ? JSON.stringify(carriage.seatMapLayout, null, 2) : undefined,
      status: carriage.status,
    })
    setIsCarriageFormOpen(true)
  }

  const confirmDeleteCarriage = (carriage: Carriage) => {
    modal.confirm({
      title: 'Xóa mềm toa?',
      content: `Toa ${carriage.name} sẽ không còn dùng cho dữ liệu mới.`,
      okText: 'Xóa toa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteCarriageMutation.mutateAsync(carriage.id),
    })
  }

  const actionColumn = createActionColumn<Train>((record) => [
    {
      key: 'detail',
      icon: <ApartmentOutlined />,
      tooltip: 'Chi tiết tàu',
      onClick: () => {
        setDetailTrain(record)
        setSelectedCarriage(null)
      },
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa tàu',
      onClick: () => openEditForm(record),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Xóa mềm tàu',
      danger: true,
      onClick: () => confirmDelete(record),
    },
  ], 136)

  const carriageActionColumn = createActionColumn<Carriage>((record) => [
    {
      key: 'seats',
      icon: <EyeOutlined />,
      tooltip: 'Xem ghế trong toa',
      onClick: () => setSelectedCarriage(record),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa toa',
      onClick: () => openEditCarriageForm(record),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Xóa mềm toa',
      danger: true,
      onClick: () => confirmDeleteCarriage(record),
    },
  ], 136)

  return (
    <>
      <PageHeader
        title="Tàu"
        description="Quản lý danh mục tàu và trạng thái vận hành."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm tàu
          </Button>
        }
      />

      <Card>
        <CoreTable<Train>
          columns={[...columns, actionColumn]}
          dataSource={trainsQuery.data ?? []}
          loading={trainsQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingTrain ? 'Sửa tàu' : 'Thêm tàu'}
        open={isFormOpen}
        okText={editingTrain ? 'Lưu thay đổi' : 'Tạo tàu'}
        cancelText="Hủy"
        confirmLoading={saveTrainMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingTrain(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<TrainFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => saveTrainMutation.mutate(values)}
        >
          <Form.Item label="Mã tàu" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã tàu' }]}>
            <Input placeholder="SE1" />
          </Form.Item>
          <Form.Item label="Tên tàu" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên tàu' }]}>
            <Input placeholder="Tàu SE1" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Ghi chú cấu hình tàu" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={detailTrain ? `Chi tiết ${detailTrain.name}` : 'Chi tiết tàu'}
        open={Boolean(detailTrain)}
        width={980}
        onClose={() => {
          setDetailTrain(null)
          setSelectedCarriage(null)
        }}
      >
        {detailTrain && (
          <div className="train-detail-summary">
            <Space direction="vertical" size={2}>
              <Typography.Text type="secondary">Mã tàu</Typography.Text>
              <span className="table-code">{detailTrain.code}</span>
            </Space>
            <Space direction="vertical" size={2}>
              <Typography.Text type="secondary">Tên tàu</Typography.Text>
              <Typography.Text strong>{detailTrain.name}</Typography.Text>
            </Space>
            <Space direction="vertical" size={2}>
              <Typography.Text type="secondary">Trạng thái</Typography.Text>
              <Tag color={trainStatusMeta[detailTrain.status].color}>
                {trainStatusMeta[detailTrain.status].label}
              </Tag>
            </Space>
          </div>
        )}

        <CoreTable<Carriage>
          columns={[...carriageColumns, carriageActionColumn]}
          dataSource={carriagesQuery.data ?? []}
          loading={carriagesQuery.isLoading}
          pagination={false}
          headerTitle="Danh sách toa"
          toolBarRender={() => [
            <Button
              key="create-carriage"
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateCarriageForm}
            >
              Thêm toa
            </Button>,
          ]}
        />

        {selectedCarriage && (
          <div className="train-detail-seats">
            <CoreTable<Seat>
              columns={seatColumns}
              dataSource={seatsQuery.data ?? []}
              headerTitle={`Ghế trong ${selectedCarriage.name}`}
              loading={seatsQuery.isLoading}
              pagination={false}
              toolBarRender={false}
            />
          </div>
        )}
      </Drawer>

      <Modal
        title={editingCarriage ? 'Sửa toa' : 'Thêm toa'}
        open={isCarriageFormOpen}
        okText={editingCarriage ? 'Lưu thay đổi' : 'Tạo toa'}
        cancelText="Hủy"
        confirmLoading={saveCarriageMutation.isPending}
        onCancel={() => {
          setIsCarriageFormOpen(false)
          setEditingCarriage(null)
          carriageForm.resetFields()
        }}
        onOk={() => carriageForm.submit()}
      >
        <Form<CarriageFormModel>
          form={carriageForm}
          layout="vertical"
          onFinish={(values) => saveCarriageMutation.mutate(values)}
        >
          <Form.Item label="Số toa" name="carriageNumber" rules={[{ required: true, message: 'Vui lòng nhập số toa' }]}>
            <InputNumber className="full-width-input" min={1} />
          </Form.Item>
          <Form.Item label="Tên toa" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên toa' }]}>
            <Input placeholder="Toa 1 ghế ngồi" />
          </Form.Item>
          <Form.Item label="Loại toa" name="carriageType" rules={[{ required: true, message: 'Vui lòng chọn loại toa' }]}>
            <Select options={carriageTypeOptions} placeholder="Chọn loại toa" />
          </Form.Item>
          <Form.Item label="Sơ đồ ghế JSON" name="seatMapLayout">
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
