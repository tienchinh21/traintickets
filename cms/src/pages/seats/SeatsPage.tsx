import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { operationsApi } from '@/features/operations/api/operationsApi'
import type { Seat, SeatFormValues } from '@/features/operations/types/operations.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Hỏng', value: 'BROKEN' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const statusMeta = {
  ACTIVE: { color: 'green', label: 'Đang hoạt động' },
  BROKEN: { color: 'gold', label: 'Hỏng' },
  INACTIVE: { color: 'red', label: 'Tạm khóa' },
}

const columns: ProColumns<Seat>[] = [
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
      const meta = statusMeta[record.status]
      return <Tag color={meta.color}>{meta.label}</Tag>
    },
  },
]

export function SeatsPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<SeatFormValues>()
  const [selectedTrainId, setSelectedTrainId] = useState<string>()
  const [selectedCarriageId, setSelectedCarriageId] = useState<string>()
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null)
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

  const activeCarriageId = selectedCarriageId ?? carriagesQuery.data?.[0]?.id

  const seatsQuery = useQuery({
    queryKey: ['carriages', activeCarriageId, 'seats'],
    enabled: Boolean(activeCarriageId),
    queryFn: async () => (await operationsApi.getSeats(activeCarriageId ?? '')).data,
  })

  const seatTypesQuery = useQuery({
    queryKey: ['seat-types'],
    queryFn: async () => (await operationsApi.getSeatTypes()).data,
  })

  const selectedCarriage = useMemo(
    () => carriagesQuery.data?.find((carriage) => carriage.id === activeCarriageId),
    [activeCarriageId, carriagesQuery.data],
  )

  const saveSeatMutation = useMutation({
    mutationFn: async (values: SeatFormValues) => {
      if (editingSeat) {
        return operationsApi.updateSeat(editingSeat.id, values)
      }

      return operationsApi.createSeat(activeCarriageId ?? '', values)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingSeat(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['carriages', activeCarriageId, 'seats'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu ghế thất bại')),
  })

  const deleteSeatMutation = useMutation({
    mutationFn: operationsApi.deleteSeat,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['carriages', activeCarriageId, 'seats'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Xóa ghế thất bại')),
  })

  const openCreateForm = () => {
    setEditingSeat(null)
    form.setFieldsValue({ status: 'ACTIVE' } as SeatFormValues)
    setIsFormOpen(true)
  }

  const openEditForm = (seat: Seat) => {
    setEditingSeat(seat)
    form.setFieldsValue({
      seatTypeId: seat.seatTypeId,
      seatNumber: seat.seatNumber,
      rowNumber: seat.rowNumber ?? undefined,
      columnNumber: seat.columnNumber ?? undefined,
      floorNumber: seat.floorNumber ?? undefined,
      status: seat.status,
    })
    setIsFormOpen(true)
  }

  const confirmDelete = (seat: Seat) => {
    modal.confirm({
      title: 'Xóa mềm ghế?',
      content: `Ghế ${seat.seatNumber} sẽ không còn dùng cho dữ liệu mới.`,
      okText: 'Xóa ghế',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteSeatMutation.mutateAsync(seat.id),
    })
  }

  const actionColumn = createActionColumn<Seat>((record) => [
    { key: 'edit', icon: <EditOutlined />, tooltip: 'Sửa ghế', onClick: () => openEditForm(record) },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Xóa mềm ghế',
      danger: true,
      onClick: () => confirmDelete(record),
    },
  ])

  return (
    <>
      <PageHeader
        title="Ghế"
        description="Quản lý ghế thuộc từng toa và loại ghế áp dụng."
        extra={
          <Button type="primary" icon={<PlusOutlined />} disabled={!activeCarriageId} onClick={openCreateForm}>
            Thêm ghế
          </Button>
        }
      />

      <Card>
        <Space className="table-toolbar" wrap>
          <Select
            className="table-search"
            loading={trainsQuery.isLoading}
            options={(trainsQuery.data ?? []).map((train) => ({
              label: `${train.code} - ${train.name}`,
              value: train.id,
            }))}
            placeholder="Chọn tàu"
            value={activeTrainId}
            onChange={(value) => {
              setSelectedTrainId(value)
              setSelectedCarriageId(undefined)
            }}
          />
          <Select
            className="table-search"
            loading={carriagesQuery.isLoading}
            options={(carriagesQuery.data ?? []).map((carriage) => ({
              label: `Toa ${carriage.carriageNumber} - ${carriage.name}`,
              value: carriage.id,
            }))}
            placeholder="Chọn toa"
            value={activeCarriageId}
            onChange={setSelectedCarriageId}
          />
        </Space>

        <CoreTable<Seat>
          columns={[...columns, actionColumn]}
          dataSource={seatsQuery.data ?? []}
          headerTitle={selectedCarriage ? `Ghế thuộc ${selectedCarriage.name}` : undefined}
          loading={seatsQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingSeat ? 'Sửa ghế' : 'Thêm ghế'}
        open={isFormOpen}
        okText={editingSeat ? 'Lưu thay đổi' : 'Tạo ghế'}
        cancelText="Hủy"
        confirmLoading={saveSeatMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingSeat(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<SeatFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => saveSeatMutation.mutate(values)}
        >
          <Form.Item label="Loại ghế" name="seatTypeId" rules={[{ required: true, message: 'Vui lòng chọn loại ghế' }]}>
            <Select
              loading={seatTypesQuery.isLoading}
              options={(seatTypesQuery.data ?? []).map((seatType) => ({
                label: `${seatType.code} - ${seatType.name}`,
                value: seatType.id,
              }))}
              placeholder="Chọn loại ghế"
            />
          </Form.Item>
          <Form.Item label="Số ghế" name="seatNumber" rules={[{ required: true, message: 'Vui lòng nhập số ghế' }]}>
            <Input placeholder="A1" />
          </Form.Item>
          <Form.Item label="Dòng" name="rowNumber">
            <InputNumber className="full-width-input" min={1} />
          </Form.Item>
          <Form.Item label="Cột" name="columnNumber">
            <InputNumber className="full-width-input" min={1} />
          </Form.Item>
          <Form.Item label="Tầng" name="floorNumber">
            <InputNumber className="full-width-input" min={1} />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
