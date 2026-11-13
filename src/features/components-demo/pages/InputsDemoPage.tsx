import { SearchOutlined } from '@ant-design/icons'
import {
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Space,
  Switch,
} from 'antd'
import { useTranslation } from 'react-i18next'
import DemoSection from '../components/DemoSection'

const stack = { display: 'flex', maxWidth: 420 } as const

export default function InputsDemoPage() {
  const { t } = useTranslation('components')
  const options = [
    { value: 'a', label: t('inputs.optionA') },
    { value: 'b', label: t('inputs.optionB') },
    { value: 'c', label: t('inputs.optionC') },
  ]

  return (
    <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
      <DemoSection
        title={t('inputs.textTitle')}
        description={t('inputs.textDesc')}
        code={`<Input placeholder="..." allowClear />
<Input.Password />
<Input.TextArea rows={3} showCount maxLength={100} />
<Input.Search enterButton />
<InputNumber min={0} max={100} />`}
      >
        <Space orientation="vertical" style={stack}>
          <Input allowClear placeholder={t('inputs.placeholder')} />
          <Input.Password placeholder="Password" />
          <Input prefix={<SearchOutlined />} suffix="RMB" placeholder={t('inputs.placeholder')} />
          <Input.TextArea
            rows={3}
            showCount
            maxLength={100}
            placeholder={t('inputs.placeholder')}
          />
          <Input.Search enterButton placeholder={t('inputs.placeholder')} />
          <InputNumber min={0} max={100} defaultValue={10} />
        </Space>
      </DemoSection>

      <DemoSection
        title={t('inputs.selectTitle')}
        description={t('inputs.selectDesc')}
        code={`<Select options={options} allowClear />
<Select mode="multiple" options={options} />
<Radio.Group options={options} />
<Checkbox.Group options={options} />
<Switch defaultChecked />
<Slider defaultValue={30} />`}
      >
        <Space orientation="vertical" style={stack}>
          <Select allowClear showSearch placeholder={t('inputs.pleaseSelect')} options={options} />
          <Select mode="multiple" placeholder={t('inputs.pleaseSelect')} options={options} />
          <Radio.Group defaultValue="a" options={options} />
          <Checkbox.Group defaultValue={['a']} options={options} />
          <Switch defaultChecked />
          <Slider defaultValue={30} />
        </Space>
      </DemoSection>

      <DemoSection
        title={t('inputs.dateTitle')}
        description={t('inputs.dateDesc')}
        code={`<DatePicker />
<DatePicker.RangePicker />
<DatePicker showTime />`}
      >
        <Space wrap>
          <DatePicker />
          <DatePicker showTime />
          <DatePicker.RangePicker />
        </Space>
      </DemoSection>

      <DemoSection
        title={t('inputs.stateTitle')}
        description={t('inputs.stateDesc')}
        code={`<Input size="large" /> <Input /> <Input size="small" />
<Input status="error" /> <Input status="warning" /> <Input disabled />`}
      >
        <Space orientation="vertical" style={stack}>
          <Input size="large" placeholder="large" />
          <Input placeholder="middle" />
          <Input size="small" placeholder="small" />
          <Input status="error" placeholder="error" />
          <Input status="warning" placeholder="warning" />
          <Input disabled placeholder="disabled" />
          <Select disabled placeholder="disabled" options={options} />
        </Space>
      </DemoSection>
    </Space>
  )
}
