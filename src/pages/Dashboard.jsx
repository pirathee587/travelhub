import React from 'react'

const StatsCard = ({icon, title, value, change, bgColor}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-gray-600 text-sm font-medium">{title}</div>
        <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
        <div className={`text-sm mt-3 font-medium ${change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{change}</div>
      </div>
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl ${bgColor}`}>{icon}</div>
    </div>
  </div>
)

const ActivityItem = ({icon, title, subtitle, badge, time}) => (
  <div className="flex items-start gap-4 pb-5 border-b border-gray-100 last:border-b-0">
    <div className="text-2xl">{icon}</div>
    <div className="flex-1">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
    </div>
    <div className="text-right">
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        badge === 'Pending' ? 'bg-orange-100 text-orange-700' :
        badge === 'Approved' ? 'bg-teal-100 text-teal-700' :
        badge === 'Rejected' ? 'bg-red-100 text-red-700' :
        'bg-emerald-100 text-emerald-700'
      }`}>{badge}</span>
      <div className="text-xs text-gray-500 mt-2">{time}</div>
    </div>
  </div>
)

export default function Dashboard(){
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-8 text-white">
        <div className="text-sm font-medium opacity-90">Welcome back, Admin</div>
        <h1 className="text-4xl font-bold mt-2">Ceylon Tourism Dashboard</h1>
        <p className="text-lg mt-3 opacity-90">Manage and monitor Sri Lanka's tourism ecosystem from one<br/>powerful platform</p>
      </div>

      {/* Pending Approvals Alert */}
      <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">⏰</div>
          <div>
            <div className="text-xl font-bold text-gray-900">Pending Approvals</div>
            <div className="text-gray-600 text-base">58 items require your attention</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white rounded-lg">
            <div className="text-xs text-gray-600">Agents</div>
            <div className="text-2xl font-bold text-gray-900">12</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg">
            <div className="text-xs text-gray-600">Hotels</div>
            <div className="text-2xl font-bold text-gray-900">8</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg">
            <div className="text-xs text-gray-600">Packages</div>
            <div className="text-2xl font-bold text-gray-900">15</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg">
            <div className="text-xs text-gray-600">Bookings</div>
            <div className="text-2xl font-bold text-gray-900">23</div>
          </div>
        </div>
      </div>

      {/* Stats Grid Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Users" 
          value="24,521" 
          change="+12% from last month"
          icon="👥"
          bgColor="bg-teal-100"
        />
        <StatsCard 
          title="Active Agents" 
          value="2,547" 
          change="+8% from last month"
          icon="📈"
          bgColor="bg-teal-100"
        />
        <StatsCard 
          title="Partner Hotels" 
          value="856" 
          change="+5% from last month"
          icon="🏢"
          bgColor="bg-teal-100"
        />
        <StatsCard 
          title="Active Packages" 
          value="1,234" 
          change="+15% from last month"
          icon="📦"
          bgColor="bg-yellow-100"
        />
      </div>

      {/* Stats Grid Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Bookings" 
          value="52,847" 
          change="+23% from last month"
          icon="📅"
          bgColor="bg-teal-100"
        />
        <StatsCard 
          title="Pending Approvals" 
          value="58" 
          change="Requires attention"
          icon="⏰"
          bgColor="bg-orange-100"
        />
        <StatsCard 
          title="Monthly Revenue" 
          value="$284,500" 
          change="+18% from last month"
          icon="💼"
          bgColor="bg-teal-100"
        />
        <StatsCard 
          title="Conversion Rate" 
          value="68%" 
          change="+5% from last month"
          icon="📈"
          bgColor="bg-teal-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Trends</h3>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {[45, 52, 62, 58, 75, 92].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-teal-600 rounded-t" style={{height: `${height*2}px`}}></div>
                <span className="text-xs text-gray-600">{'Jan Feb Mar Apr May Jun'.split(' ')[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Overview Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[12000, 14500, 17000, 17500, 15500, 21000].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 relative">
                <div className="w-1.5 bg-orange-400 rounded-full" style={{height: `${Math.min(value/1000, 250)}px`}}></div>
                <span className="text-xs text-gray-600">{'Jan Feb Mar Apr May Jun'.split(' ')[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity and Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            <ActivityItem 
              icon="📅"
              title="New agent registration"
              subtitle="Pinnacle Tours"
              badge="Pending"
              time="2 min ago"
            />
            <ActivityItem 
              icon="📅"
              title="Hotel approved"
              subtitle="Cinnamon Lakeside"
              badge="Approved"
              time="15 min ago"
            />
            <ActivityItem 
              icon="📅"
              title="Package rejected"
              subtitle="Extreme Rafting"
              badge="Rejected"
              time="1 hour ago"
            />
            <ActivityItem 
              icon="📅"
              title="Booking completed"
              subtitle="BK-2024-001"
              badge="Completed"
              time="2 hours ago"
            />
          </div>
          <button className="w-full mt-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition">View All Activity →</button>
        </div>

        {/* Package Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Package Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Pie Chart Placeholder */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="20" strokeDasharray="75.4 251.2" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" strokeWidth="20" strokeDasharray="70.7 251.2" strokeDashoffset="-75.4" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="50.24 251.2" strokeDashoffset="-146.1" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="35.28 251.2" strokeDashoffset="-196.34" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#d946ef" strokeWidth="20" strokeDasharray="20.08 251.2" strokeDashoffset="-231.62" />
              </svg>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-600 rounded-full"></div><span className="text-sm font-medium text-gray-700">Cultural Tours 38%</span></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div><span className="text-sm font-medium text-gray-700">Adventure 28%</span></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-sm font-medium text-gray-700">Beach Tours 20%</span></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-sm font-medium text-gray-700">Wildlife Safari 18%</span></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded-full"></div><span className="text-sm font-medium text-gray-700">Wellness 8%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
