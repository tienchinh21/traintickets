import type { ProColumns } from '@ant-design/pro-components'
import { Button, Space, Tooltip } from 'antd'
import type { ButtonProps } from 'antd'
import type { Key, ReactNode } from 'react'

type ActionItem<T> = {
  key: Key
  icon: ReactNode
  tooltip: string
  danger?: boolean
  disabled?: boolean
  type?: ButtonProps['type']
  onClick: (record: T) => void
}

export function createActionColumn<T extends Record<string, unknown>>(
  actions: (record: T) => ActionItem<T>[],
  width = 112,
): ProColumns<T> {
  return {
    title: 'Thao tác',
    key: 'actions',
    valueType: 'option',
    fixed: 'right',
    width,
    align: 'center',
    search: false,
    render: (_, record) => (
      <Space size={4} className="core-table-actions">
        {actions(record).map((action) => (
          <Tooltip key={action.key} title={action.tooltip} placement="top">
            <Button
              aria-label={action.tooltip}
              danger={action.danger}
              disabled={action.disabled}
              icon={action.icon}
              shape="circle"
              size="small"
              type={action.type ?? 'text'}
              onClick={() => action.onClick(record)}
            />
          </Tooltip>
        ))}
      </Space>
    ),
  }
}
