import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  App as AntApp,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { operationsApi } from '@/features/operations/api/operationsApi'
import type {
  Route,
  Station,
  Train,
  Trip,
  TripFormValues,
  TripQuery,
  TripSearchPayload,
  TripStatus,
  TripStop,
} from '@/features/operations/types/operations.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable, createActionColumn } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

type TripFormModel = Omit<TripFormValues, 'serviceDate'> & {
  serviceDate?: Dayjs
}

type TripFilterForm = Omit<TripQuery, 'page' | 'limit' | 'serviceDate'> & {
  serviceDate?: Dayjs
}

type TripSearchForm = Omit<TripSearchPayload, 'page' | 'limit' | 'serviceDate'> & {
  serviceDate?: Dayjs
}

const defaultTripQuery: Required<Pick<TripQuery, 'page' | 'limit'>> = {
  page: 1,
  limit: 20,
}

const defaultTripSearchPage = {
  page: 1,
  limit: 10,
}

const tripStatusOptions: Array<{ label: string; value: TripStatus }> = [
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Đang mở bán', value: 'OPEN' },
  { label: 'Đã đóng', value: 'CLOSED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
]

const tripStatusMeta: Record<TripStatus, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: 'Nháp' },
  OPEN: { color: 'green', label: 'Đang mở bán' },
  CLOSED: { color: 'gold', label: 'Đã đóng' },
  CANCELLED: { color: 'red', label: 'Đã hủy' },
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('vi-VN') : '-'
}

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('vi-VN') : '-'
}

function toDateParam(value?: Dayjs | null) {
  return value ? value.format('YYYY-MM-DD') : undefined
}

function buildTripPayload(values: TripFormModel): TripFormValues {
  const code = values.code?.trim()

  return {
    routeId: values.routeId,
    trainId: values.trainId,
    ...(code ? { code } : {}),
    serviceDate: toDateParam(values.serviceDate) ?? '',
    status: values.status,
  }
}

function toRouteOptions(routes: Route[]) {
  return routes
    .filter((route) => route.status === 'ACTIVE')
    .map((route) => ({
      label: `${route.code} - ${route.name}`,
      value: route.id,
    }))
}

function toTrainOptions(trains: Train[]) {
  return trains
    .filter((train) => train.status === 'ACTIVE')
    .map((train) => ({
      label: `${train.code} - ${train.name}`,
      value: train.id,
    }))
}

function toStationOptions(stations: Station[]) {
  return stations
    .filter((station) => station.status === 'ACTIVE')
    .map((station) => ({
      label: `${station.code} - ${station.name}`,
      value: station.id,
    }))
}

export function TripsPage() {
  const { message, modal } = AntApp.useApp()
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<TripFormModel>()
  const [filterForm] = Form.useForm<TripFilterForm>()
  const [searchForm] = Form.useForm<TripSearchForm>()
  const [query, setQuery] = useState<TripQuery>(defaultTripQuery)
  const [searchQuery, setSearchQuery] = useState<TripSearchPayload | null>(null)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [detailTripId, setDetailTripId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isTripCodeManual, setIsTripCodeManual] = useState(false)
  const canGenerateTripCode = hasPermission('TRIPS_CREATE')

  const tripsQuery = useQuery({
    queryKey: ['trips', query],
    queryFn: async () => operationsApi.getTrips(query),
  })

  const routesQuery = useQuery({
    queryKey: ['routes'],
    queryFn: async () => (await operationsApi.getRoutes()).data,
  })

  const trainsQuery = useQuery({
    queryKey: ['trains'],
    queryFn: async () => (await operationsApi.getTrains()).data,
  })

  const stationsQuery = useQuery({
    queryKey: ['stations'],
    queryFn: async () => (await operationsApi.getStations()).data,
  })

  const detailTripQuery = useQuery({
    queryKey: ['trips', detailTripId],
    enabled: Boolean(detailTripId),
    queryFn: async () => (await operationsApi.getTrip(detailTripId ?? '')).data,
  })

  const searchTripsQuery = useQuery({
    queryKey: ['trips', 'search', searchQuery],
    enabled: Boolean(searchQuery),
    queryFn: async () => operationsApi.searchTrips(searchQuery as TripSearchPayload),
  })

  const routeOptions = toRouteOptions(routesQuery.data ?? [])
  const trainOptions = toTrainOptions(trainsQuery.data ?? [])
  const stationOptions = toStationOptions(stationsQuery.data ?? [])

  const columns: ProColumns<Trip>[] = [
    {
      title: 'Mã chuyến',
      dataIndex: 'code',
      width: 160,
      render: (_, record) => <span className="table-code">{record.code}</span>,
    },
    {
      title: 'Tuyến',
      dataIndex: 'route',
      width: 260,
      render: (_, record) => `${record.route?.code ?? '-'} - ${record.route?.name ?? record.routeId}`,
    },
    {
      title: 'Tàu',
      dataIndex: 'train',
      width: 220,
      render: (_, record) => `${record.train?.code ?? '-'} - ${record.train?.name ?? record.trainId}`,
    },
    {
      title: 'Ngày chạy',
      dataIndex: 'serviceDate',
      width: 140,
      render: (_, record) => formatDate(record.serviceDate),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (_, record) => {
        const meta = tripStatusMeta[record.status]
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 180,
      render: (_, record) => formatDateTime(record.createdAt),
    },
  ]

  const stopColumns: ProColumns<TripStop>[] = [
    {
      title: 'Thứ tự',
      dataIndex: 'stopOrder',
      width: 90,
    },
    {
      title: 'Mã ga',
      dataIndex: ['station', 'code'],
      width: 120,
      render: (_, record) => <span className="table-code">{record.station.code}</span>,
    },
    {
      title: 'Tên ga',
      dataIndex: ['station', 'name'],
      width: 220,
      render: (_, record) => record.station.name,
    },
    {
      title: 'Giờ đến',
      dataIndex: 'scheduledArrivalAt',
      width: 180,
      render: (_, record) => formatDateTime(record.scheduledArrivalAt),
    },
    {
      title: 'Giờ đi',
      dataIndex: 'scheduledDepartureAt',
      width: 180,
      render: (_, record) => formatDateTime(record.scheduledDepartureAt),
    },
    {
      title: 'Km từ đầu',
      dataIndex: 'distanceFromStartKm',
      width: 120,
      render: (_, record) => `${record.distanceFromStartKm} km`,
    },
  ]

  const saveTripMutation = useMutation({
    mutationFn: async (values: TripFormModel) => {
      const payload = buildTripPayload(values)

      if (editingTrip) {
        return operationsApi.updateTrip(editingTrip.id, payload)
      }

      return operationsApi.createTrip(payload)
    },
    onSuccess: async (response) => {
      message.success(response.message)
      setIsFormOpen(false)
      setEditingTrip(null)
      form.resetFields()
      await queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Lưu chuyến thất bại')),
  })

  const deleteTripMutation = useMutation({
    mutationFn: operationsApi.deleteTrip,
    onSuccess: async (response) => {
      message.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
    onError: (error) => message.error(getApiErrorMessage(error, 'Xóa chuyến thất bại')),
  })

  const generateTripCodeMutation = useMutation({
    mutationFn: operationsApi.generateTripCode,
  })

  const generateTripCode = async (showSuccess = false) => {
    if (!canGenerateTripCode) return

    const { trainId, serviceDate } = form.getFieldsValue(['trainId', 'serviceDate'])
    const serviceDateValue = toDateParam(serviceDate)

    if (!trainId || !serviceDateValue) {
      if (showSuccess) {
        message.warning('Vui lòng chọn tàu và ngày chạy trước khi tạo mã')
      }
      return
    }

    try {
      const response = await generateTripCodeMutation.mutateAsync({
        trainId,
        serviceDate: serviceDateValue,
      })

      form.setFieldValue('code', response.data.code)
      if (showSuccess) {
        message.success(response.message)
      }
    } catch (error) {
      if (showSuccess) {
        message.error(getApiErrorMessage(error, 'Tạo mã chuyến thất bại'))
      }
    }
  }

  const openCreateForm = () => {
    setEditingTrip(null)
    setIsTripCodeManual(false)
    form.resetFields()
    form.setFieldsValue({
      status: 'DRAFT',
      serviceDate: dayjs(),
    } as TripFormModel)
    setIsFormOpen(true)
  }

  const openEditForm = (trip: Trip) => {
    setEditingTrip(trip)
    setIsTripCodeManual(false)
    form.setFieldsValue({
      routeId: trip.routeId,
      trainId: trip.trainId,
      code: trip.code,
      serviceDate: dayjs(trip.serviceDate),
      status: trip.status,
    })
    setIsFormOpen(true)
  }

  const confirmDelete = (trip: Trip) => {
    modal.confirm({
      title: 'Xóa mềm chuyến?',
      content: `Chuyến ${trip.code} sẽ không còn hiển thị trong danh sách vận hành.`,
      okText: 'Xóa chuyến',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => deleteTripMutation.mutateAsync(trip.id),
    })
  }

  const handleFilter = (values: TripFilterForm) => {
    setQuery({
      ...defaultTripQuery,
      search: values.search?.trim() || undefined,
      status: values.status,
      routeId: values.routeId,
      trainId: values.trainId,
      serviceDate: toDateParam(values.serviceDate),
    })
  }

  const resetFilter = () => {
    filterForm.resetFields()
    setQuery(defaultTripQuery)
  }

  const handleTripSearch = (values: TripSearchForm) => {
    if (values.fromStationId === values.toStationId) {
      message.warning('Ga đi và ga đến phải khác nhau')
      return
    }

    setSearchQuery({
      ...defaultTripSearchPage,
      fromStationId: values.fromStationId ?? '',
      toStationId: values.toStationId ?? '',
      serviceDate: toDateParam(values.serviceDate) ?? '',
      status: values.status,
    })
  }

  const resetTripSearch = () => {
    searchForm.resetFields()
    setSearchQuery(null)
  }

  const actionColumn = createActionColumn<Trip>((record) => [
    {
      key: 'detail',
      icon: <EyeOutlined />,
      tooltip: 'Xem chi tiết chuyến',
      onClick: () => setDetailTripId(record.id),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      tooltip: 'Sửa chuyến',
      onClick: () => openEditForm(record),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      tooltip: 'Xóa mềm chuyến',
      danger: true,
      onClick: () => confirmDelete(record),
    },
  ], 136)

  const detailTrip = detailTripQuery.data

  return (
    <>
      <PageHeader
        title="Chuyến"
        description="Quản lý chuyến tàu theo tuyến, tàu và ngày chạy."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
            Thêm chuyến
          </Button>
        }
      />

      <Card>
        <Form form={filterForm} layout="inline" className="table-filter-bar" onFinish={handleFilter}>
          <Form.Item name="search">
            <Input.Search allowClear placeholder="Tìm mã chuyến" onSearch={() => filterForm.submit()} />
          </Form.Item>
          <Form.Item name="status">
            <Select allowClear options={tripStatusOptions} placeholder="Trạng thái" style={{ width: 170 }} />
          </Form.Item>
          <Form.Item name="routeId">
            <Select
              allowClear
              loading={routesQuery.isLoading}
              options={routeOptions}
              placeholder="Tuyến"
              showSearch
              optionFilterProp="label"
              style={{ width: 220 }}
            />
          </Form.Item>
          <Form.Item name="trainId">
            <Select
              allowClear
              loading={trainsQuery.isLoading}
              options={trainOptions}
              placeholder="Tàu"
              showSearch
              optionFilterProp="label"
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="serviceDate">
            <DatePicker format="DD/MM/YYYY" placeholder="Ngày chạy" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
              <Button onClick={resetFilter}>Đặt lại</Button>
            </Space>
          </Form.Item>
        </Form>

        <CoreTable<Trip>
          columns={[...columns, actionColumn]}
          dataSource={tripsQuery.data?.data ?? []}
          loading={tripsQuery.isLoading}
          pagination={{
            current: tripsQuery.data?.meta.page ?? query.page,
            pageSize: tripsQuery.data?.meta.limit ?? query.limit,
            total: tripsQuery.data?.meta.total ?? 0,
            showSizeChanger: true,
            onChange: (page, limit) => setQuery((current) => ({ ...current, page, limit })),
          }}
        />
      </Card>

      <Card className="section-card" title="Tìm chuyến theo ga đi/ga đến">
        <Form form={searchForm} layout="inline" className="table-filter-bar" onFinish={handleTripSearch}>
          <Form.Item
            name="fromStationId"
            rules={[{ required: true, message: 'Chọn ga đi' }]}
          >
            <Select
              loading={stationsQuery.isLoading}
              options={stationOptions}
              placeholder="Ga đi"
              showSearch
              optionFilterProp="label"
              style={{ width: 220 }}
            />
          </Form.Item>
          <Form.Item
            name="toStationId"
            rules={[{ required: true, message: 'Chọn ga đến' }]}
          >
            <Select
              loading={stationsQuery.isLoading}
              options={stationOptions}
              placeholder="Ga đến"
              showSearch
              optionFilterProp="label"
              style={{ width: 220 }}
            />
          </Form.Item>
          <Form.Item
            name="serviceDate"
            rules={[{ required: true, message: 'Chọn ngày chạy' }]}
          >
            <DatePicker format="DD/MM/YYYY" placeholder="Ngày chạy" />
          </Form.Item>
          <Form.Item name="status">
            <Select allowClear options={tripStatusOptions} placeholder="Trạng thái" style={{ width: 170 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                Tìm chuyến
              </Button>
              <Button onClick={resetTripSearch}>Đặt lại</Button>
            </Space>
          </Form.Item>
        </Form>

        <CoreTable<Trip>
          columns={[...columns, actionColumn]}
          dataSource={searchTripsQuery.data?.data ?? []}
          loading={searchTripsQuery.isLoading}
          locale={{ emptyText: searchQuery ? 'Không tìm thấy chuyến phù hợp' : 'Nhập ga đi, ga đến và ngày chạy để tìm chuyến' }}
          pagination={searchQuery ? {
            current: searchTripsQuery.data?.meta.page ?? searchQuery.page,
            pageSize: searchTripsQuery.data?.meta.limit ?? searchQuery.limit,
            total: searchTripsQuery.data?.meta.total ?? 0,
            showSizeChanger: true,
            onChange: (page, limit) => setSearchQuery((current) => current ? ({ ...current, page, limit }) : current),
          } : false}
          toolBarRender={false}
        />
      </Card>

      <Modal
        title={editingTrip ? 'Sửa chuyến' : 'Thêm chuyến'}
        open={isFormOpen}
        okText={editingTrip ? 'Lưu thay đổi' : 'Tạo chuyến'}
        cancelText="Hủy"
        confirmLoading={saveTripMutation.isPending}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingTrip(null)
          setIsTripCodeManual(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form<TripFormModel>
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (isTripCodeManual) return
            if ('trainId' in changedValues || 'serviceDate' in changedValues) {
              void generateTripCode(false)
            }
          }}
          onFinish={(values) => saveTripMutation.mutate(values)}
        >
          <Form.Item label="Tuyến" name="routeId" rules={[{ required: true, message: 'Vui lòng chọn tuyến' }]}>
            <Select
              loading={routesQuery.isLoading}
              options={routeOptions}
              placeholder="Chọn tuyến đang hoạt động"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Tàu" name="trainId" rules={[{ required: true, message: 'Vui lòng chọn tàu' }]}>
            <Select
              loading={trainsQuery.isLoading}
              options={trainOptions}
              placeholder="Chọn tàu đang hoạt động"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Ngày chạy" name="serviceDate" rules={[{ required: true, message: 'Vui lòng chọn ngày chạy' }]}>
            <DatePicker className="full-width-input" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Mã chuyến">
            <Space.Compact className="full-width-input">
              <Form.Item name="code" noStyle>
                <Input
                  readOnly={!isTripCodeManual}
                  placeholder="BE tự tạo nếu để trống"
                />
              </Form.Item>
              <Button
                icon={<ReloadOutlined />}
                loading={generateTripCodeMutation.isPending}
                disabled={!canGenerateTripCode}
                onClick={() => void generateTripCode(true)}
              >
                Tạo lại mã
              </Button>
            </Space.Compact>
            <div className="form-inline-note">
              <Space size={8}>
                <Typography.Text type="secondary">Sửa mã thủ công</Typography.Text>
                <Switch
                  size="small"
                  checked={isTripCodeManual}
                  onChange={(checked) => {
                    setIsTripCodeManual(checked)
                    if (!checked) {
                      void generateTripCode(false)
                    }
                  }}
                />
              </Space>
              <Typography.Text type="secondary">
                Mã chỉ là gợi ý, backend vẫn kiểm tra format và chống trùng khi lưu.
              </Typography.Text>
            </div>
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={tripStatusOptions} />
          </Form.Item>
          {editingTrip && (
            <Typography.Text type="secondary">
              Đổi tuyến hoặc ngày chạy sẽ khiến backend tạo lại danh sách ga dừng của chuyến từ cấu hình tuyến.
            </Typography.Text>
          )}
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết chuyến"
        open={Boolean(detailTripId)}
        width={980}
        onClose={() => setDetailTripId(null)}
      >
        {detailTrip && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã chuyến">
                <span className="table-code">{detailTrip.code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={tripStatusMeta[detailTrip.status].color}>
                  {tripStatusMeta[detailTrip.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tuyến">
                {detailTrip.route.code} - {detailTrip.route.name}
              </Descriptions.Item>
              <Descriptions.Item label="Tàu">
                {detailTrip.train.code} - {detailTrip.train.name}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chạy">{formatDate(detailTrip.serviceDate)}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{formatDateTime(detailTrip.createdAt)}</Descriptions.Item>
            </Descriptions>

            <div className="train-detail-seats">
              <CoreTable<TripStop>
                columns={stopColumns}
                dataSource={detailTrip.stops ?? []}
                loading={detailTripQuery.isLoading}
                pagination={false}
                headerTitle="Danh sách ga dừng"
                toolBarRender={false}
              />
            </div>
          </>
        )}
      </Drawer>
    </>
  )
}
