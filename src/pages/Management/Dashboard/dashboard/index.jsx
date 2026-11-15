import {
  DashboardHeader,
  DashboardKpiCards,
  AdmissionsTrendsChart,
  UserRolesChart,
  FeeCollectionChart,
  RecentActivityCard,
  TeacherDistributionChart,
} from "./subcompoenets";

function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <DashboardKpiCards />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdmissionsTrendsChart />
        <UserRolesChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FeeCollectionChart />
        <RecentActivityCard />
      </div>

      <TeacherDistributionChart />
    </div>
  );
}

export default Dashboard;
