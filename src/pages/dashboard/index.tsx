import { useState } from "react";
import { BarChart, LineChart, PieChart, Activity, ArrowDown, ArrowUp, Download } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    isPositive: boolean;
  };
  color: "blue" | "purple" | "yellow" | "red";
  icon: React.ReactNode;
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "month" | "year">("month");

  const stats: StatCardProps[] = [
    {
      title: "Pengguna",
      value: "26K",
      change: {
        value: "12.4%",
        isPositive: false,
      },
      color: "purple",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      title: "Pendapatan",
      value: "$6,200",
      change: {
        value: "40.9%",
        isPositive: true,
      },
      color: "blue",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Tingkat Konversi",
      value: "2.49%",
      change: {
        value: "84.7%",
        isPositive: true,
      },
      color: "yellow",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: "Sesi",
      value: "44K",
      change: {
        value: "23.6%",
        isPositive: false,
      },
      color: "red",
      icon: <LineChart className="h-5 w-5" />,
    },
  ];

  const trafficStats = [
    { name: "Kunjungan", value: "29,703", percentage: "40%", color: "green" },
    { name: "Unik", value: "24,093", percentage: "20%", color: "blue" },
    { name: "Tampilan Halaman", value: "78,706", percentage: "60%", color: "yellow" },
    { name: "Pengguna Baru", value: "22,123", percentage: "80%", color: "red" },
    { name: "Tingkat Pentalan", value: "Rata-rata (40.15%)", percentage: "40.15%", color: "purple" },
  ];

  const getColorClasses = (color: StatCardProps["color"]) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "red":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getCardBgClass = (color: StatCardProps["color"]) => {
    switch (color) {
      case "blue":
        return "bg-gradient-to-br from-blue-400 to-blue-600";
      case "purple":
        return "bg-gradient-to-br from-purple-400 to-purple-600";
      case "yellow":
        return "bg-gradient-to-br from-yellow-400 to-yellow-600";
      case "red":
        return "bg-gradient-to-br from-red-400 to-red-600";
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-600";
    }
  };

  const getProgressBarColor = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      case "purple":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dasbor</h1>
        <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Ekspor
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className={`${getCardBgClass(stat.color)} rounded-lg shadow-md overflow-hidden text-white`}>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <div className="flex items-center mt-2">
                    {stat.change.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    <span className="text-xs">
                      {stat.change.isPositive ? "+" : "-"}
                      {stat.change.value}
                    </span>
                  </div>
                </div>
                <div className={`${getColorClasses(stat.color).replace("text-", "bg-").replace("bg-", "text-")} p-2 rounded-full`}>{stat.icon}</div>
              </div>
              <div className="mt-4">
                {}
                <div className="flex items-end space-x-1 h-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full bg-white/20 rounded-sm"
                      style={{
                        height: `${Math.max(15, Math.floor(Math.random() * 100))}%`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lalu Lintas</h2>
            <p className="text-sm text-gray-500">Januari - Juli 2023</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setSelectedPeriod("day")} className={`px-3 py-1 text-sm rounded-md ${selectedPeriod === "day" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              Hari
            </button>
            <button onClick={() => setSelectedPeriod("month")} className={`px-3 py-1 text-sm rounded-md ${selectedPeriod === "month" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              Bulan
            </button>
            <button onClick={() => setSelectedPeriod("year")} className={`px-3 py-1 text-sm rounded-md ${selectedPeriod === "year" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              Tahun
            </button>
          </div>
        </div>

        <div className="h-60 mb-8 bg-gray-50 rounded-md p-4">
          {}
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Visualisasi data lalu lintas akan muncul di sini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {trafficStats.map((stat) => (
            <div key={stat.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-700">{stat.name}</p>
                <span className="text-sm text-gray-500">{stat.percentage}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${getProgressBarColor(stat.color)}`} style={{ width: stat.percentage }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "Facebook", color: "bg-blue-600" },
          { name: "Twitter", color: "bg-sky-400" },
          { name: "LinkedIn", color: "bg-blue-800" },
          { name: "Kalender", color: "bg-yellow-500" },
        ].map((social) => (
          <div key={social.name} className={`${social.color} rounded-lg shadow-md p-6 text-white h-32 flex items-center justify-center`}>
            <h3 className="text-xl font-bold">{social.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
