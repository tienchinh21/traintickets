import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
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
import { useAuth } from '@/features/auth/hooks/useAuth'
import { operationsApi } from '@/features/operations/api/operationsApi'
import {
  carriageTypeOptions,
  getCarriageTypeMeta,
} from '@/features/operations/constants/carriage.constants'
import type {
  Carriage,
  CarriageFormValues,
  GeneratedSeat,
  Seat,
  SeatGenerationLayoutType,
  SeatGenerationNumbering,
  SeatGenerationPayload,
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

const seatGenerationStatusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Hỏng', value: 'BROKEN' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const layoutTypeOptions: Array<{ label: string, value: SeatGenerationLayoutType }> = [
  { label: 'Ghế ngồi dạng lưới', value: 'SEAT_GRID' },
  { label: 'Giường nằm theo khoang', value: 'SLEEPER_ROOM' },
]

const gridNumberingOptions: Array<{ label: string, value: SeatGenerationNumbering }> = [
  { label: 'Hàng/cột: A1, A2, B1, B2', value: 'ROW_COLUMN' },
  { label: 'Số thứ tự: 01, 02, 03', value: 'NUMERIC' },
]

const sleeperNumberingOptions: Array<{ label: string, value: SeatGenerationNumbering }> = [
  { label: 'Khoang/giường: 1A, 1B, 2A, 2B', value: 'ROOM_BED' },
]

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

const generatedSeatColumns: ProColumns<GeneratedSeat>[] = [
  {
    title: 'Số ghế',
    dataIndex: 'seatNumber',
    width: 120,
    render: (_, record) => <span className="table-code">{record.seatNumber}</span>,
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

type SeatGenerationFormModel = Omit<SeatGenerationPayload, 'previewOnly'>

function parseLayout(value?: string) {
  if (!value?.trim()) return undefined

  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    throw new Error('Sơ đồ ghế JSON không hợp lệ. Vui lòng kiểm tra dấu phẩy, dấu ngoặc và tên thuộc tính.')
  }
}

function sanitizeCarriagePayload(values: CarriageFormModel): CarriageFormValues {
  const name = values.name?.trim()

  return {
    ...values,
    name: name || undefined,
    carriageNumber: values.carriageNumber,
    seatMapLayout: parseLayout(values.seatMapLayout),
  }
}

export function TrainsPage() {
  const { message, modal } = AntApp.useApp()
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<TrainFormValues>()
  const [carriageForm] = Form.useForm<CarriageFormModel>()
  const [seatGenerationForm] = Form.useForm<SeatGenerationFormModel>()
  const seatGenerationLayoutType = Form.useWatch('layoutType', seatGenerationForm)
  const [editingTrain, setEditingTrain] = useState<Train | null>(null)
  const [editingCarriage, setEditingCarriage] = useState<Carriage | null>(null)
  const [detailTrain, setDetailTrain] = useState<Train | null>(null)
  const [selectedCarriage, setSelectedCarriage] = useState<Carriage | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCarriageFormOpen, setIsCarriageFormOpen] = useState(false)
  const [isSeatGenerationOpen, setIsSeatGenerationOpen] = useState(false)
  const [seatGenerationPreview, setSeatGenerationPreview] = useState<GeneratedSeat[]>([])
  const canSuggestCarriage = hasPermission('CARRIAGES_CREATE')
  const canGenerateSeats = hasPermission('SEATS_CREATE')

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

  const seatTypesQuery = useQuery({
    queryKey: ['seat-types'],
    queryFn: async () => (await operationsApi.getSeatTypes()).data,
  })

  const seatTypeOptions = (seatTypesQuery.data ?? [])
    .filter((seatType) => (
      seatType.status === 'ACTIVE' &&
      (!selectedCarriage || seatType.allowedCarriageTypes.includes(selectedCarriage.carriageType))
    ))
    .map((seatType) => ({
      label: `${seatType.code} - ${seatType.name}`,
      value: seatType.id,
    }))

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
      const payload = sanitizeCarriagePayload(values)

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

  const suggestCarriageMutation = useMutation({
    mutationFn: async (carriageType: string) => operationsApi.suggestCarriage(detailTrain?.id ?? '', { carriageType }),
    onError: (error) => message.error(getApiErrorMessage(error, 'Gợi ý toa thất bại')),
  })

  const generateSeatsMutation = useMutation({
    mutationFn: async (payload: SeatGenerationPayload) => operationsApi.generateSeats(selectedCarriage?.id ?? '', payload),
    onError: (error) => message.error(getApiErrorMessage(error, 'Sinh ghế thất bại')),
  })

  const suggestCarriage = async (carriageType?: string, showSuccess = false) => {
    if (!detailTrain || !carriageType || !canSuggestCarriage) return

    const response = await suggestCarriageMutation.mutateAsync(carriageType)
    carriageForm.setFieldsValue({
      carriageNumber: response.data.carriageNumber,
      name: response.data.name,
    })

    if (showSuccess) {
      message.success(response.message)
    }
  }

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
    void suggestCarriage('SEAT')
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

  const openSeatGenerationForm = () => {
    setSeatGenerationPreview([])
    seatGenerationForm.resetFields()
    seatGenerationForm.setFieldsValue({
      layoutType: selectedCarriage?.carriageType === 'SLEEPER' ? 'SLEEPER_ROOM' : 'SEAT_GRID',
      rows: selectedCarriage?.carriageType === 'SLEEPER' ? undefined : 10,
      columns: selectedCarriage?.carriageType === 'SLEEPER' ? undefined : 4,
      rooms: selectedCarriage?.carriageType === 'SLEEPER' ? 8 : undefined,
      bedsPerRoom: selectedCarriage?.carriageType === 'SLEEPER' ? 4 : undefined,
      numbering: selectedCarriage?.carriageType === 'SLEEPER' ? 'ROOM_BED' : 'ROW_COLUMN',
      status: 'ACTIVE',
    } as SeatGenerationFormModel)
    setIsSeatGenerationOpen(true)
  }

  const buildSeatGenerationPayload = (values: SeatGenerationFormModel, previewOnly: boolean): SeatGenerationPayload => {
    const basePayload = {
      seatTypeId: values.seatTypeId,
      layoutType: values.layoutType,
      numbering: values.numbering,
      status: values.status,
      previewOnly,
    }

    if (values.layoutType === 'SLEEPER_ROOM') {
      return {
        ...basePayload,
        rooms: values.rooms,
        bedsPerRoom: values.bedsPerRoom,
      }
    }

    return {
      ...basePayload,
      rows: values.rows,
      columns: values.columns,
    }
  }

  const previewGeneratedSeats = async () => {
    const values = await seatGenerationForm.validateFields()
    const response = await generateSeatsMutation.mutateAsync(buildSeatGenerationPayload(values, true))
    setSeatGenerationPreview(response.data.seats)
    message.success(response.message)
  }

  const confirmGenerateSeats = async () => {
    const values = await seatGenerationForm.validateFields()
    const response = await generateSeatsMutation.mutateAsync(buildSeatGenerationPayload(values, false))
    message.success(response.message)
    setIsSeatGenerationOpen(false)
    setSeatGenerationPreview([])
    seatGenerationForm.resetFields()
    await queryClient.invalidateQueries({ queryKey: ['carriages', selectedCarriage?.id, 'seats'] })
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
              toolBarRender={() => [
                <Button
                  key="generate-seats"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openSeatGenerationForm}
                  disabled={!canGenerateSeats}
                >
                  Sinh ghế từ layout
                </Button>,
              ]}
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
          onValuesChange={(changedValues) => {
            if (editingCarriage) return
            if ('carriageType' in changedValues) {
              void suggestCarriage(changedValues.carriageType)
            }
          }}
          onFinish={(values) => saveCarriageMutation.mutate(values)}
        >
          <Form.Item label="Loại toa" name="carriageType" rules={[{ required: true, message: 'Vui lòng chọn loại toa' }]}>
            <Select options={carriageTypeOptions} placeholder="Chọn loại toa" />
          </Form.Item>
          <Button
            className="form-suggest-button"
            icon={<ReloadOutlined />}
            loading={suggestCarriageMutation.isPending}
            disabled={!canSuggestCarriage}
            onClick={() => void suggestCarriage(carriageForm.getFieldValue('carriageType'), true)}
          >
            Gợi ý số toa và tên toa
          </Button>
          <Form.Item label="Số toa" name="carriageNumber">
            <InputNumber className="full-width-input" min={1} />
          </Form.Item>
          <Form.Item label="Tên toa" name="name">
            <Input placeholder="BE tự tạo nếu để trống" />
          </Form.Item>
          <Form.Item label="Sơ đồ ghế JSON" name="seatMapLayout">
            <Input.TextArea rows={4} placeholder='{"rows":10,"columns":4}' />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedCarriage ? `Sinh ghế cho ${selectedCarriage.name}` : 'Sinh ghế từ layout'}
        open={isSeatGenerationOpen}
        width={820}
        confirmLoading={generateSeatsMutation.isPending}
        onCancel={() => {
          setIsSeatGenerationOpen(false)
          setSeatGenerationPreview([])
          seatGenerationForm.resetFields()
        }}
        footer={[
          <Button
            key="preview"
            icon={<EyeOutlined />}
            loading={generateSeatsMutation.isPending}
            disabled={!canGenerateSeats}
            onClick={() => void previewGeneratedSeats()}
          >
            Preview ghế
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={generateSeatsMutation.isPending}
            disabled={!canGenerateSeats}
            onClick={() => void confirmGenerateSeats()}
          >
            Tạo ghế hàng loạt
          </Button>,
        ]}
      >
        <Form<SeatGenerationFormModel>
          form={seatGenerationForm}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if ('layoutType' in changedValues) {
              setSeatGenerationPreview([])
              seatGenerationForm.setFieldsValue({
                numbering: changedValues.layoutType === 'SLEEPER_ROOM' ? 'ROOM_BED' : 'ROW_COLUMN',
              })
            }
          }}
        >
          <Form.Item label="Loại ghế" name="seatTypeId" rules={[{ required: true, message: 'Vui lòng chọn loại ghế' }]}>
            <Select
              loading={seatTypesQuery.isLoading}
              options={seatTypeOptions}
              placeholder="Chọn loại ghế phù hợp với loại toa"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Kiểu layout" name="layoutType" rules={[{ required: true, message: 'Vui lòng chọn kiểu layout' }]}>
            <Select options={layoutTypeOptions} />
          </Form.Item>

          {seatGenerationLayoutType === 'SLEEPER_ROOM' ? (
            <Space className="full-width-input" size={12} align="baseline" wrap>
              <Form.Item label="Số khoang" name="rooms" rules={[{ required: true, message: 'Nhập số khoang' }]}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="Giường/khoang" name="bedsPerRoom" rules={[{ required: true, message: 'Nhập số giường' }]}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="Cách đánh số" name="numbering" rules={[{ required: true, message: 'Chọn cách đánh số' }]}>
                <Select options={sleeperNumberingOptions} style={{ width: 260 }} />
              </Form.Item>
            </Space>
          ) : (
            <Space className="full-width-input" size={12} align="baseline" wrap>
              <Form.Item label="Số dòng" name="rows" rules={[{ required: true, message: 'Nhập số dòng' }]}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="Số cột" name="columns" rules={[{ required: true, message: 'Nhập số cột' }]}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="Cách đánh số" name="numbering" rules={[{ required: true, message: 'Chọn cách đánh số' }]}>
                <Select options={gridNumberingOptions} style={{ width: 260 }} />
              </Form.Item>
            </Space>
          )}

          <Form.Item label="Trạng thái ghế" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={seatGenerationStatusOptions} />
          </Form.Item>
        </Form>

        <CoreTable<GeneratedSeat>
          rowKey={(record) => record.seatNumber}
          columns={generatedSeatColumns}
          dataSource={seatGenerationPreview}
          pagination={false}
          search={false}
          toolBarRender={false}
          headerTitle={`Preview ${seatGenerationPreview.length} ghế`}
          locale={{ emptyText: 'Bấm Preview ghế để xem danh sách ghế sẽ được sinh' }}
        />
      </Modal>
    </>
  )
}
