import { Route, Routes } from 'react-router-dom'
import SlotEditor from './SlotEditor'
import SlotList from './SlotList'

export default function AdminEquipmentPage() {
  return (
    <Routes>
      <Route index element={<SlotList />} />
      <Route path=":id" element={<SlotEditor />} />
    </Routes>
  )
}
