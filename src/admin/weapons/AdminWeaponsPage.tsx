import { Route, Routes } from 'react-router-dom'
import WeaponEditor from './WeaponEditor'
import WeaponList from './WeaponList'

export default function AdminWeaponsPage() {
  return (
    <Routes>
      <Route index element={<WeaponList />} />
      <Route path=":id" element={<WeaponEditor />} />
    </Routes>
  )
}
