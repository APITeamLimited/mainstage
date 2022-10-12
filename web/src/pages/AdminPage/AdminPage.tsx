import { AdminGuard } from './components/AdminGuard'
import { ReactAdmin } from './components/ReactAdmin'

const AdminPage = () => {
  return (
    <AdminGuard>
      <ReactAdmin />
    </AdminGuard>
  )
}

export default AdminPage
