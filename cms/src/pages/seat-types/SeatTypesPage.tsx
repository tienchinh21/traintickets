import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Form, Input, InputNumber, Modal, Select, Tag } from 'antd'
import { useState } from 'react'
import { operationsApi } from '@/features/operations/api/operationsApi'
import {
  carriageTypeOptions,
  getCarriageTypeMeta,
} from '@/features/operations/constants/carriage.constants'
import type { SeatType, SeatTypeFormValues } from '@/features/operations/types/operations.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const columns: ProColumns<SeatType>[] = [
  {
    title: 'Mã loại ghế',
    dataIndex: 'code',
    width: 180,
    render: (_, record) => <span className="table-code">{record.code}</span>,
  },
  {
    title: 'Tên loại ghế',
    dataIndex: 'name',
    width: 220,
  },
  {
    title: 'Hệ số giá',
    dataIndex: 'baseMultiplier',
    width: 120,
    render: (_, record) => Number(record.baseMultiplier).toLocaleString('vi-VN'),
  },
  {
    title: 'Dùng cho loại toa',
    dataIndex: 'allowedCarriageTypes',
    width: 260,
    render: (_, record) => (
      <>
        {record.allowedCarriageTypes.map((type) => {
          const meta = getCarriageTypeMeta(type)
          return (
            <Tag key={type} color={meta.color}>
              {meta.label}
            </Tag>
          )
        })}
      </>
    ),
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

export function SeatTypesPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<SeatTypeFormValues>()
  const [editingSeatType, setEditingSeatType] = useState<SeatType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const seatTypesQuery = useQuery({
    queryKey: ['seat-types'],
    queryFn: async () => (await operationsApi.getSeatTypes()).data,
  })

  const saveSeatTypeMutation = useMutation({
    mutationFn: async (values: SeatTypeFormValues) => {
      if (editingSeatType) {
        return operationsApi.updateSeatType(editingSeatType.id, values)
      }

      return operationsApi.createSeatType(values)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingSeatType(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['seat-types'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu loại ghế thất bại')),
  })

  const deleteSeatTypeMutation = useMutation({
    mutationFn: operationsApi.deleteSeatType,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['seat-types'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Vô hiệu hóa loại ghế thất bại')),
  })

  const openCreateForm = () => {
    setEditingSeatType(null)
    form.setFieldsValue({ status: 'ACTIVE' } as SeatTypeFormValues)
    setIsFormOpen(true)
  }

  const openEditForm = (seatType: SeatType) => {
    setEditingSeatType(seatType)
    form.setFieldsValue({
      code: seatType.code,
      name: seatType.name,
      description: seatType.description ?? undefined,
      baseMultiplier: Number(seatType.baseMultiplier),
      allowedCarriageTypes: seatType.allowedCarriageTypes,
      status: seatType.status,
    })
    setIsFormOpen(true)
  }

  const confirmDelete = (seatType: SeatType) => {
    modal.confirm({
      title: 'Vô hiệu hóa loại ghế?',
      content: `Loại ghế ${seatType.name} sẽ không dùng cho ghế mới.`,
      okText: 'Vô hiệu hóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteSeatTypeMutation.mutateAsync(seatType.id),
    })
  }

  const actionColumn = createActionColumn<SeatType>((record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa loại ghế',
      onClick: () => openEditForm(record),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Vô hiệu hóa loại ghế',
      danger: true,
      onClick: () => confirmDelete(record),
    },
  ])

  return (
    <>
      <PageHeader
        title="Loại ghế"
        description="Quản lý hạng ghế và hệ số giá dùng cho ghế trên tàu."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm loại ghế
          </Button>
        }
      />

      <Card>
        <CoreTable<SeatType>
          columns={[...columns, actionColumn]}
          dataSource={seatTypesQuery.data ?? []}
          loading={seatTypesQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingSeatType ? 'Sửa loại ghế' : 'Thêm loại ghế'}
        open={isFormOpen}
        okText={editingSeatType ? 'Lưu thay đổi' : 'Tạo loại ghế'}
        cancelText="Hủy"
        confirmLoading={saveSeatTypeMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingSeatType(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<SeatTypeFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => saveSeatTypeMutation.mutate(values)}
        >
          <Form.Item label="Mã loại ghế" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã loại ghế' }]}>
            <Input placeholder="SOFT_SEAT" />
          </Form.Item>
          <Form.Item label="Tên loại ghế" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên loại ghế' }]}>
            <Input placeholder="Ghế mềm" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả tiện ích hoặc điều kiện" />
          </Form.Item>
          <Form.Item
            label="Hệ số giá"
            name="baseMultiplier"
            rules={[{ required: true, message: 'Vui lòng nhập hệ số giá' }]}
          >
            <InputNumber className="full-width-input" min={0.1} step={0.1} />
          </Form.Item>
          <Form.Item
            label="Dùng cho loại toa"
            name="allowedCarriageTypes"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một loại toa' }]}
          >
            <Select
              mode="multiple"
              options={carriageTypeOptions}
              placeholder="Chọn loại toa được phép dùng loại ghế này"
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
