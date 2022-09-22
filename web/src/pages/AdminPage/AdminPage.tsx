import { AdminGuard } from '../../components/admin/AdminGuard'
import { ReactAdmin } from '../../components/admin/ReactAdmin'

const AdminPage = () => {
  return (
    <AdminGuard>
      <ReactAdmin />
    </AdminGuard>
  )
}

export default AdminPage
