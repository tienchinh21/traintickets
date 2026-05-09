import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App as AntApp, Button, Card, Form, Input, Modal, Select, Tag } from 'antd'
import { useState } from 'react'
import { operationsApi } from '@/features/operations/api/operationsApi'
import type { Train, TrainFormValues } from '@/features/operations/types/operations.types'
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

export function TrainsPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<TrainFormValues>()
  const [editingTrain, setEditingTrain] = useState<Train | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const trainsQuery = useQuery({
    queryKey: ['trains'],
    queryFn: async () => (await operationsApi.getTrains()).data,
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

  const actionColumn = createActionColumn<Train>((record) => [
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
  ])

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
    </>
  )
}
