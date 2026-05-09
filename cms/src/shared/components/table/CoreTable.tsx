import { ProTable } from '@ant-design/pro-components'
import type { ProTableProps } from '@ant-design/pro-components'

type CoreTableProps<T extends Record<string, unknown>, Params extends Record<string, unknown> = Record<string, unknown>> =
  ProTableProps<T, Params>

export function CoreTable<
  T extends Record<string, unknown>,
  Params extends Record<string, unknown> = Record<string, unknown>,
>(props: CoreTableProps<T, Params>) {
  return (
    <ProTable<T, Params>
      rowKey="id"
      search={false}
      options={false}
      cardProps={false}
      tableClassName="core-table"
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
      }}
      {...props}
    />
  )
}
