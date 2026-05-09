import { CalendarOutlined, DollarOutlined, TeamOutlined, TruckOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic, Tag } from 'antd'
import { PageHeader } from '@/shared/components/PageHeader'
import { CoreTable } from '@/shared/components/table'
import type { ProColumns } from '@/shared/components/table'

type RecentOrder = Record<string, unknown> & {
  id: string
  passenger: string
  route: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
}

const recentOrders: RecentOrder[] = [
  {
    id: 'TT-1024',
    passenger: 'Nguyễn Minh Anh',
    route: 'Sài Gòn - Nha Trang',
    amount: 420000,
    status: 'paid',
  },
  {
    id: 'TT-1025',
    passenger: 'Trần Quốc Huy',
    route: 'Hà Nội - Đà Nẵng',
    amount: 680000,
    status: 'pending',
  },
  {
    id: 'TT-1026',
    passenger: 'Lê Bảo Châu',
    route: 'Huế - Sài Gòn',
    amount: 740000,
    status: 'cancelled',
  },
]

const columns: ProColumns<RecentOrder>[] = [
  {
    title: 'Mã vé',
    dataIndex: 'id',
    width: 120,
  },
  {
    title: 'Hành khách',
    dataIndex: 'passenger',
    width: 180,
  },
  {
    title: 'Tuyến',
    dataIndex: 'route',
    width: 220,
  },
  {
    title: 'Giá trị',
    dataIndex: 'amount',
    align: 'right',
    width: 140,
    render: (_, record) => record.amount.toLocaleString('vi-VN'),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 150,
    render: (_, record) => {
      const colorByStatus = {
        paid: 'green',
        pending: 'gold',
        cancelled: 'red',
      }

      const labelByStatus = {
        paid: 'Đã thanh toán',
        pending: 'Chờ xử lý',
        cancelled: 'Đã hủy',
      }

      return <Tag color={colorByStatus[record.status]}>{labelByStatus[record.status]}</Tag>
    },
  },
]

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Tổng quan vận hành bán vé trong ngày." />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Vé bán hôm nay" value={128} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Doanh thu" value={84500000} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Người dùng mới" value={42} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Chuyến đang mở" value={36} prefix={<TruckOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card className="section-card" title="Đơn gần đây">
        <CoreTable<RecentOrder>
          columns={columns}
          dataSource={recentOrders}
          pagination={false}
          toolBarRender={false}
        />
      </Card>
    </>
  )
}
