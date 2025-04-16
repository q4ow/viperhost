"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatBytes } from "@/lib/utils";

interface AnalyticsData {
  fileCount: number;
  totalStorage: number;
  storageUsed: number;
  storageLimit: number;
  fileTypeDistribution: { name: string; value: number }[];
  uploadActivity: { date: string; count: number }[];
  downloadActivity: { date: string; count: number }[];
  popularFiles: { name: string; views: number; downloads: number }[];
}

interface AnalyticsTabProps {
  data: AnalyticsData;
  isPro: boolean;
}

export function AnalyticsTab({ data, isPro }: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState("7d");

  const COLORS = [
    "#8b5cf6",
    "#a78bfa",
    "#c4b5fd",
    "#ddd6fe",
    "#ede9fe",
    "#f5f3ff",
  ];

  const storagePercentage = Math.round(
    (data.storageUsed / data.storageLimit) * 100,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.fileCount}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10)}% from last{" "}
              {timeRange === "7d"
                ? "week"
                : timeRange === "30d"
                  ? "month"
                  : "period"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(data.storageUsed)}
            </div>
            <p className="text-xs text-muted-foreground">
              {storagePercentage}% of {formatBytes(data.storageLimit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.popularFiles.reduce((sum, file) => sum + file.views, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to previous{" "}
              {timeRange === "7d"
                ? "week"
                : timeRange === "30d"
                  ? "month"
                  : "period"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.popularFiles.reduce((sum, file) => sum + file.downloads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to previous{" "}
              {timeRange === "7d"
                ? "week"
                : timeRange === "30d"
                  ? "month"
                  : "period"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6 pt-6">
          {/* <Card>
            <CardHeader>
              <CardTitle>Upload & Download Activity</CardTitle>
              <CardDescription>
                File activity over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    uploads: {
                      label: "Uploads",
                      color: "hsl(var(--primary))",
                    },
                    downloads: {
                      label: "Downloads",
                      color: "hsl(var(--muted-foreground))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.uploadActivity.map((item, index) => ({
                        date: item.date,
                        uploads: item.count,
                        downloads: data.downloadActivity[index]?.count || 0,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="uploads"
                        stroke="var(--color-uploads)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="downloads"
                        stroke="var(--color-downloads)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card> */}

          {/* {isPro && (
            <Card>
              <CardHeader>
                <CardTitle>Popular Files</CardTitle>
                <CardDescription>
                  Most viewed and downloaded files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      views: {
                        label: "Views",
                        color: "hsl(var(--primary))",
                      },
                      downloads: {
                        label: "Downloads",
                        color: "hsl(var(--muted-foreground))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.popularFiles}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="views" fill="var(--color-views)" />
                        <Bar
                          dataKey="downloads"
                          fill="var(--color-downloads)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )} */}
        </TabsContent>

        <TabsContent value="files" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>File Type Distribution</CardTitle>
              <CardDescription>Breakdown of your files by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.fileTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.fileTypeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} files`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                Current storage usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Used: {formatBytes(data.storageUsed)}
                    </span>
                    <span className="text-sm font-medium">
                      {storagePercentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${storagePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Storage</span>
                      <span className="font-medium">
                        {formatBytes(data.storageLimit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Used Storage</span>
                      <span className="font-medium">
                        {formatBytes(data.storageUsed)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Available Storage</span>
                      <span className="font-medium">
                        {formatBytes(data.storageLimit - data.storageUsed)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Plan</span>
                      <span className="font-medium">
                        {isPro ? "Pro" : "Free"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
