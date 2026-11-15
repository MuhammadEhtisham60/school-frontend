import {
  DashboardHeader,
  DashboardKpiCards,
  AdmissionsTrendsChart,
  UserRolesChart,
  FeeCollectionChart,
  RecentActivityCard,
  TeacherDistributionChart,
  UpcomingEventsCard,
  RecentNoticesCard,
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
            <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingEventsCard />
        <RecentNoticesCard />
      </div>
    </div>
  );
}

export default Dashboard;
