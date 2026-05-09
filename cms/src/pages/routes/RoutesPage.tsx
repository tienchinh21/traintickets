import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
} from 'antd'
import { useState } from 'react'
import { operationsApi } from '@/features/operations/api/operationsApi'
import type { Route, RouteFormValues } from '@/features/operations/types/operations.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

const statusOptions = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Tạm khóa', value: 'INACTIVE' },
]

const columns: ProColumns<Route>[] = [
  {
    title: 'Mã tuyến',
    dataIndex: 'code',
    width: 140,
    render: (_, record) => <span className="table-code">{record.code}</span>,
  },
  {
    title: 'Tên tuyến',
    dataIndex: 'name',
    width: 240,
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
    width: 150,
    render: (_, record) => (
      <Tag color={record.status === 'ACTIVE' ? 'green' : 'red'}>
        {record.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
      </Tag>
    ),
  },
]

export function RoutesPage() {
  const { message, modal } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<RouteFormValues>()
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const routesQuery = useQuery({
    queryKey: ['routes'],
    queryFn: async () => (await operationsApi.getRoutes()).data,
  })

  const stationsQuery = useQuery({
    queryKey: ['stations'],
    queryFn: async () => (await operationsApi.getStations()).data,
  })

  const saveRouteMutation = useMutation({
    mutationFn: async (values: RouteFormValues) => {
      if (editingRoute) {
        return operationsApi.updateRoute(editingRoute.id, values)
      }

      return operationsApi.createRoute(values)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingRoute(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['routes'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu tuyến thất bại')),
  })

  const deleteRouteMutation = useMutation({
    mutationFn: operationsApi.deleteRoute,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['routes'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Xóa tuyến thất bại')),
  })

  const openCreateForm = () => {
    setEditingRoute(null)
    form.setFieldsValue({
      status: 'ACTIVE',
      stops: [
        { stopOrder: 1, distanceFromStartKm: 0 },
        { stopOrder: 2, distanceFromStartKm: 0 },
      ],
    } as RouteFormValues)
    setIsFormOpen(true)
  }

  const openEditForm = async (route: Route) => {
    try {
      const response = await operationsApi.getRoute(route.id)
      setEditingRoute(route)
      form.setFieldsValue({
        code: response.data.code,
        name: response.data.name,
        description: response.data.description ?? undefined,
        status: response.data.status,
        stops: response.data.stops.map((stop) => ({
          stationId: stop.stationId,
          stopOrder: stop.stopOrder,
          distanceFromStartKm: Number(stop.distanceFromStartKm),
          defaultArrivalOffsetMinutes: stop.defaultArrivalOffsetMinutes ?? undefined,
          defaultDepartureOffsetMinutes: stop.defaultDepartureOffsetMinutes ?? undefined,
        })),
      })
      setIsFormOpen(true)
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không tải được chi tiết tuyến'))
    }
  }

  const confirmDelete = (route: Route) => {
    modal.confirm({
      title: 'Xóa mềm tuyến?',
      content: `Tuyến ${route.name} sẽ không còn dùng cho dữ liệu mới.`,
      okText: 'Xóa tuyến',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteRouteMutation.mutateAsync(route.id),
    })
  }

  const actionColumn = createActionColumn<Route>((record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa tuyến',
      onClick: () => void openEditForm(record),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Xóa mềm tuyến',
      danger: true,
      onClick: () => confirmDelete(record),
    },
  ])

  return (
    <>
      <PageHeader
        title="Tuyến"
        description="Quản lý tuyến tàu và thứ tự các ga dừng trên tuyến."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm tuyến
          </Button>
        }
      />

      <Card>
        <CoreTable<Route>
          columns={[...columns, actionColumn]}
          dataSource={routesQuery.data ?? []}
          loading={routesQuery.isLoading}
        />
      </Card>

      <Modal
        title={editingRoute ? 'Sửa tuyến' : 'Thêm tuyến'}
        open={isFormOpen}
        okText={editingRoute ? 'Lưu thay đổi' : 'Tạo tuyến'}
        cancelText="Hủy"
        width={860}
        confirmLoading={saveRouteMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingRoute(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<RouteFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => saveRouteMutation.mutate(values)}
        >
          <Form.Item label="Mã tuyến" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã tuyến' }]}>
            <Input placeholder="HN-DN" />
          </Form.Item>
          <Form.Item label="Tên tuyến" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên tuyến' }]}>
            <Input placeholder="Hà Nội - Đà Nẵng" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả tuyến" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={statusOptions} />
          </Form.Item>

          <Form.List
            name="stops"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value.length < 2) {
                    throw new Error('Tuyến phải có ít nhất 2 ga dừng')
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div className="route-stops">
                <div className="route-stops-header">
                  <span>Ga dừng</span>
                  <Button size="small" icon={<PlusOutlined />} onClick={() => add({ stopOrder: fields.length + 1 })}>
                    Thêm ga dừng
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Space className="route-stop-row" align="baseline" key={field.key} wrap>
                    <Form.Item
                      label="Ga"
                      name={[field.name, 'stationId']}
                      rules={[{ required: true, message: 'Chọn ga' }]}
                    >
                      <Select
                        className="route-stop-station"
                        loading={stationsQuery.isLoading}
                        options={(stationsQuery.data ?? []).map((station) => ({
                          label: `${station.code} - ${station.name}`,
                          value: station.id,
                        }))}
                        placeholder="Chọn ga"
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                    <Form.Item label="Thứ tự" name={[field.name, 'stopOrder']} initialValue={index + 1}>
                      <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item
                      label="Km từ đầu"
                      name={[field.name, 'distanceFromStartKm']}
                      rules={[{ required: true, message: 'Nhập km' }]}
                    >
                      <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item label="Đến sau phút" name={[field.name, 'defaultArrivalOffsetMinutes']}>
                      <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item label="Rời sau phút" name={[field.name, 'defaultDepartureOffsetMinutes']}>
                      <InputNumber min={0} />
                    </Form.Item>
                    <Button danger disabled={fields.length <= 2} onClick={() => remove(field.name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}
                <Form.ErrorList errors={errors} />
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  )
}
